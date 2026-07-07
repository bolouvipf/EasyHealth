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

## Synchronisation offline

### Principe
- Chaque appareil mobile maintient une base SQLite locale.
- Les opérations sont horodatées côté client et poussées au serveur via `POST /sync/push`.
- Le serveur applique le principe "last-write-wins" avec résolution de conflits côté serveur.
- `GET /sync/pull?since=<timestamp>` récupère les modifications depuis la dernière synchro.

### Base de données locale (mobile)
- Copie locale des `patient_records` auxquels le professionnel a accès.
- File d'attente des opérations en attente de synchronisation.
- Chiffrement de la base locale (SQLCipher à étudier).

## Décisions remises à plus tard
- **Hébergement** : Local (hébergeur béninois certifié APDP) vs cloud international avec garanties contractuelles.
- **Période gratuite B2C** : 3 ou 6 mois — nécessite validation commerciale.
- **Zone sanitaire pilote** : À définir avec le partenaire terrain.
- **Keycloak** : Migration prévue après le MVP, quand Docker sera disponible.
- **HAPI FHIR** : Microservice Java séparé, prévu en P1.
