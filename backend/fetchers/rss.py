import feedparser
from bs4 import BeautifulSoup

def published_parsed(article):
    return article.published_parsed

def nettoyer_html(texte):
    new_txt = texte.replace("\\[", "[").replace("\\]", "]")
    return BeautifulSoup(new_txt, "html.parser").get_text()

def fetch_rss(data:dict, nb_items:int)->dict:
            
    datas = {"actus-rss":[]}

    for source_actu in data["categories"]["actus-rss"]:
        flux = feedparser.parse(source_actu["url"])
        if flux.bozo or not flux.entries:
            print(f"Flux RSS invalide ou vide : {source_actu['url']}")
            continue
        flux_trie = sorted(flux.entries, key=published_parsed)
        
        for article in flux_trie[-nb_items:]:
            datas["actus-rss"].append({"title": article.title, "desc": nettoyer_html(article.description),"url": article.link, "published": article.published, "source": source_actu["name"]})

    return datas