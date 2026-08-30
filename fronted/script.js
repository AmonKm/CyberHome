/* FR : Cette fonction charge la configuration du dashboard depuis l'API et retourne les données JSON. 
EN : This function loads the dashboard configuration from the API and returns the JSON data. */
async function chargerconfig() {
    const reponse = await fetch("/api/dashboard-config");
    const config = await reponse.json();
    return config;
}

/* FR : Cette fonction charge les données du dashboard depuis l'API et retourne les données JSON.
EN : This function loads the dashboard data from the API and returns the JSON data. */
async function chargerData() {
    const reponse = await fetch("/api/dashboard");
    const config = await reponse.json();
    return config;
}

/* FR : Cette fonction charge les liens utiles depuis la FastAPI et retourne les données JSON.
EN : This function loads the useful links from the FastAPI and returns the JSON data. */
async function chargerLinks() {
    const reponse = await fetch("/api/links");
    const links = await reponse.json();
    return links;
}

/* FR : Cette fonction crée un élément HTML pour un item RSS et retourne le bloc HTML.
EN : This function creates an HTML element for an RSS item and returns the HTML block. */
function intoHTML_RSS(item) {
    const bloc = document.createElement("div");
    bloc.className = "card";

    const lien = document.createElement("a");
    lien.href = item.url;
    lien.textContent = item.title;
    lien.className = "card-titre";

    const desc = document.createElement("p");
    desc.textContent = item.desc;
    desc.className = "card-desc";

    bloc.appendChild(lien);
    bloc.appendChild(desc);
    return bloc;
}

/* FR : Cette fonction crée un élément HTML pour un item de lien utile et retourne le bloc HTML.
EN : This function creates an HTML element for a useful link item and returns the HTML block. */
function intoHTML_Links(item) {
    const bloc = document.createElement("div");
    bloc.className = "card";

    const lien = document.createElement("a");
    lien.href = item.url;
    lien.textContent = item.title;
    lien.className = "card-titre";

    const desc = document.createElement("p");
    desc.textContent = item.desc;
    desc.className = "card-desc";

    bloc.appendChild(lien);
    bloc.appendChild(desc);
    return bloc;
}

/* FR : Cette fonction crée un élément HTML pour un item GitHub et retourne le bloc HTML.
EN : This function creates an HTML element for a GitHub item and returns the HTML block. */
function intoHTML_Github(item) {
    const bloc = document.createElement("div");
    bloc.className = "card card-github";

    const avatar = document.createElement("img");
    avatar.src = item.avatar_url;
    avatar.alt = item.name;
    avatar.className = "repo-avatar";

    const contenu = document.createElement("div");

    const lien = document.createElement("a");
    lien.href = item.url;
    lien.textContent = item.name;
    lien.className = "card-titre";

    contenu.appendChild(lien);
    bloc.appendChild(avatar);
    bloc.appendChild(contenu);

    return bloc;
}
/* FR : Cette fonction affiche le dashboard en chargeant la configuration, les données et les liens, puis en créant les éléments HTML correspondants.
EN : This function displays the dashboard by loading the configuration, data, and links, then creating the corresponding HTML elements. */
async function afficherDashboard() {
    const conteneurPrincipal = document.getElementById("dashboard-content");
    conteneurPrincipal.innerHTML = ""; // vide tout le contenu précédent
    
    const config = await chargerconfig();
    const datas = await chargerData();

    for (const section of config.sections) {
        const titre = document.createElement("h2");
        titre.textContent = section.titre;
        conteneurPrincipal.appendChild(titre);
        if (section.cle_donnees === "outils-github") {
        const reponseOptions = await fetch("/api/github-sort-options");
        const sortOptions = await reponseOptions.json();

        const select = document.createElement("select");
        select.id = "tri-github";
        for (const opt of sortOptions) {
            const option = document.createElement("option");
            option.value = opt;
            option.textContent = opt;
            select.appendChild(option);
        }
        select.addEventListener("change", (e) => changerTriGithub(e.target.value));
        conteneurPrincipal.appendChild(select);
    }

        const conteneur = document.createElement("div");
        conteneur.className = "section-container";
        if (section.cle_donnees === "outils-github") {
            conteneur.id = "outils-github-container";
        }
        const items = datas[section.cle_donnees];
        if (items.length === 0) {
            const message = document.createElement("p");
            message.textContent = "Aucun élément à afficher.";
            conteneur.appendChild(message);
        } else {
            for (const item of items) {
                let bloc;
                if (section.cle_donnees === "outils-github") {
                    bloc = intoHTML_Github(item);
                } else if (section.cle_donnees === "actus-rss") {
                    bloc = intoHTML_RSS(item);
                }
                conteneur.appendChild(bloc);
            }
        }
        conteneurPrincipal.appendChild(conteneur);
    }
    const links = await chargerLinks();
    const titreLinks = document.createElement("h2");
    titreLinks.textContent = "Liens Utiles";
    conteneurPrincipal.appendChild(titreLinks);
    const conteneurLinks = document.createElement("div");
    conteneurLinks.className = "section-container";
    for (const link of links.links) {
        const bloc = intoHTML_Links(link);
        conteneurLinks.appendChild(bloc);
    }
    conteneurPrincipal.appendChild(conteneurLinks);
}

async function changerTriGithub(sort) {
    const reponse = await fetch(`/api/github-sort?sort=${sort}`);
    const data = await reponse.json();
    
    const conteneur = document.getElementById("outils-github-container");
    conteneur.innerHTML = "";
    for (const item of data["outils-github"]) {
        conteneur.appendChild(intoHTML_Github(item));
    }
}

afficherDashboard();

/* FR : Rappel de la fonction afficherDashboard() toutes les 5 minutes pour mettre à jour le contenu du dashboard.
EN : Reminder of the afficherDashboard() function every 5 minutes to update the dashboard content. */
setInterval(afficherDashboard, 5 * 60 * 1000); // FR : A revoir EN : To review