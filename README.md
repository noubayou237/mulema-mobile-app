# 📘 Mulema – Guide obligatoire pour les collaborateurs

⚠️ **CE DOCUMENT DOIT ÊTRE LU AVANT TOUTE MODIFICATION DU PROJET**  
Toute personne qui ne respecte pas ces règles met en danger la stabilité du projet.

---

## 🎯 Objectif de ce document
Ce README a pour but :
- d’expliquer clairement **comment le projet Mulema est organisé**
- de définir **comment utiliser Git correctement**
- d’éviter **définitivement** les erreurs de branches, de dépôts imbriqués et de pertes de code

👉 **Aucune excuse du type “je ne savais pas” ne sera acceptée.**

---

## 🏗️ Architecture du projet (à comprendre absolument)

Le projet Mulema est un **MONOREPO**.

👉 **UN projet = UN dépôt Git**  
👉 **PAS de dépôt Git dans `backend/` ou `frontend/`**

### Arborescence officielle
App/
├── backend/ # API – NestJS
├── frontend/ # Application mobile – React Native
├── README.md
├── .gitignore
└── .git/ # SEUL dépôt Git du projet


❌ Il est **INTERDIT** d’exécuter `git init` dans `backend/` ou `frontend/`.

---

## 🌿 Organisation des branches (point critique)

### Branche principale
- `main`
  - Contient **UNIQUEMENT** du code stable
  - **AUCUN développement direct n’est autorisé**

### Branches de travail
- `features/backend-api`
  - Développement **exclusif du backend**
- `features/frontend-ui`
  - Développement **exclusif du frontend**

### Schéma mental à retenir
main
├── features/backend-api
└── features/frontend-ui

⚠️ **Une branche ne correspond PAS à un dossier**  
Une branche correspond à **un contexte de travail global**.

---

## 🧠 Règles fondamentales (à apprendre par cœur)

### RÈGLE 1 — Toujours vérifier sa branche
Avant de coder :
```bash
git status


⚠️ **Une branche ne correspond PAS à un dossier**  
Une branche correspond à **un contexte de travail global**.

---

## 🧠 Règles fondamentales (à apprendre par cœur)

### RÈGLE 1 — Toujours vérifier sa branche
Avant de coder :
```bash
git status

### RÈGLE 2 — Backend ≠ Frontend

Sur features/backend-api :

✔️ Modifier backend/

❌ Toucher frontend/

Sur features/frontend-ui :

✔️ Modifier frontend/

❌ Toucher backend/

Toute violation = erreur grave.

### RÈGLE 3 — On ne développe JAMAIS sur main
❌ Interdit :

git checkout main
# coder
git commit


✔️ Correct :

git checkout features/backend-api

🔁 Workflow OBLIGATOIRE (pas de variation)
1️⃣ Récupérer le projet

git clone https://github.com/TON_USER/TON_REPO.git
cd App

2️⃣ Choisir sa branche

git checkout features/backend-api
# ou
git checkout features/frontend-ui

3️⃣ Travailler UNIQUEMENT dans son périmètre

Backend → backend/

Frontend → frontend/

4️⃣ Vérifier avant chaque commit
git status

5️⃣ Commit clair et propre
git commit -m "feat(backend): description claire"

6️⃣ Push
git push origin features/backend-api

🧪 Vérification rapide (test de maturité Git)

Si vous êtes dans backend/ et que vous tapez :

git status

### Git DOIT répondre avec :

la branche principale du projet

PAS un dépôt isolé

Sinon → problème de configuration

### Discipline d’équipe

Toute erreur de branche doit être signalée immédiatement

Aucun correctif sauvage

En cas de doute : NE RIEN COMMITER

### Message du responsable projet

Git n’est pas un outil de sauvegarde.
Git est un outil de coordination collective.
Une erreur Git peut détruire plusieurs semaines de travail.
