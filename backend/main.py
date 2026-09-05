from pathlib import Path
import yaml
import time
import json
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fetchers.rss import fetch_rss
from fetchers.github import fetch_github
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "fronted"
CONFIG_DIR = Path(__file__).resolve().parent.parent / "config"
CACHE_DIR = Path(__file__).resolve().parent.parent / "backend" / "cache"


# FR : Fonction qui récupère les données des flux RSS et des dépôts GitHub en fonction des URLs et requêtes spécifiées dans le dictionnaire lu dans le fichier de configuration (feeds.yaml).
# EN : Function that fetches the data of RSS feeds and GitHub repositories based on the URLs and queries specified in the dictionary read from the configuration file (feeds.yaml).
def get_data():
    fichier_cache = CACHE_DIR / "data.json"
    with open(CONFIG_DIR / "feeds.yaml", encoding="utf-8") as f:
        feeds = yaml.safe_load(f)
    if fichier_cache.exists(): # FR : Vérifie si le fichier de cache existe et si son âge est inférieur à 15 minutes (900 secondes). EN : Checks if the cache file exists and if its age is less than 15 minutes (900 seconds).
        age = time.time() - fichier_cache.stat().st_mtime
        if age < 900:
            with open(fichier_cache, encoding="utf-8") as f: # FR : Lit les données du fichier de cache et les retourne. EN : Reads the data from the cache file and returns it.
                return json.load(f)
    
    datas = {"actus-rss": [], "outils-github": []}
    with open(CONFIG_DIR / "dashboard.yaml", encoding="utf-8") as f:
        dashboard_config = yaml.safe_load(f)
    
    nb_actus = next(s["nb_items"] for s in dashboard_config["sections"] if s["cle_donnees"] == "actus-rss")
    nb_outils = next(s["nb_items"] for s in dashboard_config["sections"] if s["cle_donnees"] == "outils-github")
    
    datas_rss = fetch_rss(feeds, nb_actus)
    datas_github = fetch_github(feeds, nb_outils)
    
    datas["actus-rss"] = datas_rss["actus-rss"]
    datas["outils-github"] = datas_github["outils-github"]
    
    CACHE_DIR.mkdir(exist_ok=True, parents=True)
    with open(fichier_cache, "w") as f: # FR : Écrit les données récupérées dans le fichier de cache pour une utilisation ultérieure. EN : Writes the fetched data to the cache file for later use.
        json.dump(datas, f)
    return datas

# FR : Création de l'application FastAPI et définition des endpoints pour récupérer les données du dashboard, la configuration du dashboard et les liens.
# EN : Creation of the FastAPI application and definition of endpoints to fetch dashboard data, dashboard configuration, and links.
app = FastAPI()
@app.get("/api/dashboard")
def endpoint_dashboard():
    return get_data()

@app.get("/api/github-sort")
def endpoint_github_sort(sort: str = "stars"):
    cache_file = CACHE_DIR / f"github_{sort}.json"
    if cache_file.exists():
        age = time.time() - cache_file.stat().st_mtime
        if age < 900:
            with open(cache_file, encoding="utf-8") as f:
                return json.load(f)

    with open(CONFIG_DIR / "feeds.yaml", encoding="utf-8") as f:
        feeds = yaml.safe_load(f)
    with open(CONFIG_DIR / "dashboard.yaml", encoding="utf-8") as f:
        dashboard_config = yaml.safe_load(f)

    nb_outils = next(source["nb_items"] for source in dashboard_config["sections"] if source["cle_donnees"] == "outils-github")

    for source in feeds["categories"]["outils-github"]:
        source["sort"] = sort

    result = fetch_github(feeds, nb_outils)

    CACHE_DIR.mkdir(exist_ok=True, parents=True)
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(result, f)

    return result

@app.get("/api/github-sort-options")
def endpoint_github_sort_options():
    with open(CONFIG_DIR / "feeds.yaml", encoding="utf-8") as f:
        feeds = yaml.safe_load(f)
    return feeds["categories"]["outils-github"][0].get("sort", ["stars"])

@app.get("/api/dashboard-config")
def endpoint_config():
    with open(CONFIG_DIR / "dashboard.yaml", encoding="utf-8") as f:
        return yaml.safe_load(f)

@app.get("/api/links")
def endpoint_links():
    with open(CONFIG_DIR / "links.yaml", encoding="utf-8") as f:
        return yaml.safe_load(f)

FICHIERS_AUTORISES = {"feeds.yaml", "dashboard.yaml", "links.yaml"}
@app.post("/api/import-yaml")
def endpoint_import_yaml(configs:dict):
    for nom_fichier, contenu in configs.items():
        if nom_fichier not in FICHIERS_AUTORISES:
            raise HTTPException(status_code=400, detail=f"Fichier non autorisé : {nom_fichier}")
        with open (CONFIG_DIR / nom_fichier, 'w', encoding="utf-8") as f:
            yaml.safe_dump(contenu, f, allow_unicode=True)
        
    return {"status": "ok"}


BASE_DIR = Path(__file__).resolve().parent 
CHEMIN_EXPORT = BASE_DIR.parent / "config"
@app.get("/api/export-yaml")
def endpoint_export_yaml():
    if not CHEMIN_EXPORT.exists() or not CHEMIN_EXPORT.is_dir():
        raise HTTPException(status_code=500, detail=f"Le répertoire d'export {CHEMIN_EXPORT} n'existe pas ou n'est pas un répertoire.")
    data = {}
    for fichier in CHEMIN_EXPORT.glob("*.y*ml"):
        try:
            with open(fichier, "r", encoding="utf-8") as f:
                    data[fichier.name] = yaml.safe_load(f)
        except yaml.YAMLError as erreur:
            raise HTTPException(status_code=500, detail=f"Erreur lors de la lecture du fichier {fichier.name}: {erreur}")
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"Erreur inattendue lors de la lecture du fichier {fichier.name}: {e2}")
    return data

# FR : Monte le répertoire fronted pour servir les fichiers statiques (HTML, CSS, JS) de l'application front-end.
# EN : Mounts the fronted directory to serve static files (HTML, CSS, JS) of the front-end application.
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="fronted")

# FR : Si le script est exécuté directement, récupère les données et les affiche dans la console.
# EN : If the script is run directly, fetches the data and prints it to the console.
if __name__ == '__main__':
    get_data()
    print(get_data())