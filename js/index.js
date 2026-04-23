import { db } from "./firebase-init.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

async function chargerDernierProduit() {
    try {
        const produitsRef = collection(db, "produits");
        const snapshot = await getDocs(produitsRef);
        
        let produits = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            data.id = doc.id;
            produits.push(data);
        });

        if (produits.length === 0) return;

        // Trier les produits par date de création (le plus récent en premier)
        // S'il n'y a pas de createdAt (anciens produits), on met 0
        produits.sort((a, b) => {
            const dateA = a.createdAt || 0;
            const dateB = b.createdAt || 0;
            return dateB - dateA; 
        });

        const dernierProduit = produits[0];
        const nouveauProduitCard = document.getElementById("nouveau-produit-card");

        if (nouveauProduitCard && dernierProduit) {
            nouveauProduitCard.innerHTML = `
                <span class="badge">Nouveau</span>
                <div class="product-image">
                    <img src="${dernierProduit.image}" alt="${dernierProduit.nom}">
                </div>
                <div class="product-info">
                    <h3>${dernierProduit.nom}</h3>
                    <p class="brand">${dernierProduit.marque}</p>
                    <p class="category" style="font-size: 12px; color: gray; margin-bottom: 5px;">${dernierProduit.categorie || 'Mixte'}</p>
                    <div class="price">
                        <span class="new-price">${dernierProduit.prix} FCFA</span>
                    </div>
                    <a href="Produits.html" class="product-btn">Voir le produit</a>
                </div>
            `;
        }

    } catch (erreur) {
        console.error("Erreur lors du chargement du dernier produit :", erreur);
    }
}

document.addEventListener("DOMContentLoaded", chargerDernierProduit);
