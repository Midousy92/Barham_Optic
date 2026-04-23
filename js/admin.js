// c:\Users\MIDOU\Desktop\Barham-Optic-html\js\admin.js

import { auth, db, storage } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";


// L'unique adresse email autorisée à accéder au panel d'administration
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
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${data.image}" alt="${data.nom}"></td>
                <td>${data.nom} <br><small style="color:gray;">${data.categorie || 'Non spécifié'}</small></td>
                <td><span style="background:#ecf0f1; border-radius:5px; padding:3px 8px; font-size:12px;">${data.marque}</span></td>
                <td><b>${data.prix} FCFA</b></td>
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
// GESTION DES ONGLETS ET RENDEZ-VOUS
// -------------------------------------------------------------
const tabProduits = document.getElementById('tab-produits');
const tabRdv = document.getElementById('tab-rdv');
const sectionProduits = document.getElementById('section-produits');
const sectionRdv = document.getElementById('section-rdv');
const rdvTableBody = document.getElementById('admin-rdv-table');

let currentRendezVous = []; // Garder une trace globale pour gérer l'envoi d'emails

tabProduits.addEventListener('click', (e) => {
    e.preventDefault();
    tabProduits.classList.add('active');
    tabRdv.classList.remove('active');
    sectionProduits.style.display = 'block';
    sectionRdv.style.display = 'none';
});

tabRdv.addEventListener('click', (e) => {
    e.preventDefault();
    tabRdv.classList.add('active');
    tabProduits.classList.remove('active');
    sectionRdv.style.display = 'block';
    sectionProduits.style.display = 'none';
    chargerRendezVous();
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
                <td>
                    <button class="btn-edit" onclick="changerStatutRdv('${data.id}', 'Confirmé')" title="Confirmer"><i class='bx bx-check'></i></button>
                    <button class="btn-delete" onclick="supprimerRendezVous('${data.id}')" title="Supprimer / Annuler"><i class='bx bx-trash'></i></button>
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

// 7. Enregistrement (Création d'un nouveau, ou Mise à jour d'un existant)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const saveBtn = document.getElementById('save-btn');
    const uploadStatus = document.getElementById('upload-status');
    
    const id = document.getElementById('product-id').value;
    const nom = document.getElementById('product-name').value;
    const marque = document.getElementById('product-brand').value;
    const categorie = document.getElementById('product-category').value;
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
            uploadStatus.innerText = "Téléversement de l'image en cours...";
            
            const fileRef = ref(storage, 'produits_images/' + Date.now() + '_' + imageFile.name);
            await uploadBytes(fileRef, imageFile);
            imageUrl = await getDownloadURL(fileRef);
        }

        uploadStatus.style.display = "block";
        uploadStatus.innerText = "Sauvegarde dans la base de données...";

        // Structure du produit à sauvegarder
        const produitData = {
            nom: nom,
            marque: marque,
            categorie: categorie,
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
