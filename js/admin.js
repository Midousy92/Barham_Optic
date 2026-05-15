// c:\Users\MIDOU\Desktop\Barham-Optic-html\js\admin.js

import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";


// L'unique adresse email autorisée à accéder au panel d'administration classique (Produits)
const ADMIN_EMAIL = "barhamoptic70@gmail.com";

let currentProducts = [];

// 1. Protection de la page : Vérifier l'accès et charger les produits
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Rediriger vers la connexion si non connecté
        alert("Accès refusé. Vous devez être connecté.");
        window.location.href = "connection.html";
    } else if (user.email !== ADMIN_EMAIL) {
        // Bloquer si l'email ne correspond pas à l'administrateur
        alert("Accès refusé. Cette page est strictement réservée à l'administrateur.");
        window.location.href = "index.html"; // Redirection vers le site public
    } else {
        // L'Auth est validée et c'est le bon user, on charge le dashboard !
        chargerProduits();
    }
});

// 2. Déconnexion
document.getElementById('logout-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await signOut(auth);
        window.location.href = "connection.html";
    } catch (error) {
        console.error("Erreur de déconnexion", error);
    }
});

// 3. Récupérer et afficher la liste complète des produits
const tableBody = document.getElementById('admin-products-table');

async function chargerProduits() {
    tableBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Chargement des données...</td></tr>";
    try {
        const querySnapshot = await getDocs(collection(db, "produits"));
        currentProducts = [];
        tableBody.innerHTML = "";
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Aucun produit trouvé dans la base de données.</td></tr>";
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            data.id = docSnap.id; // L'identifiant Firestore
            currentProducts.push(data);
            
            // Format status for table
            let statutText = "<span style='color: #2ecc71'>🟢 En Stock</span>";
            if (data.status === "epuise") statutText = "<span style='color: #e74c3c'>🔴 Épuisé</span>";
            if (data.status === "masque") statutText = "<span style='color: gray'>👁️‍🗨️ Masqué</span>";

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${data.image}" alt="${data.nom}"></td>
                <td>${data.nom} <br><small style="color:gray;">${data.categorie || 'Non spécifié'}</small></td>
                <td><span style="background:#ecf0f1; border-radius:5px; padding:3px 8px; font-size:12px;">${data.marque}</span></td>
                <td><b>${data.prix} FCFA</b></td>
                <td>${statutText}</td>
                <td>
                    <button class="btn-edit" onclick="editerProduit('${data.id}')" title="Modifier"><i class='bx bx-edit'></i></button>
                    <button class="btn-delete" onclick="supprimerProduit('${data.id}')" title="Supprimer"><i class='bx bx-trash'></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
        tableBody.innerHTML = `<tr><td colspan='5' style='text-align:center; color:red;'><b>Erreur exacte de Firebase :</b> ${error.message}<br><br><small>Rechargez la page avec Ctrl+F5 pour être sûr, ou vérifiez vos règles Firestore si c'est une erreur de permission.</small></td></tr>`;
    }
}

// -------------------------------------------------------------
// GESTION DES ONGLETS, RENDEZ-VOUS ET COMMANDES
// -------------------------------------------------------------
const tabProduits = document.getElementById('tab-produits');
const tabRdv = document.getElementById('tab-rdv');
const tabCommandes = document.getElementById('tab-commandes');

const sectionProduits = document.getElementById('section-produits');
const sectionRdv = document.getElementById('section-rdv');
const sectionCommandes = document.getElementById('section-commandes');

const rdvTableBody = document.getElementById('admin-rdv-table');
const commandesTableBody = document.getElementById('admin-commandes-table');

let currentRendezVous = []; // Garder une trace globale pour gérer l'envoi d'emails

function clearTabs() {
    tabProduits.classList.remove('active');
    tabRdv.classList.remove('active');
    tabCommandes.classList.remove('active');
    sectionProduits.style.display = 'none';
    sectionRdv.style.display = 'none';
    sectionCommandes.style.display = 'none';
}

tabProduits.addEventListener('click', (e) => {
    e.preventDefault();
    clearTabs();
    tabProduits.classList.add('active');
    sectionProduits.style.display = 'block';
});

tabRdv.addEventListener('click', (e) => {
    e.preventDefault();
    clearTabs();
    tabRdv.classList.add('active');
    sectionRdv.style.display = 'block';
    chargerRendezVous();
});

tabCommandes.addEventListener('click', (e) => {
    e.preventDefault();
    clearTabs();
    tabCommandes.classList.add('active');
    sectionCommandes.style.display = 'block';
    chargerCommandes();
});

