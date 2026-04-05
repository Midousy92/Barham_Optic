// c:\Users\MIDOU\Desktop\Barham-Optic-html\js\produits.js

// 1. On importe la connexion à notre base de données depuis l'autre fichier
import { db } from "./firebase-init.js";

// 2. On importe les outils de Firebase pour lire les données
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Fonction principale pour récupérer et afficher les lunettes
async function chargerProduits() {
    try {
        console.log("⏳ Récupération des lunettes depuis Firebase...");

        // On cible ta collection "produits" dans Firebase
        const produitsRef = collection(db, "produits");
        
        // On demande à Firebase de nous donner tous les documents (produits)
        const snapshot = await getDocs(produitsRef);
        
        console.log(`✅ ${snapshot.size} produit(s) trouvé(s) dans Firebase !`);

        // On cherche l'endroit exact dans ton HTML où insérer les lunettes (sans supprimer les tiennes)
        const conteneurHTML = document.querySelector(".products-container");

        if (!conteneurHTML) {
            console.error("Erreur : Impossible de trouver la zone .products-container dans ton HTML.");
            return;
        }

        // Pour Gérer les boutons dynamiques de marques
        const filterContainer = document.querySelector(".filter-container");
        const existingFilters = new Set();
        
        if (filterContainer) {
            filterContainer.querySelectorAll(".filter-btn").forEach(btn => {
                existingFilters.add(btn.getAttribute("data-filter").toLowerCase());
            });
        }

        // Pour chaque produit trouvé dans Firebase...
        snapshot.forEach((doc) => {
            const produit = doc.data(); // les infos de la lunette (nom, marque, prix, image)

            // Création de bouton si la marque n'existe pas encore
            if (produit.marque && filterContainer) {
                const marqueLower = produit.marque.toLowerCase().trim();
                if (!existingFilters.has(marqueLower)) {
                    const btnHtml = `<button class="filter-btn" data-filter="${marqueLower}">${produit.marque}</button>`;
                    filterContainer.insertAdjacentHTML('beforeend', btnHtml);
                    existingFilters.add(marqueLower);
                }
            }

            // On recrée EXACTEMENT ta structure HTML, mais avec les données de Firebase.
            // J'ai ajouté un petit texte "Nouveau" pour que tu le reconnaisses par rapport aux tiens.
            const carteHTML = `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${produit.image}" alt="${produit.nom}">
                    </div>
                    <div class="product-info">
                        <h3>${produit.nom}</h3>
                        <p class="brand">${produit.marque}</p>
                        <div class="price">
                            <span class="new-price">${produit.prix} FCFA</span>
                        </div>
                        <button class="product-btn add-to-cart-btn" data-nom="${produit.nom}" data-marque="${produit.marque}" data-prix="${produit.prix}" data-image="${produit.image}">
                            <i class='bx bx-cart-add'></i> Ajouter au panier
                        </button>
                    </div>
                </div>
            `;

            // Ajoute cette nouvelle carte à la fin de tes propres cartes HTML (insertAdjacentHTML ne supprime rien !)
            conteneurHTML.insertAdjacentHTML('beforeend', carteHTML);
        });

    } catch (erreur) {
        console.error("Erreur lors de la récupération des données :", erreur);
    }
}

// On lance la fonction
chargerProduits();

// =========================================================
// LOGIQUE DE FILTRES ET RECHERCHE AVANCÉE
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const priceDropdown = document.getElementById("price-dropdown");
    const filterContainer = document.querySelector(".filter-container");
    const productsContainer = document.querySelector(".products-container");

    function applyAllFilters() {
        if (!productsContainer) return;

        // Récupérer les 3 valeurs actuelles des filtres
        const searchText = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const priceValue = priceDropdown ? priceDropdown.value : "tous";
        
        const activeBtn = document.querySelector(".filter-btn.active");
        const activeBrand = activeBtn ? activeBtn.getAttribute("data-filter").toLowerCase() : "toutes";

        const products = document.querySelectorAll(".product-card");

        products.forEach(product => {
            const titleElement = product.querySelector("h3");
            const brandElement = product.querySelector(".brand");
            const priceElement = product.querySelector(".new-price");

            // 1. Filtre par Texte (Nom ou Marque)
            let matchesSearch = true;
            if (searchText !== "") {
                const titleText = titleElement ? titleElement.textContent.toLowerCase() : "";
                const brandText = brandElement ? brandElement.textContent.toLowerCase() : "";
                matchesSearch = titleText.includes(searchText) || brandText.includes(searchText);
            }

            // 2. Filtre par Bouton de Marque
            let matchesBrand = true;
            if (activeBrand !== "toutes") {
                const brandText = brandElement ? brandElement.textContent.toLowerCase() : "";
                matchesBrand = brandText.includes(activeBrand);
            }

            // 3. Filtre par Tranche de Prix
            let matchesPrice = true;
            if (priceValue !== "tous" && priceElement) {
                // Extraire uniquement les nombres (enlever "FCFA" et espaces)
                const priceMatch = priceElement.textContent.replace(/\s+/g, '').match(/\d+/);
                if (priceMatch) {
                    const price = parseInt(priceMatch[0], 10);
                    
                    if (priceValue === "under_50000" && price >= 50000) matchesPrice = false;
                    if (priceValue === "50000_150000" && (price < 50000 || price > 150000)) matchesPrice = false;
                    if (priceValue === "above_150000" && price <= 150000) matchesPrice = false;
                }
            }

            // Application de la visibilité
            if (matchesSearch && matchesBrand && matchesPrice) {
                product.style.display = "block";
            } else {
                product.style.display = "none";
            }
        });
    }

    // ÉCOUTEURS D'ÉVÉNEMENTS
    
    // a. Saisie dans la barre de recherche (en temps réel)
    if (searchInput) {
        searchInput.addEventListener("input", applyAllFilters);
    }

    // b. Choix dans le menu déroulant des prix
    if (priceDropdown) {
        priceDropdown.addEventListener("change", applyAllFilters);
    }

    // c. Clic sur un bouton de la catégorie de marque
    if (filterContainer) {
        filterContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("filter-btn")) {
                // Changer le bouton actif visuellement
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");
                // Appliquer les nouveaux filtres
                applyAllFilters();
            }
        });
    }

    // d. Observation de Firebase : Quand Firebase charge de nouveaux produits, on relance le filtre !
    if (productsContainer) {
        const observer = new MutationObserver(() => {
            applyAllFilters();
        });
        observer.observe(productsContainer, { childList: true });
    }
});
