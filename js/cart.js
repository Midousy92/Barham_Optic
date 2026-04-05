// c:\Users\MIDOU\Desktop\Barham-Optic-html\js\cart.js

// Initialisation globale pour que le panier soit accessible depuis le stockage local
let cart = JSON.parse(localStorage.getItem('barham_cart')) || [];

// Le numéro WhatsApp (sans le '+')
const WHATSAPP_NUMBER = "221775197241"; 

document.addEventListener("DOMContentLoaded", () => {
    // 1. Injecter le HTML du panier flottant si non présent
    if (!document.getElementById("cart-floating-btn")) {
        const cartHTML = `
            <!-- Bouton flottant -->
            <div id="cart-floating-btn" class="cart-floating-btn">
                <i class='bx bx-shopping-bag'></i>
                <span id="cart-count">${cart.length}</span>
            </div>

            <!-- Panneau latéral du panier -->
            <div id="cart-sidebar" class="cart-sidebar">
                <div class="cart-header">
                    <h2>Mon Panier</h2>
                    <i class='bx bx-x' id="close-cart"></i>
                </div>
                <div class="cart-items" id="cart-items-container">
                    <!-- Les produits s'afficheront ici -->
                </div>
                <div class="cart-footer">
                    <button id="send-whatsapp-btn" class="whatsapp-btn">
                        <i class='bx bxl-whatsapp'></i> Commander sur WhatsApp
                    </button>
                </div>
            </div>
            
            <!-- Fond grisé quand le panier est ouvert -->
            <div id="cart-overlay" class="cart-overlay"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', cartHTML);
    }

    // 2. Gestion de l'ouverture et fermeture du panier
    const cartBtn = document.getElementById("cart-floating-btn");
    const cartSidebar = document.getElementById("cart-sidebar");
    const closeCart = document.getElementById("close-cart");
    const cartOverlay = document.getElementById("cart-overlay");

    function toggleCart() {
        cartSidebar.classList.toggle("open");
        cartOverlay.classList.toggle("open");
        updateCartUI(); // Met à jour l'affichage au cas où
    }

    cartBtn.addEventListener("click", toggleCart);
    closeCart.addEventListener("click", toggleCart);
    cartOverlay.addEventListener("click", toggleCart);

    // 3. Gestion de l'ajout au panier (Délégation d'événements pour prendre en compte les éléments dynamiques)
    document.body.addEventListener("click", (e) => {
        // Clic sur l'icône ou le texte : on remonte au bouton parent
        const addBtn = e.target.closest('.add-to-cart-btn');
        if (addBtn) {
            e.preventDefault();
            const nom = addBtn.getAttribute("data-nom");
            const marque = addBtn.getAttribute("data-marque");
            const prix = addBtn.getAttribute("data-prix");
            const image = addBtn.getAttribute("data-image");

            ajouterAuPanier({ nom, marque, prix, image });
            
            // Petite animation personnalisée du bouton d'ajout
            const originalText = addBtn.innerHTML;
            addBtn.innerHTML = "<i class='bx bx-check'></i> Ajouté";
            addBtn.style.backgroundColor = "#ffd401";
            addBtn.style.color = "white";
            addBtn.style.borderColor = "#ffd401";
            
            setTimeout(() => {
                addBtn.innerHTML = originalText;
                addBtn.style.backgroundColor = ""; 
                addBtn.style.color = "";
                addBtn.style.borderColor = "";
            }, 1000);
        }
    });

    // 4. Fonction pour ajouter au panier
    function ajouterAuPanier(produit) {
        // Vérifier si déjà dans le panier
        const index = cart.findIndex(p => p.nom === produit.nom && p.marque === produit.marque);
        if (index === -1) {
            cart.push(produit); // Ajout si inexistant
        } else {
            alert("Cet article est déjà dans votre panier.");
            return;
        }
        
        sauvegarderPanier();
        updateCartUI();

        // Animation du bouton flottant pour attirer l'attention
        cartBtn.classList.add("bounce");
        setTimeout(() => cartBtn.classList.remove("bounce"), 500);
    }

    // 5. Mettre à jour l'UI du panier
    function updateCartUI() {
        document.getElementById("cart-count").innerText = cart.length;
        const container = document.getElementById("cart-items-container");
        container.innerHTML = "";

        if (cart.length === 0) {
            container.innerHTML = "<p class='empty-cart-msg'>Votre panier est vide.</p>";
            return;
        }

        cart.forEach((produit, index) => {
            container.innerHTML += `
                <div class="cart-item">
                    <img src="${produit.image}" alt="${produit.nom}">
                    <div class="cart-item-info">
                        <h4>${produit.nom}</h4>
                        <p>${produit.marque}</p>
                        <span>${produit.prix} FCFA</span>
                    </div>
                    <i class='bx bx-trash remove-item' data-index="${index}"></i>
                </div>
            `;
        });

        // Supprimer du panier
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener("click", (e) => {
                const index = e.target.getAttribute("data-index");
                cart.splice(index, 1);
                sauvegarderPanier();
                updateCartUI();
            });
        });
    }

    // 6. Sauvegarder dans localStorage
    function sauvegarderPanier() {
        localStorage.setItem('barham_cart', JSON.stringify(cart));
    }

    // 7. Validation et envois sur WhatsApp
    document.getElementById("send-whatsapp-btn").addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Votre panier est vide !");
            return;
        }

        let message = "Bonjour Barham Optic, je souhaite commander les articles de ma sélection :%0A%0A";
        
        cart.forEach((p, i) => {
            message += `${i + 1}. *${p.nom}* (${p.marque}) - ${p.prix} FCFA%0A`;
        });
        
        message += "%0AMerci de m'informer de leur disponibilité.";

        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
        window.open(url, "_blank");
        
        // Optionnel : Vider le panier après commande si on le souhaite
        // cart = [];
        // sauvegarderPanier();
        // updateCartUI();
        // toggleCart();
    });

    // Premier rendu au chargement
    updateCartUI();
});