async function chargerRendezVous() {
    rdvTableBody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Chargement des rendez-vous...</td></tr>";
    try {
        const querySnapshot = await getDocs(collection(db, "rendezvous"));
        rdvTableBody.innerHTML = "";
        
        if (querySnapshot.empty) {
            rdvTableBody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Aucun rendez-vous planifié.</td></tr>";
            return;
        }

        // Pour trier du plus proche au plus lointain
        currentRendezVous = [];
        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            data.id = docSnap.id;
            currentRendezVous.push(data);
        });

        // Tri par date
        currentRendezVous.sort((a, b) => new Date(a.date) - new Date(b.date));

        currentRendezVous.forEach((data) => {
            const dateStr = new Date(data.date).toLocaleDateString('fr-FR');
            
            // Format de la pastille du statut
            let badgeBg = "#f1c40f"; // jaune par defaut
            let textColor = "#000";
            if (data.statut === "Confirmé") { badgeBg = "#ffd401"; textColor = "#000"; }
            if (data.statut === "Terminé") { badgeBg = "#95a5a6"; textColor = "#fff"; }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>${dateStr}</b><br><span style="color:#e74c3c;">${data.heure}</span></td>
                <td>${data.nom}</td>
                <td><i class='bx bxs-phone'></i> ${data.telephone}<br><small>${data.email !== "Non fourni" ? data.email : ""}</small></td>
                <td><i>${data.motif}</i><br><small style="color:gray;">Notes: ${data.notes}</small></td>
                <td><span style="background:${badgeBg}; color:${textColor}; padding:4px 8px; border-radius:12px; font-size:12px;">${data.statut}</span></td>
                <td style="display: flex; flex-direction: column; gap: 4px; align-items: center; justify-content: center;">
                    <button class="rdv-action-btn confirm-btn" onclick="changerStatutRdv('${data.id}', 'Confirmé')" title="Confirmer"><i class='bx bx-check'></i></button>
                    <button class="rdv-action-btn delete-btn" onclick="supprimerRendezVous('${data.id}')" title="Supprimer / Annuler"><i class='bx bx-trash'></i></button>
                </td>
            `;
            rdvTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erreur RDV:", error);
        rdvTableBody.innerHTML = `<tr><td colspan='6' style='text-align:center; color:red;'>Erreur de chargement.</td></tr>`;
    }
}

window.supprimerRendezVous = async function(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer / annuler ce rendez-vous ?")) {
        try {
            await deleteDoc(doc(db, "rendezvous", id));
            chargerRendezVous();
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors de la suppression.");
        }
    }
}

window.changerStatutRdv = async function(id, nouveauStatut) {
    // Si c'est une confirmation, on personnalise le message
    const confirmMessage = nouveauStatut === "Confirmé" ? 
        "Marquer ce rendez-vous comme Confirmé et prévenir le client par email ?" : 
        "Changer le statut du rendez-vous ?";
        
    if (confirm(confirmMessage)) {
        try {
            await updateDoc(doc(db, "rendezvous", id), { statut: nouveauStatut });
            
            // On récupère les infos du client depuis notre variable globale
            const rdv = currentRendezVous.find(r => r.id === id);
            
            // Si le statut est validé et que le client a une adresse email valide
            if (nouveauStatut === "Confirmé" && rdv && rdv.email && rdv.email !== "Non fourni") {
                const subject = encodeURIComponent("Confirmation de votre Rendez-vous | Barham Optic");
                const bodyMsg = `Bonjour ${rdv.nom},\n\nNous avons le plaisir de vous confirmer votre rendez-vous chez Barham Optic le ${new Date(rdv.date).toLocaleDateString('fr-FR')} à ${rdv.heure}.\n\nPour toute modification, n'hésitez pas à nous contacter.\n\nÀ très bientôt,\nL'équipe Barham Optic.`;
                const body = encodeURIComponent(bodyMsg);
                
                // Cela ouvre par exemple Gmail pre-rempli avec ces informations
                window.location.href = `mailto:${rdv.email}?subject=${subject}&body=${body}`;
            } else if (nouveauStatut === "Confirmé") {
                alert(`Le client n'a pas fourni d'adresse email. Pensez à l'appeler au ${rdv.telephone} pour confirmer !`);
            }

            chargerRendezVous();
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors du changement de statut.");
        }
    }
}

