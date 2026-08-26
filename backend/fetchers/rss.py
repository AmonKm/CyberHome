from pathlib import Path
import yaml
import time
import json
import feedparser


def published_parsed(article):
    return article.published_parsed


def fetch_rss(data:dict)->dict:
            
    datas = {"actus-rss":[]}

    for source_actu in data["categories"]["actus-rss"]:
        flux = feedparser.parse(source_actu["url"])
        flux_trie = sorted(flux.entries, key=published_parsed)
        
        for article in flux_trie[-5:]:
            datas["actus-rss"].append({"title": article.title, "desc": article.description,"link": article.link, "published": article.published, "source": source_actu["nom"]})

    return datas