from pathlib import Path
import yaml
import feedparser
CONFIG_DIR = Path(__file__).resolve().parent.parent.parent / "config"

with open("config/feeds.yaml") as f:
    feeds = yaml.safe_load(f)

datas = {"actus":[], "outils":[]}
def fetch_rss(data:dict)->dict:
    for source_actu in data["categories"]["actus"]:
        flux = feedparser.parse(source_actu["url"])
        for article in flux.entries[-5:]:
            print(article)

def published_parsed():
    return
    

print(fetch_rss(feeds))
print(feeds)