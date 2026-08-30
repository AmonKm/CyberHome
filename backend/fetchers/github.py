import requests

# FR : Fonction qui parse les données d'un item GitHub et les mappe dans un dictionnaire avec les clés souhaitées.
# EN : Function that parses the data of a GitHub item and maps it into a dictionary with the desired keys.
def parse_github(item_github: dict) -> dict:
    return {
        "name": item_github["full_name"],
        "owner_url": item_github["owner"]["html_url"],
        "avatar_url": item_github["owner"]["avatar_url"],
        "url": item_github["html_url"],
        "creation": item_github["created_at"],
        "update": item_github["updated_at"]
    }

# FR : Fonction qui récupère les données des dépôts GitHub en fonction des requêtes spécifiées dans le dictionnaire lu dans le fichier de configuration (feeds.yaml).
# EN : Function that fetches the data of GitHub repositories based on the queries specified in the dictionary read from the configuration file (feeds.yaml).
def fetch_github(data: dict, nb_items: int) -> dict:
    datas = {"outils-github": []}
    for source_actu in data["categories"]["outils-github"]:
        try:
            reponse = requests.get(
                "https://api.github.com/search/repositories",
                params={"q": source_actu["query"], "sort": source_actu["sort"], "per_page": nb_items} # FR : Fait la requête souhaitée à l'API GitHub avec un nombre d'items limité. EN : Makes the desired request to the GitHub API with a limited number of items.
            )
            reponse.raise_for_status()
            data_json = reponse.json()
        except requests.RequestException as e:
            print(f"Erreur fetch GitHub : {source_actu['query']}: {e}")
            continue

        for item in data_json["items"]:
            datas["outils-github"].append(parse_github(item)) # FR : Parse les données de l'item GitHub parcouru et les mappe dans un dictionnaire avec les clés souhaitées. EN : Parses the data of the iterated GitHub item and maps it into a dictionary with the desired keys.
    return datas
