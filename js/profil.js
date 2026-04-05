// c:\Users\MIDOU\Desktop\Barham-Optic-html\js\profil.js

import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    
    // Elements UI
    const profilZone = document.getElementById("profil-zone");
    const unauthZone = document.getElementById("unauth-zone");
    
    const displayEmail = document.getElementById("display-email");
    const displayName = document.getElementById("display-name");
    
    const inputEmail = document.getElementById("input-email");
    const inputUsername = document.getElementById("input-username");
    
    const profilForm = document.getElementById("profil-form");
    const msgBox = document.getElementById("profil-msg");
    const btnSave = document.getElementById("btn-save");
    
    const logoutBtn = document.getElementById("logout-btn");
    const resetPasswordBtn = document.getElementById("reset-password-btn");
    
    let currentUserId = null;

    function showMessage(type, text) {
        msgBox.className = `firebase-msg ${type}`;
        msgBox.innerHTML = text;
        msgBox.style.display = "block";
        setTimeout(() => { msgBox.style.display = "none"; }, 5000);
    }

    // 1. SURVEILLANCE DE L'ÉTAT DE CONNEXION
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // L'utilisateur est connecté
            currentUserId = user.uid;
            profilZone.style.display = "grid";
            unauthZone.style.display = "none";
            
            // Initialisation de l'email (provient directement de Firebase Auth)
            displayEmail.innerText = user.email;
            inputEmail.value = user.email;

            try {
                // On récupère les infos Firestore du client
                const userDoc = await getDoc(doc(db, "utilisateurs", user.uid));
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    displayName.innerText = userData.username || "Client Barham";
                    inputUsername.value = userData.username || "";
                } else {
                    // Si le document Firestore n'a pas été créé lors de l'inscription
                    displayName.innerText = "Nouveau Client";
                    inputUsername.value = "";
                }

                // 2. On lance la récupération de l'historique des rendez-vous
                chargerMesRendezVous(user.uid);

            } catch (error) {
                console.error("Erreur lors de la récupération des infos:", error);
            }
            
        } else {
            // L'utilisateur N'EST PAS connecté
            profilZone.style.display = "none";
            unauthZone.style.display = "block";
            currentUserId = null;
        }
    });

    // 2. MISE A JOUR DU PSEUDONYME (Firestore)
    if (profilForm) {
        profilForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            if (!currentUserId) return;
            
            btnSave.disabled = true;
            btnSave.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Enregistrement...";

            const newUsername = inputUsername.value.trim();

            try {
                // Met à jour Firestore
                await updateDoc(doc(db, "utilisateurs", currentUserId), {
                    username: newUsername
                });
                
                // Mettre à jour l'affichage sur la gauche
                displayName.innerText = newUsername;
                
                showMessage("success", "✅ Profil mis à jour avec succès !");
            } catch (error) {
                console.error("Erreur mise à jour:", error);
                
                // Si le document n'existait pas vraiment on le crée ou on affiche une erreur
                if (error.code === 'not-found') {
                    showMessage("error", "❌ Document introuvable, veuillez vous reconnecter.");
                } else {
                    showMessage("error", "❌ Impossible de mettre à jour le profil.");
                }
            } finally {
                btnSave.disabled = false;
                btnSave.innerHTML = "<i class='bx bx-save'></i> Enregistrer les modifications";
            }
        });
    }

    // 3. SE DÉCONNECTER
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
                try {
                    await signOut(auth);
                    window.location.href = "index.html"; // Retour à l'accueil
                } catch (error) {
                    console.error("Erreur lors de la déconnexion", error);
                    alert("Erreur lors de la déconnexion.");
                }
            }
        });
    }

    // RÉINITIALISER LE MOT DE PASSE (Password Reset)
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener("click", async () => {
            const userEmail = inputEmail.value;
            if (!userEmail) return;

            if (confirm(`Un email de réinitialisation va être envoyé à ${userEmail}. Continuer ?`)) {
                try {
                    await sendPasswordResetEmail(auth, userEmail);
                    alert(`✅ Un email avec un lien de modification a été envoyé à ${userEmail}. Veuillez le consulter.`);
                } catch (error) {
                    console.error("Erreur reset:", error);
                    alert("❌ Erreur lors de l'envoi de l'email.");
                }
            }
        });
    }

    // -----------------------------------------------------------------
    // HISTORIQUE DES RENDEZ-VOUS
    // -----------------------------------------------------------------
    async function chargerMesRendezVous(uid) {
        const rdvList = document.getElementById("rdv-list");
        rdvList.innerHTML = `<p style="text-align:center; color:#777;"><i class='bx bx-loader-alt bx-spin'></i> Chargement des rendez-vous...</p>`;
        
        try {
            // Création de la requête : chercher dans "rendezvous" OÙ "userId" = UID du client connecté
            const q = query(collection(db, "rendezvous"), where("userId", "==", uid));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                rdvList.innerHTML = `<p style="text-align:center; color:#777; padding: 20px 0;">Vous n'avez aucun rendez-vous à venir.</p>`;
                return;
            }

            const rdvs = [];
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                data.id = docSnap.id;
                rdvs.push(data);
            });

            // Tri chronologique : du plus proche date(min) au plus lointain
            rdvs.sort((a, b) => new Date(a.date) - new Date(b.date));

            rdvList.innerHTML = ""; // Vider le conteneur
            
            rdvs.forEach(rdv => {
                const dateFormatee = new Date(rdv.date).toLocaleDateString('fr-FR');
                
                let statutClass = "status-attente";
                if (rdv.statut === "Confirmé") statutClass = "status-confirme";
                if (rdv.statut === "Terminé") statutClass = "status-termine";

                // Afficher le bouton annuler seulement si le rdv n'est pas déjà terminé
                let cancelBtnHtml = "";
                if (rdv.statut !== "Terminé") {
                    cancelBtnHtml = `<button class="btn-cancel-rdv" onclick="annulerMonRdv('${rdv.id}')"><i class='bx bx-x'></i> Annuler</button>`;
                }

                const cardHtml = `
                    <div class="rdv-card">
                        <div class="rdv-card-info">
                            <h4><i class='bx bx-calendar'></i> ${dateFormatee} à ${rdv.heure}</h4>
                            <p>Motif : ${rdv.motif}</p>
                        </div>
                        <div class="rdv-card-actions">
                            <span class="rdv-status ${statutClass}">${rdv.statut}</span>
                            ${cancelBtnHtml}
                        </div>
                    </div>
                `;
                rdvList.insertAdjacentHTML('beforeend', cardHtml);
            });

        } catch (error) {
            console.error("Erreur chargement rdv :", error);
            rdvList.innerHTML = `<p style="text-align:center; color:#e74c3c; font-size:14px; padding: 10px;">
                                    Erreur sécurité (Alerter le développeur) : <br> ${error.message}
                                 </p>`;
        }
    }

    // Rendre la fonction accessible depuis le onclick du HTML généré dynamiquement
    window.annulerMonRdv = async function(rdvId) {
        if (confirm("🚨 Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
            try {
                await deleteDoc(doc(db, "rendezvous", rdvId));
                // Recharger l'affichage instantanément
                if (currentUserId) chargerMesRendezVous(currentUserId);
            } catch (error) {
                console.error("Erreur annulation:", error);
                alert("❌ Impossible d'annuler le rendez-vous. Problème de permission Firebase.");
            }
        }
    };

});
