import { intoHTML_RSS, intoHTML_Github } from './utils.js';
async function Page_Favoris() {
    const reponse = await fetch("/api/favoris");
    const data = await reponse.json();
    const conteneurPrincipal = document.getElementById("favoris-content");
    
    const Vide = data["actus-rss"].length == 0 && data["outils-github"].length == 0;

    if (Vide) {
        const message = document.createElement("p")
        message.textContent = "Vous n'avez pas de favoris"
        message.className = "empty-message"
        conteneurPrincipal.appendChild(message);
        return;
    }

    if (data["actus-rss"].length > 0) {
        const titre = document.createElement("h2");
        titre.textContent = "Actus favorites"
        conteneurPrincipal.appendChild(titre)
        const conteneur = document.createElement("div")
        conteneur.className = "section-container"

        for (const item of data["actus-rss"]) {
            conteneur.appendChild(intoHTML_RSS(item));
        }
        conteneurPrincipal.appendChild(conteneur)
    }
    if (data["outils-github"].length > 0) {
        const titre = document.createElement("h2");
        titre.textContent = "Dépôts GitHub favoris"
        conteneurPrincipal.appendChild(titre)
        const conteneur = document.createElement("div")
        conteneur.className = "section-container"

        for (const item of data["outils-github"]) {
            conteneur.appendChild(intoHTML_Github(item));
        }
        conteneurPrincipal.appendChild(conteneur)
    }
}
Page_Favoris();