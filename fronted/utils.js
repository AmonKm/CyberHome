export async function Star_src(categorie, item) {
    try {
        const response = await fetch('/api/favoris', {
            method: 'POST' ,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({categorie: categorie, item: item }) 
        });

        if (!response.ok) {
            throw new Error("Erreur de la sauvegarde des favoris côté serveur")
        }

        const result = await response.json()
        console.log("Sauvegarde réussie :", result.message);
    }   catch (error) {
        console.error("Impossible de sauvegarder l'élément :", error);
    }
}
/* FR : Cette fonction crée un élément HTML pour un item RSS et retourne le bloc HTML.
EN : This function creates an HTML element for an RSS item and returns the HTML block. */
export function intoHTML_RSS(item, estFavori = false) { // Voir si fav, à implémenter
    const bloc = document.createElement("div");
    bloc.className = "card";

    const btnStar = document.createElement("button");
    btnStar.className = "btn-star";
    btnStar.setAttribute("aria-label", "Ajouter aux favoris");

    const star = document.createElement("span");
    star.textContent = "☆";
    star.className = "star-icon";

    btnStar.appendChild(star);

    btnStar.addEventListener('click', (evenement) => {
        evenement.preventDefault();
        const estActif = star.textContent === "★";
        star.textContent = estActif ? "☆" : "★";
        Star_src("actus-rss",item);
    });

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

    bloc.appendChild(btnStar);
    bloc.appendChild(lien);
    bloc.appendChild(desc);
    bloc.appendChild(source);
    return bloc;
}

/* FR : Cette fonction crée un élément HTML pour un item GitHub et retourne le bloc HTML.
EN : This function creates an HTML element for a GitHub item and returns the HTML block. */
export function intoHTML_Github(item) {
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