// -------------------------------------------------------------
// GESTION DES COMMANDES (NOUVEAU)
// -------------------------------------------------------------
async function chargerCommandes() {
    commandesTableBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Chargement des commandes...</td></tr>";
    try {
        const querySnapshot = await getDocs(collection(db, "commandes"));
        commandesTableBody.innerHTML = "";
        
        if (querySnapshot.empty) {
            commandesTableBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Aucune commande en attente.</td></tr>";
            return;
        }

        const commandes = [];
        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            data.id = docSnap.id;
            commandes.push(data);
        });

        // Tri chronologique : plus récentes en haut
        commandes.sort((a, b) => {
            let dateA = new Date(0);
            if (a.date) dateA = typeof a.date.toDate === 'function' ? a.date.toDate() : new Date(a.date);
            
            let dateB = new Date(0);
            if (b.date) dateB = typeof b.date.toDate === 'function' ? b.date.toDate() : new Date(b.date);
            
            return dateB - dateA;
        });

        commandes.forEach((data) => {
            let dateStr = "-";
            if (data.date) {
                if (typeof data.date.toDate === 'function') {
                    dateStr = data.date.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });
                } else {
                    dateStr = new Date(data.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' });
                }
            }
            
            let badgeBg = "#f39c12"; // Orange (En attente)
            let textColor = "#fff";
            if (data.status === "Validée") { badgeBg = "#2ecc71"; textColor = "#fff"; }
            if (data.status === "Livrée") { badgeBg = "#3498db"; textColor = "#fff"; }

            const totalPrix = data.articles ? data.articles.reduce((sum, item) => sum + parseInt((item.prix || 0).toString().replace(/\s+/g, '') || 0), 0) : 0;
            
            let articlesHtml = "<ul style='padding-left:15px; font-size:12px; margin:0;'>";
            if (data.articles) {
                data.articles.forEach(art => { articlesHtml += `<li>${art.nom} (${art.marque})</li>`; });
            }
            articlesHtml += "</ul>";

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>${dateStr}</b></td>
                <td><small style="color:gray;">ID Patient :</small><br> ${data.userId ? data.userId.substring(0, 8) : "Invité"}</td>
                <td>${articlesHtml}<b>Total: ${totalPrix} FCFA</b></td>
                <td><span style="background:${badgeBg}; color:${textColor}; padding:4px 8px; border-radius:12px; font-size:12px;">${data.status || 'En attente'}</span></td>
                <td style="display: flex; flex-direction: row; gap: 8px; align-items: center; justify-content: center; height: 100%;">
                    <button class="btn-edit" style="background:#2ecc71; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; font-size:16px;" onclick="changerStatutCommande('${data.id}', 'Validée')" title="Valider la commande"><i class='bx bx-check-double'></i></button>
                    <button class="btn-edit" style="background:#3498db; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; font-size:16px;" onclick="changerStatutCommande('${data.id}', 'Livrée')" title="Marquer comme Livrée"><i class='bx bx-package'></i></button>
                </td>
            `;
            commandesTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erreur Commandes:", error);
        commandesTableBody.innerHTML = `<tr><td colspan='5' style='text-align:center; color:red;'><b>Erreur exacte :</b> ${error.message}</td></tr>`;
    }
}

window.changerStatutCommande = async function(id, nouveauStatut) {
    if (confirm(`Voulez-vous passer cette commande au statut : ${nouveauStatut} ?`)) {
        try {
            await updateDoc(doc(db, "commandes", id), { status: nouveauStatut });
            chargerCommandes();
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors du changement de statut.");
        }
    }
}




// 4. Gestion de la Fenêtre Modale (Popup)
const modal = document.getElementById('product-modal');
const form = document.getElementById('product-form');

window.openModal = function() {
    form.reset();
    document.getElementById('product-id').value = "";
    document.getElementById('existing-image-url').value = "";
    document.getElementById('modal-title').innerText = "Nouveau Produit";
    document.getElementById('current-image-preview').innerHTML = "";
    modal.style.display = 'flex';
}

window.closeModal = function() {
    modal.style.display = 'none';
}

// Aperçu en direct de l'image sélectionnée
const imageInput = document.getElementById('product-image-file');
const imagePreviewContainer = document.getElementById('current-image-preview');

imageInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreviewContainer.innerHTML = `<p style="font-size:12px; color:#7f8fa6;">Nouvelle image prête à être uploadée :</p><img src="${e.target.result}" alt="Aperçu" style="max-width: 100px; max-height: 100px; border-radius: 5px; margin-bottom: 10px;">`;
        }
        reader.readAsDataURL(file);
    } else {
        const existingUrl = document.getElementById('existing-image-url').value;
        if (existingUrl) {
            imagePreviewContainer.innerHTML = `<p style="font-size:12px; color:#7f8fa6;">Image actuelle :</p><img src="${existingUrl}" alt="Actuelle" style="max-width: 100px; max-height: 100px; border-radius: 5px; margin-bottom: 10px;">`;
        } else {
            imagePreviewContainer.innerHTML = '';
        }
    }
});

// 5. Remplir le formulaire pour modification
window.editerProduit = function(id) {
    const produit = currentProducts.find(p => p.id === id);
    if (!produit) return;

    document.getElementById('product-id').value = id;
    document.getElementById('product-name').value = produit.nom;
    document.getElementById('product-brand').value = produit.marque;
    document.getElementById('product-category').value = produit.categorie || "";
    document.getElementById('product-status').value = produit.status || "en_stock";
    document.getElementById('product-price').value = parseInt(produit.prix) || produit.prix;
    
    document.getElementById('existing-image-url').value = produit.image;
    document.getElementById('product-image-file').value = ""; // On vide le champ fichier
    
    document.getElementById('current-image-preview').innerHTML = `<p style="font-size:12px; color:#7f8fa6;">Image actuelle :</p><img src="${produit.image}" alt="Image actuelle" style="max-width: 100px; max-height: 100px; border-radius: 5px; margin-bottom: 10px;">`;
    document.getElementById('modal-title').innerText = "Modifier les informations";

    modal.style.display = 'flex';
}

// 6. Supprimer un produit de la base de données
window.supprimerProduit = async function(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement ce produit ?")) {
        try {
            await deleteDoc(doc(db, "produits", id));
            // Optionnellement, vous pourriez aussi vouloir supprimer l'image du Storage Firebase ici.
            // Pour faire simple, on supprime seulement le document Firestore.
            chargerProduits();
        } catch (error) {
            console.error("Erreur de suppression:", error);
            alert("Erreur lors de la suppression.");
        }
    }
}

// Fonction utilitaire pour éviter les failles XSS (Nettoyage des entrées)
function sanitizeHTML(str) {
    if (!str) return "";
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// 7. Enregistrement (Création d'un nouveau, ou Mise à jour d'un existant)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const saveBtn = document.getElementById('save-btn');
    const uploadStatus = document.getElementById('upload-status');
    
    const id = document.getElementById('product-id').value;
    const nom = sanitizeHTML(document.getElementById('product-name').value);
    const marque = sanitizeHTML(document.getElementById('product-brand').value);
    const categorie = sanitizeHTML(document.getElementById('product-category').value);
    const status = sanitizeHTML(document.getElementById('product-status').value);
    const prix = document.getElementById('product-price').value;
    const imageFile = document.getElementById('product-image-file').files[0];
    const existingImageUrl = document.getElementById('existing-image-url').value;
    
    if (!id && !imageFile) {
        alert("Veuillez sélectionner une image pour le nouveau produit.");
        return;
    }

    // Bloque le bouton pour éviter les clics multiples
    saveBtn.disabled = true;

    try {
        let imageUrl = existingImageUrl;
        
        if (imageFile) {
            uploadStatus.style.display = "block";
            uploadStatus.innerText = "Compression et traitement de l'image...";
            
            // On utilise la compression locale au lieu de Firebase Storage pour que ça soit 100% gratuit
            imageUrl = await compressImage(imageFile, 800, 0.7);
        }

        uploadStatus.style.display = "block";
        uploadStatus.innerText = "Sauvegarde dans la base de données...";

        // Structure du produit à sauvegarder
        const produitData = {
            nom: nom,
            marque: marque,
            categorie: categorie,
            status: status,
            prix: parseInt(prix), // S'assure de stocker le prix comme un nombre et non du texte
            image: imageUrl
        };

        if (id) {
            // S'il y a un ID, on modifie le document existant
            await updateDoc(doc(db, "produits", id), produitData);
        } else {
            // Aucun ID : c'est un nouveau document qu'on crée
            produitData.createdAt = Date.now();
            await addDoc(collection(db, "produits"), produitData);
        }

        // On ferme le modale et on actualise le tableau
        closeModal();
        chargerProduits();
        
    } catch (error) {
        console.error("Erreur d'enregistrement:", error);
        alert("Une erreur est survenue lors de l'enregistrement du produit.");
    } finally {
        saveBtn.disabled = false;
        uploadStatus.style.display = "none";
    }
});

// -------------------------------------------------------------
// UTILITAIRE : COMPRESSION D'IMAGE EN BASE64
// -------------------------------------------------------------
function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Récupération de l'image compressée en Base64 (format JPEG)
                const base64Data = canvas.toDataURL('image/jpeg', quality);
                resolve(base64Data);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
}
