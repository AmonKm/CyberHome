# CyberHome

![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![YAML](https://img.shields.io/badge/YAML-CB171E?style=flat&logo=yaml&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-e63946?style=flat)
![Status](https://img.shields.io/badge/Status-En%20d%C3%A9veloppement-yellow?style=flat)

CyberHome part d'une envie personnelle : avoir un petit dashboard configurable qui centralise des sources pour se tenir au courant des failles récentes, des nouveaux outils, et de quelques ressources utiles. Tout suivre à un seul endroit, facilement pour faire court :D

Au final j'ai décidé de rendre ce projet public, en me disant que ça pouvait intéresser certaines personnes. (On sait jamais)

## Objectif

Avoir un dashboard très facilement configurable, avec à terme une liste de sources personnalisable, une gestion des actus/outils favoris, et un déploiement simplifié.

## Fonctionnalités actuelles

- Agrégation de flux RSS cyber (alertes CERT-FR, etc.)
- Suivi des dépôts GitHub tendance par topic (`security-tools`)
- Liste de liens et ressources à la main
- Configuration centralisée via des fichiers YAML (sources, layout du dashboard)
- Cache local avec expiration pour limiter les appels

## Stack

- **Backend** : Python (FastAPI)
- **Frontend** : HTML / CSS / JavaScript
- **Configuration** : YAML

## Installation

```bash
git clone https://github.com/AmonKm/CyberHome
cd CyberHome
python -m venv venv
source venv/bin/activate   # ou venv\Scripts\Activate.ps1 sous Windows
pip install -r requirements.txt
```

## Lancement

```bash
cd backend
uvicorn main:app --reload
```

Le dashboard est accessible sur `http://127.0.0.1:8000/`.

## Configuration

Les sources et le layout du dashboard se personnalisent directement dans les fichiers YAML du dossier `config/` :

- `feeds.yaml` : flux RSS et requêtes GitHub à suivre
- `links.yaml` : liens et ressources affichés
- `dashboard.yaml` : structure et ordre des sections du dashboard

## Roadmap

Voir [roadmap.md](./roadmap.md) pour le détail des fonctionnalités prévues.

## Licence

Ce projet est sous licence MIT.

## Auteur

Amon - [GitHub](https://github.com/AmonKm)