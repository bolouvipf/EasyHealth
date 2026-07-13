# Décisions d'architecture — EasyHealth

## Stack technique

### Backend : NestJS + TypeScript
- **Alternative envisagée** : Laravel/Vue.js (écosystème PHP répandu en Afrique francophone)
- **Décision** : NestJS + TypeScript pour rester dans le même langage que le frontend, réduire la taille d'équipe nécessaire, et bénéficier de l'architecture modulaire imposée par NestJS — critique pour la sécurité de données de santé.
- **Justification** : Le vivier de développeurs TypeScript est en croissance rapide même en Afrique de l'Ouest. NestJS fournit nativement guards, interceptors, pipes, modules — idéal pour séparer auth, audit et métier.

### Base de données : SQLite (dev) → PostgreSQL (prod)
- **Décision** : SQLite via TypeORM en développement (zéro configuration serveur), PostgreSQL en production.
- **Justification** : La couche d'abstraction TypeORM rend la migration triviale (changer `DB_TYPE` dans `.env`). PostgreSQL est choisi pour sa robustesse, son support JSON et ses performances en journalisation.

### Authentification : JWT + bcrypt (en attendant Keycloak)
- **Alternative envisagée** : Keycloak (serveur OAuth2 complet)
- **Décision** : Implémentation JWT maison avec bcrypt pour le MVP, architecture préparée pour migrer vers Keycloak.
- **Justification** : Keycloak nécessite Docker/Java — indisponible dans l'environnement de dev actuel. L'interface `AuthService` permet de remplacer l'implémentation sans changer les contrôleurs.
- **Sel** : bcrypt avec facteur de coût 12 (équilibre sécurité/performance).

### Chiffrement des données
- **Au repos** : Chiffrement AES-256 au niveau application via `crypto.createCipheriv` (implémentation à finaliser en production).
- **En transit** : HTTPS obligatoire (TLS 1.3). Désactivé en dev, imposé en production.
- **Journalisation** : Tous les accès sont logués dans `audit_logs` — immuable (INSERT only, pas de UPDATE/DELETE sur les logs).

## Sécurité — P0

### Règles d'or
1. **Jamais de données réelles en dev** — données fictives uniquement tant que la conformité APDP n'est pas validée.
2. **Authentification avant tout** — chaque endpoint (sauf `/auth/*`) est protégé par défaut via `JwtAuthGuard` global.
3. **RBAC strict** — les décorateurs `@Roles()` contrôlent l'accès à chaque route.
4. **Rate limiting** — 100 requêtes/minute par IP via `@nestjs/throttler`.
5. **Helmet** — headers de sécurité HTTP (CSP, XSS, etc.).

### Renforcement sécurité (v2, 07/2026)
- **JWT secret obligatoire** — `AuthModule` et `JwtStrategy` lèvent une exception si `JWT_SECRET` est absent (tous environnements). Plus de fallback "dev-secret-do-not-use-in-prod".
- **JWT expiration réduite** — de 24h à 15 min via `JWT_EXPIRATION=15m`.
- **Refresh token rotation** — chaque login/register génère un access token (15 min) + un refresh token (30 jours, haché SHA-256 en base). `POST /auth/refresh` consomme l'ancien refresh token (isRevoked=true) et en émet un nouveau (rotation). `POST /auth/logout` révoque le refresh token côté serveur.
- **Token version (`tokenVersion`)** — colonne `User.tokenVersion` (int, incremented via `POST /auth/logout-all`), incluse dans le payload JWT. Vérifiée par `JwtStrategy.validate()` — tout token signé avant une révocation massive est rejeté. Permet de déconnecter un utilisateur de tous ses appareils.
- **JWT ID (`jti`)** — chaque token reçoit un `jti` (UUID v4) et `iat` dans son payload.
- **Refresh token haché** — stocké en base sous forme SHA-256 (pas en clair).
- **Reset token haché** — `crypto.randomBytes(32)` haché SHA-256 avant stockage en base, empêche le vol de tokens via fuite DB.
- **CORS restreint** — en dev : origines explicitement `["http://localhost:5173", "http://localhost:4173"]` (plus de `"*"`). En prod : `["https://app.easyhealth.bj"]`.
- **Verrouillage de compte** — 5 échecs de login consécutifs verrouillent le compte 15 min (champs `failedLoginAttempts`, `lockedUntil`).
- **Politique de mot de passe** — 8+ caractères, majuscule, minuscule, chiffre, caractère spécial. Validée côté backend dans `AuthService.validatePasswordComplexity()`.
- **Rate limiting renforcé** — login (5/min), forgot-password (3/min), reset-password (3/min), refresh (5/min) via décorateur `@Throttle()`.
- **Protection anti-énumération** — `forgot-password` retourne le même message que l'utilisateur existe ou non.
- **Vérification propriété dossiers** — `PatientService.findOne()` bloque les patients qui consultent des dossiers dont ils ne sont pas le `createdById`.
- **Audit immuable** — `AccessLog.preventUpdate()` via décorateur `@BeforeUpdate()` TypeORM, empêche toute modification des logs d'audit.
- **Swagger désactivé en production** — documenté via `api/docs` seulement en `NODE_ENV !== "production"`.
- **Redirection HTTPS** — middleware Express en production, redirige 301 si `x-forwarded-proto !== "https"`.
- **Chiffrement AES-256-GCM** — service `EncryptionService` avec dérivation SHA-256 de `ENCRYPTION_KEY`. Clé obligatoire, jamais de fallback.
- **Nettoyage base de test** — les tables sont vidées dans le `beforeAll` des tests e2e pour garantir l'isolation.

