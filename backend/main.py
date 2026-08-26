from pathlib import Path
import yaml
import time
import json
from fetchers.rss import fetch_rss
from fetchers.github import fetch_github
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
    datas_rss = fetch_rss(feeds)
    datas_github = fetch_github(feeds)
    
    datas["actus-rss"] = datas_rss["actus-rss"]
    datas["outils-github"] = datas_github["outils-github"]
    
    with open(fichier_cache, "w") as f:
        json.dump(datas, f)
    return datas


if __name__ == '__main__':
    get_data()
    print(get_data())