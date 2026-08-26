# Liste des sources à utiliser : 
- IT-connect
- CERT-FR (alertes) / https://www.cert.ssi.gouv.fr/alerte/feed/
- ANSSI actualités
- The Hacker News — https://feeds.feedburner.com/TheHackersNews
- /search/repositories?q=topic:security-tools&sort=stars ..?
- Et suivre les projets comme wazuh + mercator ..

cyberhome/
├── backend/
│   ├── main.py          # FastAPI, routes API
│   ├── fetchers/
│   │   ├── rss.py       # parsing des flux RSS (feedparser)
│   │   └── github.py    # trending via l'API GitHub
│   └── cache/           # données récupérées, stockées en JSON
├── config/
│   ├── feeds.yaml       # liste des flux RSS + métadonnées (titre, catégorie)
│   ├── tools.yaml       # outils curés à la main
│   ├── links.yaml       # tutos/articles curés
│   └── dashboard.yaml   # layout : sections affichées, ordre, nb d'items par section
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js        # fetch les endpoints API et construit le DOM dynamiquement
└── docker-compose.yml