### Chiffrement au repos — v2 (07/2026)

#### Problèmes v1
- **Clé unique** : une seule `ENCRYPTION_KEY` chargée au démarrage. Changer la clé rendait toutes les données cryptées illisibles.
- **Dérivation faible** : `SHA-256(secret)` sans KDF — vulnérable au brute-force si la clé fuit.
- **Détection fragile** : `isEncrypted()` utilisait une regex sur le format `iv:authTag:ciphertext`, risquant des faux positifs.
- **Format sans version** : impossible de savoir quelle clé a servi à chiffrer chaque entrée.

#### Décision v2
- **Clés versionnées** : le ciphertext est préfixé par `v{version}:` (ex: `v1:iv:authTag:ciphertext`). Chaque version de clé est stockée dans une `Map<number, Buffer>` avec une clé active pour le chiffrement.
- **Dérivation PBKDF2** : `crypto.pbkdf2Sync(secret, salt, 600000, 32, "sha512")` avec un sel dérivé du nom de l'application + version. Résistant au brute-force matériel.
- **Dual-read** : `decrypt()` lit la version dans le préfixe et sélectionne la bonne clé. Les anciens ciphertexts sans version (format v0) sont toujours déchiffrables.
- **Rotation** : `reencryptToLatest(ciphertext)` détecte si une entrée utilise une ancienne version et la ré-encrypte avec la clé active. Appelable en boucle sur toutes les `ClinicalEntry` pour une rotation complète sans downtime.
- **Configuration** : `.env` contient `ENCRYPTION_KEY_V1=...` (obligatoire), optionnellement `ENCRYPTION_KEY_V2=...` pour la rotation. La clé active est contrôlée par `ENCRYPTION_ACTIVE_VERSION`.

