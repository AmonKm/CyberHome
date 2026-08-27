from pathlib import Path
import yaml
import time
import json
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fetchers.rss import fetch_rss
from fetchers.github import fetch_github
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "fronted"
CONFIG_DIR = Path(__file__).resolve().parent.parent / "config"
CACHE_DIR = Path(__file__).resolve().parent.parent / "backend" / "cache"

def get_data():
    fichier_cache = CACHE_DIR / "data.json"
    with open(CONFIG_DIR / "feeds.yaml") as f:
        feeds = yaml.safe_load(f)
    if fichier_cache.exists():
        age = time.time() - fichier_cache.stat().st_mtime
        if age < 900:
            with open(fichier_cache) as f:
                return json.load(f)
    
    datas = {"actus-rss": [], "outils-github": []}
    with open(CONFIG_DIR / "dashboard.yaml") as f:
        dashboard_config = yaml.safe_load(f)
    
    nb_actus = next(s["nb_items"] for s in dashboard_config["sections"] if s["cle_donnees"] == "actus-rss")
    nb_outils = next(s["nb_items"] for s in dashboard_config["sections"] if s["cle_donnees"] == "outils-github")
    
    datas_rss = fetch_rss(feeds, nb_actus)
    datas_github = fetch_github(feeds, nb_outils)
    
    datas["actus-rss"] = datas_rss["actus-rss"]
    datas["outils-github"] = datas_github["outils-github"]
    
    with open(fichier_cache, "w") as f:
        json.dump(datas, f)
    return datas

app = FastAPI()
@app.get("/api/dashboard")
def endpoint_dashboard():
    return get_data()

@app.get("/api/dashboard-config")
def endpoint_config():
    with open(CONFIG_DIR / "dashboard.yaml") as f:
        return yaml.safe_load(f)


app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="fronted")
if __name__ == '__main__':
    get_data()
    print(get_data())