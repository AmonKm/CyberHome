import requests

def parse_github(item_github:dict)->dict:
    return {"name":item_github["full_name"], "owner_url":item_github["owner"]["html_url"],"url":item_github["html_url"],"creation":item_github["created_at"],"update":item_github["updated_at"]}


def fetch_github(data:dict)->dict:
    datas = {"outils-github":[]}
    for source_actu in data["categories"]["outils-github"]:
        reponse = requests.get("https://api.github.com/search/repositories", params={"q": source_actu["query"], "sort": "stars", "per_page": 5})
        data_json = reponse.json()
        for item in data_json["items"]:
            datas["outils-github"].append(parse_github(item))
    return datas

