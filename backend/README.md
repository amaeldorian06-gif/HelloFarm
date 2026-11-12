# Hello Farm Backend MVP (FastAPI)

Ce backend est conçu pour être léger, performant et prêt pour l'intégration d'IA. Il utilise FastAPI pour sa rapidité et Supabase pour une gestion de base de données PostgreSQL temps réel.

## 🚀 Déploiement Rapide (Render / Railway)

1. **Supabase Setup** :
   - Créez un projet sur [Supabase](https://supabase.com).
   - Exécutez le script `supabase_schema.sql` dans l'éditeur SQL de Supabase.
   - Copiez votre `SUPABASE_URL` et `SUPABASE_KEY`.

2. **Configuration** :
   - Créez un fichier `.env` à la racine du dossier `backend/` :
     ```env
     SUPABASE_URL=votre_url_supabase
     SUPABASE_KEY=votre_cle_anon_supabase
     ```

3. **Déploiement sur Render** :
   - Connectez votre repo GitHub.
   - Sélectionnez "Web Service".
   - Runtime : `Python 3.10+`.
   - Build Command : `pip install -r requirements.txt`.
   - Start Command : `uvicorn main:app --host 0.0.0.0 --port $PORT`.
   - Ajoutez les variables d'environnement `SUPABASE_URL` et `SUPABASE_KEY`.

## 🛠️ Structure du Projet

- `main.py` : Point d'entrée de l'API.
- `app/models.py` : Définition des schémas de données (Pydantic).
- `app/database.py` : Client Supabase.
- `app/routes/` : Logique métier par module (Auth, Farms, Marketplace, AI, Payments).

## 📡 Endpoints Principaux

- `POST /auth/register` : Inscription (Agriculteur, Acheteur, Transporteur).
- `POST /auth/login` : Connexion.
- `GET/POST /farms` : Gestion des parcelles.
- `GET/POST /marketplace` : Catalogue de produits.
- `POST /ai/predict-price` : Prédiction de prix via IA (Placeholder).
- `POST /payments/momo` : Initiation de paiements Mobile Money.

## 💡 Recommandation IA

Pour l'intégration de l'IA, utilisez les **Function Calling** de Gemini 1.5 Flash. Ce backend est structuré pour faciliter l'ajout de services d'analyse d'images via Supabase Storage.