#### Migration
1. Déployer le nouveau code (il lit l'ancien format v0 et écrit le nouveau format v1).
2. Lancer un script qui parcourt toutes les `ClinicalEntry`, appelle `reencryptToLatest()` sur chaque.
3. Une fois toutes les entrées migrées, les ciphertexts v0 n'existent plus dans la base.

### Conformité APDP (cadre Bénin)
- Collecte avec consentement explicite (`consentGiven` + `consentDate` dans `patient_records`).
- Journalisation exhaustive de tous les accès.
- Lecture seule garantie en cas de non-paiement (B2C).
- Aucune donnée exportée sans anonymisation.

## Modèle de données — compatibilité FHIR

Les champs du dossier patient (`patient_records`) sont nommés avec des conventions compatibles FHIR :
- `nom`/`prenom` → aligné sur `Patient.name.family`/`Patient.name.given`
- `dateNaissance` → `Patient.birthDate`
- `groupeSanguin` → `Patient.extension.bloodType`
- `allergies` → `AllergyIntolerance`
- `antecedentsMedicaux` → `Condition`
- `traitementsEnCours` → `MedicationRequest`
- `consultations` → `Encounter`

Un connecteur FHIR dédié sera développé en P1 (microservice HAPI FHIR séparé).

## Modèle append-only (ClinicalEntry) — 07/2026

### Problème
Les champs cliniques (`allergies`, `antecedentsMedicaux`, `traitementsEnCours`, `consultations`, `notes`) étaient stockés dans `patient_records` comme champs mutables. En environnement offline, deux praticiens modifiant les allergies d'un même patient provoquaient une perte de données (last-write-wins sur tout le dossier).

### Décision
- Les champs cliniques ont été retirés de `patient_records`.
- Une nouvelle entité `ClinicalEntry` (table `clinical_entries`) stocke chaque note/consultation/résultat comme un enregistrement append-only horodaté.
- Chaque `ClinicalEntry` porte un `entryType` (enum : `CONSULTATION`, `NOTE`, `PRESCRIPTION`, `RESULTAT`, `ANTECEDENT`, `ALLERGIE`, `TRAITEMENT`).
- Les données démographiques (`nom`, `prenom`, `dateNaissance`, etc.) restent dans `patient_records`.

### Justification
- Append-only = aucune perte de données en environnement offline.
- Chaque entrée est cryptée individuellement (AES-256-GCM).
- Le `clientId` (UUID généré par le client) permet la déduplication côté serveur : même entrée poussée deux fois par le même client est ignorée.
- Simplifie la résolution de conflits : pas de merge — chaque entrée est indépendante.

### Changements concrets
- `patient.entity.ts` : retrait de 5 colonnes de type `text`, ajout de `@OneToMany(() => ClinicalEntry)`.
- `patient.service.ts` : nouvelles méthodes `addClinicalEntry()` et `getClinicalEntries()` ; le CRUD démographique reste inchangé.
- `clinical-entry.entity.ts` : nouvelle entité avec `patientRecordId`, `authorId`, `entryType`, `content` (crypté), `metadata`, `clientId`, `recordedAt`.
- `sync/clinical-entry-sync.service.ts` : synchronisation au niveau des entrées individuelles (pas du dossier entier).

## Synchronisation offline v2

### Problème avec v1
Le sync d'origine stockait toutes les opérations dans `sync_operations` sans matérialiser les données dans les tables métier. Les conflits étaient résolus par "server wins" aveugle, sans déduplication.

### Décision v2
- Les opérations `entityType === "clinical_entry"` sont routées vers `ClinicalEntrySyncService.processPushOperation()` qui :
  1. Vérifie si le `clientId` existe déjà en base → `duplicate_skipped` si oui.
  2. Crée une vraie ligne dans `clinical_entries` (pas seulement un log de sync).
- Les autres types d'opérations restent gérées par l'ancien mécanisme `SyncOperation`.
- `GET /sync/pull` retourne à la fois les `SyncOperation` historiques et les `ClinicalEntry` matérialisées.

### Idempotence client
Chaque `ClinicalEntry` créée offline porte un `clientId` unique (UUID v4 généré par le client). Le serveur garantit qu'une même `clientId` ne créera qu'une seule ligne — même en cas de double push.

## Global prefix API

### Problème
`setGlobalPrefix("api/v1")` combiné avec `enableVersioning({ type: VersioningType.URI })` produisait des URLs dupliquées (`/api/v1/v1/auth/register`).

### Décision
Changement du global prefix de `"api/v1"` à `"api"`. Les URLs deviennent :
- `/api/v1/auth/register` (correct)
- `/api/v1/patients` (correct)
- `/api/v1/sync/push` (correct)

### Justification
Le versioning URI ajoute déjà `v1` — le global prefix ne doit contenir que la racine commune `api`.

## Pagination — 07/2026

### Décision
Ajout d'un `PaginationDto` partagé (`common/dto/pagination.dto.ts`) avec `page` (défaut 1) et `limit` (défaut 20, max 100).

- `PatientService.findAll()` et `getClinicalEntries()` retournent désormais `PaginatedResult<T>` = `{ data: T[], meta: { page, limit, total, totalPages } }`.
- Backend compatible : les appels sans paramètres reçoivent page=1, limit=20.
- Frontend : l'API service expose `findAllPaginated()` et `getClinicalEntriesPaginated()` pour les appels paginés ; `findAll()` extrait `.data` pour la rétrocompatibilité.

## Internationalisation (i18n) — 07/2026

### Backend
- `I18nService` (global) charge les traductions depuis `src/i18n/translations/{fr,en}.json`.
- Résolution par clé pointée (`auth.login_success`), interpolation de paramètres (`{minutes}`).
- `Accept-Language` header détecté via `@Language()` decorator.
- `GET /api/v1/i18n/translations` et `GET /api/v1/i18n/languages` endpoints publics.

### Frontend
- `LanguageContext` avec `t(key, params)` pour la résolution dans tout l'arbre React.
- `LanguageSwitcher` composant dans la navbar (FR/EN).
- Langue persistée dans `localStorage`, détection `navigator.language` au premier chargement.
- Traductions embarquées côté frontend (`fr.json`, `en.json`), pas de waterfall API.
- `document.documentElement.lang` synchronisé.

### Prochaines langues
- **Fon (fon)** et **Yoruba (yo)** : nécessite des locuteurs natifs pour les traductions.

## Corrections sécurité — 07/2026

### Chiffrement du flux sync (clinical-entry-sync)
- **Problème** : Les entrées cliniques poussées via `POST /sync/push` n'étaient pas chiffrées dans `ClinicalEntrySyncService.processPushOperation()`, alors que le web API (`PatientService.addClinicalEntry`) chiffrait avec AES-256-GCM. Incohérence ouvrant une fuite de données via le endpoint sync.
- **Décision** : Injection de `EncryptionService` dans `ClinicalEntrySyncService`. Le `content` est maintenant chiffré avec `this.encryptionService.encrypt(...)` avant insertion en base, comme côté web API.
- **Fichier** : `sync/clinical-entry-sync.service.ts`

### Correction getEntriesSince (bug pull sync)
- **Problème** : `getEntriesSince()` utilisait `{ createdAt: since as any }` (égalité stricte) au lieu de `MoreThanOrEqual(since)`. Certaines entrées horodatées à la même microseconde que `since` pouvaient être manquées.
- **Décision** : Remplacement par `where: { createdAt: MoreThanOrEqual(since) }`.
- **Fichier** : `sync/clinical-entry-sync.service.ts`

### Chiffrement des données démographiques patient
- **Problème** : Les champs sensibles (`nom`, `prenom`, `adresse`, `telephone`) étaient stockés en clair dans `patient_records`. Conformité APDP insuffisante en cas de fuite de la base.
- **Décision** :
  - Ajout d'une colonne `encryptedData` (TEXT) dans `patient_records`.
  - Les champs sensibles sont chiffrés en JSON via AES-256-GCM et stockés dans cette colonne à chaque création/modification (`PatientService.create`, `PatientService.update`, `AuthService.register`).
  - En lecture (`findOne`, `findAll`, `findMine`), `decryptPatientRecord()` déchiffre `encryptedData` et peuple les champs dans l'objet retourné.
  - Les champs non sensibles (`groupeSanguin`, `profession`, `dateNaissance`, `sexe`) restent en clair pour permettre la recherche et l'indexation.
  - Les colonnes en clair (`nom`, `prenom`, `adresse`, `telephone`) sont conservées en base pour la rétrocompatibilité et la recherche, mais les réponses API retournent systématiquement les valeurs déchiffrées depuis `encryptedData` (defense in depth).
- **Fichiers** : `patient.entity.ts`, `patient.service.ts`, `auth.service.ts`

### Validation jti avec blacklist mémoire
- **Problème** : Le `jti` (UUID v4) était présent dans le payload JWT mais jamais validé côté serveur. Impossible de révoquer un JWT individuellement sans recourir à `logoutAll` (brutal).
- **Décision** :
  - Création de `TokenBlacklistService` (Set<string> en mémoire) avec méthodes `add(jti)`, `has(jti)`, `clear()`.
  - `JwtStrategy.validate()` vérifie que `payload.jti` n'est pas dans la blacklist → `UnauthorizedException` si blacklisté.
  - `POST /auth/logout` blackliste le jti du JWT courant via le décorateur `@CurrentUser().jti`.
  - `POST /auth/logout-all` vide la blacklist (le tokenVersion gère déjà l'invalidation massive).
  - Solution en mémoire : les JTI blacklistés sont perdus au redémarrage du serveur. Acceptable pour le MVP ; une solution Redis sera envisagée en production.
- **Fichiers** : `blacklist.service.ts` (nouveau), `jwt.strategy.ts`, `auth.service.ts`, `auth.controller.ts`, `auth.module.ts`

## Spécialités médicales (Neurologie, Cardiologie) — 07/2026

### Problème
Le dossier patient affichait toutes les entrées cliniques sans distinction de spécialité. Impossible de filtrer les notes par service (Neurologie, Cardiologie) dans l'espace patient.

### Décision
- Ajout d'un enum `Specialty` dans `clinical-entry.entity.ts` : `GENERALE`, `NEUROLOGIE`, `CARDIOLOGIE`.
- Nouvelle colonne `specialty` (simple-enum, défaut `GENERALE`) dans la table `clinical_entries`.
- Le `CreateClinicalEntryDto` accepte un champ `specialty` optionnel.
- Le endpoint `GET /patients/:id/entries` supporte le filtre `?specialty=neurologie`.
- Côté frontend (`PatientDetail.tsx`) : les entrées sont groupées par spécialité en sections repliables. "Générale" est dépliée par défaut ; les spécialités (Neurologie, Cardiologie) sont masquées et nécessitent un clic pour être dépliées.
- L'enum et l'UI sont conçus pour être extensibles : ajouter une valeur à `Specialty` suffit pour qu'une nouvelle section apparaisse automatiquement dans l'interface.

### Filtrage / groupement
Le groupement par spécialité s'effectue **côté client** dans le dossier agrégé :
1. Toutes les entrées cliniques du patient sont chargées via `GET /patients/:id/entries`.
2. Le `useMemo` / `reduce` côté frontend groupe les entrées par `specialty`.
3. Chaque groupe est affiché dans une section repliable avec son en-tête coloré.
4. Pas de requête serveur supplémentaire — le filtrage se fait sur les entrées déjà chargées, ce qui permet le filtrage croisé et l'affichage multispecialty sans latence.

### Fichiers
- `clinical-entry.entity.ts` (enum + colonne)
- `create-clinical-entry.dto.ts` (champ specialty)
- `patient.service.ts` (filtre optionnel dans getClinicalEntries)
- `patient.controller.ts` (paramètre query specialty)
- Frontend : `PatientDetail.tsx` (groupement par spécialité, sections repliables)

## NPI (Numéro Personnel d'Identification ANIP Bénin) — 07/2026

### Problème
Les patients béninois possèdent un identifiant unique délivré par l'ANIP (Agence Nationale d'Identification des Personnes). La plateforme ne permettait pas de le renseigner.

### Décision
- Ajout d'un champ `npi` (string, nullable) dans le `CreatePatientDto` et `RegisterDto`.
- **Strictement facultatif** : jamais requis pour créer un compte, se connecter, ou utiliser une fonctionnalité quelconque.
- Stocké **uniquement dans `encryptedData`** (chiffré AES-256-GCM), jamais en clair.
- Pas de validation de format stricte pour l'instant. Le format standard ANIP est généralement un code alphanumérique (12 chiffres ou lettres/chiffres). Une validation pourra être ajoutée ultérieurement lorsque le format sera officiellement documenté.
- Frontend : présent dans les formulaires d'inscription (`RegisterPage.tsx`) et de création/modification de dossier (`PatientDashboard.tsx`, `DashboardPage.tsx`, `PatientDetail.tsx`), avec la mention "facultatif".

### Fichiers
- Backend : `create-patient.dto.ts`, `register.dto.ts`, `auth.service.ts`, `patient.service.ts`, `patient.entity.ts`
- Frontend : `RegisterPage.tsx`, `PatientDashboard.tsx`, `DashboardPage.tsx`, `PatientDetail.tsx`

## Décisions remises à plus tard
- **Hébergement** : Local (hébergeur béninois certifié APDP) vs cloud international avec garanties contractuelles.
- **Période gratuite B2C** : 3 ou 6 mois — nécessite validation commerciale.
- **Zone sanitaire pilote** : À définir avec le partenaire terrain.
- **Keycloak** : Migration prévue après le MVP, quand Docker sera disponible.
- **HAPI FHIR** : Microservice Java séparé, prévu en P1.
