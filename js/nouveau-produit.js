import { db } from "./firebase-init.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

async function afficherDernierProduit() {
    try {
        const produitsRef = collection(db, "produits");
        const snapshot = await getDocs(produitsRef);
        
        let dernierProduit = null;
        let lastTimestamp = 0;
        let dernierProduitSansTimestamp = null;

        snapshot.forEach((doc) => {
            const data = doc.data();
            dernierProduitSansTimestamp = data; // Garder une trace au cas où il n'y aurait pas de timestamps
            if (data.createdAt && data.createdAt > lastTimestamp) {
                lastTimestamp = data.createdAt;
                dernierProduit = data;
            }
        });

        // S'il n'y a aucun produit avec createdAt, on prend le dernier trouvé par défaut
        if (!dernierProduit && dernierProduitSansTimestamp) {
            dernierProduit = dernierProduitSansTimestamp;
        }

        if (dernierProduit) {
            const card = document.getElementById('nouveau-produit-card');
            if (card) {
                card.innerHTML = `
                    <span class="badge">Nouveau</span>
                    <div class="product-image">
                        <img src="${dernierProduit.image}" alt="${dernierProduit.nom}">
                    </div>
                    <div class="product-info">
                        <h3>${dernierProduit.nom}</h3>
                        <p class="brand">${dernierProduit.marque}</p>
                        <div class="price">
                            <span class="new-price">${dernierProduit.prix} FCFA</span>
                        </div>
                        <a href="Produits.html" class="product-btn">Voir le produit</a>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du dernier produit :", error);
    }
}

document.addEventListener('DOMContentLoaded', afficherDernierProduit);
