async function chargerconfig() {
    const reponse = await fetch("/api/dashboard-config");
    const config = await reponse.json();
    return config;
}

async function chargerData() {
    const reponse = await fetch("/api/dashboard");
    const config = await reponse.json();
    return config;
}

async function chargerLinks() {
    const reponse = await fetch("/api/links");
    const links = await reponse.json();
    return links;
}

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

async function afficherDashboard() {
    const conteneurPrincipal = document.getElementById("dashboard-content");
    const config = await chargerconfig();
    const datas = await chargerData();

    for (const section of config.sections) {
        const titre = document.createElement("h2");
        titre.textContent = section.titre;
        conteneurPrincipal.appendChild(titre);

        const conteneur = document.createElement("div");
        conteneur.className = "section-container";

        const items = datas[section.cle_donnees];
        for (const item of items) {
            let bloc;
            if (section.cle_donnees === "outils-github") {
                bloc = intoHTML_Github(item);
            } else if (section.cle_donnees === "actus-rss") {
                bloc = intoHTML_RSS(item);
            }
            conteneur.appendChild(bloc);
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

afficherDashboard();