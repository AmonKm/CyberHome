import feedparser
from bs4 import BeautifulSoup

def published_parsed(article):
    return article.published_parsed

# FR : Fonction qui nettoie le contenu HTML d'un article RSS.
# EN : Function that cleans the HTML content of an RSS article.
def  nettoyer_html(texte):
    new_txt = texte.replace("\\[", "[").replace("\\]", "]")
    return BeautifulSoup(new_txt, "html.parser").get_text()

# FR : Fonction qui récupère les données des flux RSS en fonction des URLs spécifiées dans le dictionnaire lu dans le fichier de configuration (feeds.yaml).
# EN : Function that fetches the data of RSS feeds based on the URLs specified in the dictionary read from the configuration file (feeds.yaml).
def fetch_rss(data:dict, nb_items:int)->dict:
            
    datas = {"actus-rss":[]}

    for source_actu in data["categories"]["actus-rss"]:
        flux = feedparser.parse(source_actu["url"])
        if flux.bozo or not flux.entries: # FR : Vérifie si le flux RSS est invalide ou vide, le champ bozo est un indicateur. EN : Checks if the RSS feed is invalid or empty, the bozo field is an indicator.
            print(f"Flux RSS invalide ou vide : {source_actu['url']}")
            continue
        flux_trie = sorted(flux.entries, key=published_parsed)
        
        for article in flux_trie[-nb_items:]:
            datas["actus-rss"].append({"title": article.title, "desc": nettoyer_html(article.description),"url": article.link, "published": article.published, "source": source_actu["name"]})

    return datas