import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';
import jsyaml from 'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/+esm';
let sourcesActus = [];
let indexSourceActuelle = 0;
let groupesActus = {};
let titreActus = "";

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
    const data = await reponse.json(); // <- ce sont des données, correction d'une copie de fonction
    return data;
}

/* FR : Cette fonction charge les liens utiles depuis la FastAPI et retourne les données JSON.
EN : This function loads the useful links from the FastAPI and returns the JSON data. */
async function chargerLinks() {
    const reponse = await fetch("/api/links");
    const links = await reponse.json();
    return links;
}


async function exporterYAML() {
    const reponse = await fetch("/api/export-yaml");
    if (!reponse.ok) {
        const erreur = await reponse.json();
        alert(`Erreur lors de l'exportation des fichiers YAML : ${erreur.detail}`);
        return;
    }

    const data = await reponse.json();
    return data;
}
async function importerYAML(event) { // Revoir selon la doc MDN
    const fichier = event.target.files[0];
    if (!fichier) return;

    if (!fichier.name.endsWith(".zip")) {
        alert("Le fichier doît être un .zip !");
        return;
    }
    
    const zip = await JSZip.loadAsync(fichier);
    const configs = {};
    for (const [chemin, fichierzip] of Object.entries(zip.files)) {
        if (fichierzip.dir) continue;

        const nomFichier = chemin.split("/").pop();
        if (!nomFichier.endsWith(".yaml") && !nomFichier.endsWith(".yml")) 
            continue;

        const contenu = await fichierzip.async("string");
        configs[nomFichier] = jsyaml.load(contenu);
    }

        const response = await fetch("/api/import-yaml", {
            method: "POST",
            headers: {"Content-Type": "application/json" },
            body: JSON.stringify(configs)
        });
        if (!response.ok) {
            const erreur = await response.json();
            alert(`Erreur lors de l\'importation des fichiers YAML : ${erreur.detail}`);
            return;
        }

        alert("Importation des fichiers YAML réussie !");
        afficherDashboard();
    }


async function telechargerYAML(data) {
    if (!data) {
        return;
    }
    const zip = new JSZip();
    const dossierConfig = zip.folder("config");
    for (const [nomFichier, contenu] of Object.entries(data)) {
        const yamlContenu = jsyaml.dump(contenu);
        dossierConfig.file(nomFichier, yamlContenu);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const lienTelechargement = document.createElement("a");
    lienTelechargement.href = url;
    lienTelechargement.download = "config.zip";
    document.body.appendChild(lienTelechargement);
    lienTelechargement.click();
    document.body.removeChild(lienTelechargement);
    window.URL.revokeObjectURL(url);
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
    const texteTronque = item.desc.length > 150 ? item.desc.slice(0, 150) + "…" : item.desc;
    desc.textContent = texteTronque;
    desc.className = "card-desc";

    const source = document.createElement("span");
    source.textContent = item.source;
    source.className = "card-source";

    bloc.appendChild(lien);
    bloc.appendChild(desc);
    bloc.appendChild(source);
    return bloc;
}

function grouperParSource(items) {
    const groupes = {};
    for (const item of items) {
        if (!groupes[item.source]) {
            groupes[item.source] = [];
        }
        groupes[item.source].push(item);
    }
    return groupes;
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
        if (section.cle_donnees === "actus-rss") {
            titre.id = "titre-actus";
        }
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
        if (section.cle_donnees === "actus-rss") {
            conteneur.id = "actus-rss-container";
        }

        const items = datas[section.cle_donnees];

        if (section.cle_donnees === "actus-rss") {
            groupesActus = grouperParSource(items);
            sourcesActus = Object.keys(groupesActus);
            indexSourceActuelle = 0;

            if (sourcesActus.length === 0) {
                const message = document.createElement("p");
                message.textContent = "Aucun élément à afficher.";
                conteneur.appendChild(message);
            } else {
                const boutonPrecedent = document.createElement("button");
                boutonPrecedent.textContent = "←";
                boutonPrecedent.className = "nav-arrow";
                boutonPrecedent.addEventListener("click", sourcePrecedente);
                conteneurPrincipal.appendChild(boutonPrecedent);

                const boutonSuivant = document.createElement("button");
                boutonSuivant.textContent = "→";
                boutonSuivant.className = "nav-arrow";
                boutonSuivant.addEventListener("click", sourceSuivante);
                conteneurPrincipal.appendChild(boutonSuivant);

                conteneurPrincipal.appendChild(conteneur);
                titreActus = section.titre;
                afficherGroupeSource();
            }
        } else {
            titre.textContent = section.titre;
            if (items.length === 0) {
                const message = document.createElement("p");
                message.textContent = "Aucun élément à afficher.";
                conteneur.appendChild(message);
            } else {
                for (const item of items) {
                    let bloc;
                    if (section.cle_donnees === "outils-github") {
                        bloc = intoHTML_Github(item);
                    }
                    conteneur.appendChild(bloc);
                }
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
    const inputImporter = document.createElement("input");
    inputImporter.type = "file";
    inputImporter.accept = ".zip";
    inputImporter.style.display = "none";
    inputImporter.addEventListener("change", importerYAML);

    const boutonImporter = document.createElement("button");
    boutonImporter.textContent = "Importer la configuration YAML";    
    boutonImporter.className ="export-button"; // Rappel : changer le nom de la classe :)
    boutonImporter.addEventListener("click", () => inputImporter.click());


    
    
    const boutonExporter = document.createElement("button");
    boutonExporter.addEventListener("click", async () => {
    const dataYAML = await exporterYAML();
    await telechargerYAML(dataYAML);
    });
    boutonExporter.textContent = "Exporter la configuration YAML";
    boutonExporter.className = "export-button";
    conteneurPrincipal.appendChild(conteneurLinks);
    conteneurPrincipal.appendChild(boutonExporter);
    conteneurPrincipal.appendChild(inputImporter);
    conteneurPrincipal.appendChild(boutonImporter);
}

function afficherGroupeSource() {
    const conteneur = document.getElementById("actus-rss-container");
    const titre = document.getElementById("titre-actus");
    conteneur.innerHTML = "";

    const nomSource = sourcesActus[indexSourceActuelle];
    titre.textContent = `${titreActus} : ${nomSource}`;
    
    for (const item of groupesActus[nomSource]) {
        conteneur.appendChild(intoHTML_RSS(item));
    }
}

function sourceSuivante() {
    indexSourceActuelle = (indexSourceActuelle + 1) % sourcesActus.length;
    afficherGroupeSource();
}

function sourcePrecedente() {
    indexSourceActuelle = (indexSourceActuelle - 1 + sourcesActus.length) % sourcesActus.length;
    afficherGroupeSource();
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

// TODO : Commenter le reste des fonctions :D 