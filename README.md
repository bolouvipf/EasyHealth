# EasyHealth — Dossier de Santé partagé (DSE)

Plateforme de référence du dossier de santé partagé au Bénin, connectant établissements publics et privés autour d'un registre patient sécurisé, interopérable et conforme.

## Stack

| Couche | Technologie |
|--------|------------|
| Backend | NestJS + TypeScript |
| Base de données | SQLite (dev) → PostgreSQL (prod) via TypeORM |
| Authentification | JWT + bcrypt (préparé pour Keycloak) |
| Frontend Web | React + Vite + TypeScript |
| Mobile | Flutter (P2) |
| Interopérabilité | HAPI FHIR (P1) |

## Prérequis

- Node.js ≥ 22
- npm ou bun

## Installation

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Développement

```bash
# Backend (API sur http://localhost:3000)
cd backend && npm run dev

# Frontend (UI sur http://localhost:5173)
cd frontend && npm run dev
```

Documentation Swagger : `http://localhost:3000/api/docs`

## Tests

```bash
cd backend && npm test           # tests unitaires
npm run test:e2e                # tests e2e (11 tests — auth, RBAC, partage, rate-limit)
```

## Architecture (P0 — MVP)

```
POST /api/v1/auth/register      # Inscription
POST /api/v1/auth/login         # Connexion
GET/POST/PUT/DELETE /patients   # CRUD dossiers patients
POST /sharing/generate          # Générer code temporaire (patient)
POST /sharing/access            # Accéder via code (professionnel)
GET  /audit                     # Journalisation (admin)
GET  /professionals/pending     # Vérifications en attente (admin)
```

## Sécurité (conformité APDP)

- Consentement explicite tracé pour chaque dossier
- Chiffrement au repos (AES-256) et en transit (TLS 1.3)
- Journalisation immuable de tous les accès
- RBAC strict (6 rôles : patient, médecin, infirmier, agent communautaire, administratif, admin)
- Rate limiting : 100 req/min
- Headers de sécurité HTTP (Helmet)

## Décisions d'architecture

Voir `DECISIONS.md` pour l'ensemble des choix motivés (stack, base de données, offline, FHIR, etc.).

## Contexte

Projet ciblant le marché béninois dans le cadre du Plan National de Développement Sanitaire 2026-2030. Voir `docs/cadrage.md` pour le dossier de cadrage complet.
