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
                    
                    // Remplissage du dossier médical
                    if (userData.dossierMedical && Object.keys(userData.dossierMedical).length > 0) {
                        const d = userData.dossierMedical;
                        const dateExam = d.exam_date || d.date;
                        document.getElementById('profil-exam-date').innerHTML = `Mise à jour : <em>${dateExam ? new Date(dateExam).toLocaleDateString('fr-FR') : 'Date non précisée'}</em>`;
                        
                        document.getElementById('btn-view-dossier').style.display = 'inline-block';
                        document.getElementById('no-dossier-msg').style.display = 'none';
                        
                        // Préparer le contenu du modal complet
                        window.patientDossierComplet = d; 
                    } else {
                        document.getElementById('btn-view-dossier').style.display = 'none';
                        document.getElementById('no-dossier-msg').style.display = 'block';
                    }
                    
                } else {
                    // Si le document Firestore n'a pas été créé lors de l'inscription
                    displayName.innerText = "Nouveau Client";
                    inputUsername.value = "";
                }

                // 2. On lance la récupération de l'historique des rendez-vous
                chargerMesRendezVous(user.uid);

                // 3. On lance la récupération de l'historique des achats
                chargerHistoriqueAchats(user.uid);

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

    // -----------------------------------------------------------------
    // GESTION DU MODAL DOSSIER MEDICAL
    // -----------------------------------------------------------------
    const btnViewDossier = document.getElementById("btn-view-dossier");
    const viewDossierModal = document.getElementById("view-dossier-modal");
    const closeViewDossier = document.getElementById("close-view-dossier");
    const dossierContentView = document.getElementById("dossier-content-view");

    if (btnViewDossier) {
        btnViewDossier.addEventListener("click", () => {
            const d = window.patientDossierComplet;
            if (!d) return;

            const labels = {
                exam_date: "Date de l'examen",
                admin_nom: "Nom", admin_prenom: "Prénom", admin_dob: "Date de naissance", admin_age: "Âge", admin_sexe: "Sexe", admin_tel: "Téléphone", admin_email: "Email", admin_assurance: "Assurance", admin_adresse: "Adresse", admin_urgence: "Contact d'urgence",
                motif_baisse_vision: "Baisse de vision", motif_vision_floue: "Vision floue", motif_douleur: "Douleur oculaire", motif_rougeur: "Rougeur", motif_routine: "Contrôle de routine", motif_traumatisme: "Traumatisme", motif_autres: "Autres motifs",
                ant_med_diabete: "Diabète", ant_med_hta: "Hypertension", ant_med_cardio: "Maladies cardiovasculaires", ant_med_allergies: "Allergies", ant_med_traitements: "Traitements en cours", ant_med_autres: "Autres antécédents",
                ant_oph_lunettes: "Port de lunettes", ant_oph_lentilles: "Port de lentilles", ant_oph_glaucome: "Glaucome", ant_oph_cataracte: "Cataracte", ant_oph_retine: "Pathologies rétiniennes", ant_oph_trauma: "Traumatisme oculaire", ant_oph_prescriptions: "Anciennes prescriptions", ant_oph_traitements: "Traitements ophtalmologiques en cours",
                ant_fam_glaucome: "Glaucome familial", ant_fam_cecite: "Cécité familiale", ant_fam_diabete: "Diabète familial", ant_fam_hta: "Hypertension familiale", ant_fam_autres: "Autres antécédents familiaux",
                hab_profession: "Profession", hab_ecrans: "Temps d'écran (h/j)", hab_conduite: "Conduite de nuit", hab_tabac: "Tabac", hab_alcool: "Alcool", hab_expositions: "Expositions professionnelles",
                od_sph: "OD - Sphère", od_cyl: "OD - Cylindre", od_axe: "OD - Axe", exam_od_ac_sans: "OD - Acuité sans correction", exam_od_add: "OD - Addition", exam_od_ac_avec: "OD - Acuité avec correction",
                og_sph: "OG - Sphère", og_cyl: "OG - Cylindre", og_axe: "OG - Axe", exam_og_ac_sans: "OG - Acuité sans correction", exam_og_add: "OG - Addition", exam_og_ac_avec: "OG - Acuité avec correction",
                exam_tension: "Tension intraoculaire", exam_paupieres: "Paupières", exam_cornee: "Cornée", exam_cristallin: "Cristallin", exam_fond: "Fond d'œil", exam_champ: "Champ visuel",
                comp_oct: "OCT", comp_topo: "Topographie", comp_pachy: "Pachymétrie", comp_angio: "Angiographie", comp_photo: "Photo fond d'œil", comp_resultats: "Résultats examens complémentaires",
                diag_principal: "Diagnostic principal", diag_associes: "Diagnostics associés", diag_gravite: "Gravité", diag_evolution: "Évolution",
                trait_prescription: "Prescription lunettes/lentilles", trait_medocs: "Médicaments/Collyres", trait_recos: "Recommandations/Chirurgie", trait_prochain_rdv: "Date prochain RDV",
                sign_nom: "Médecin traitant", sign_date: "Date de validation"
            };

            let html = "<div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;'>";
            for (let key in d) {
                if (d[key] === "" || d[key] === false || d[key] === "false") continue;
                let value = d[key];
                if (value === true || value === "true") value = "Oui";
                let label = labels[key] || key;
                html += `
                    <div style="background: #f8f9fa; padding: 10px 15px; border-left: 3px solid #3498db; border-radius: 4px;">
                        <strong style="color: #2c3e50; display:block; margin-bottom:5px;">${label}</strong>
                        <span style="color: #555; white-space: pre-wrap;">${value}</span>
                    </div>
                `;
            }
            html += "</div>";
            if(Object.keys(d).length === 0) html = "<p>Aucune information médicale enregistrée.</p>";

            dossierContentView.innerHTML = html;
            viewDossierModal.style.display = "flex";
        });
    }

    if (closeViewDossier) {
        closeViewDossier.addEventListener("click", () => {
            viewDossierModal.style.display = "none";
        });
    }

    // -----------------------------------------------------------------
    // HISTORIQUE DES ACHATS
    // -----------------------------------------------------------------
    async function chargerHistoriqueAchats(uid) {
        const achatsList = document.getElementById("achats-list-container");
        if (!achatsList) return;

        achatsList.innerHTML = `<p style="text-align:center; color:#777;"><i class='bx bx-loader-alt bx-spin'></i> Chargement des achats...</p>`;
        
        try {
            const q = query(collection(db, "commandes"), where("userId", "==", uid));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                achatsList.innerHTML = `<p style="text-align:center; color:#777; padding: 20px 0;">Vous n'avez pas encore effectué d'achats liés à ce compte.</p>`;
                return;
            }

            const achats = [];
            querySnapshot.forEach((docSnap) => {
                achats.push(docSnap.data());
            });

            // Tri chronologique : du plus récent au plus ancien
            achats.sort((a, b) => {
                const dateA = a.date ? a.date.toDate() : new Date(0);
                const dateB = b.date ? b.date.toDate() : new Date(0);
                return dateB - dateA;
            });

            achatsList.innerHTML = "";
            
            achats.forEach(achat => {
                const dateObj = achat.date ? achat.date.toDate() : new Date();
                const dateFormatee = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                
                let statutClass = "status-attente";
                if (achat.status === "Validée") statutClass = "status-confirme";
                if (achat.status === "Livrée") statutClass = "status-termine";

                let articlesHtml = '<ul style="list-style:none; padding:0; margin:10px 0 0 0; font-size:13px; color:#555;">';
                if (achat.articles && achat.articles.length > 0) {
                    achat.articles.forEach(art => {
                        articlesHtml += `<li style="margin-bottom:5px;">• <b>${art.nom}</b> (${art.marque}) - ${art.prix} FCFA</li>`;
                    });
                }
                articlesHtml += '</ul>';

                const totalPrix = achat.articles ? achat.articles.reduce((sum, item) => sum + parseInt(item.prix.toString().replace(/\\s+/g, '') || 0), 0) : 0;

                const cardHtml = \`
                    <div class="rdv-card" style="border-left: 4px solid #3498db; margin-bottom:15px; background-color: #f8f9fa;">
                        <div class="rdv-card-info" style="width: 100%;">
                            <h4 style="color:#183153; margin-bottom: 8px;"><i class='bx bx-shopping-bag'></i> Commande du \${dateFormatee}</h4>
                            <span class="rdv-status \${statutClass}" style="margin-bottom:10px; display:inline-block;">\${achat.status || 'En attente'}</span>
                            \${articlesHtml}
                            <p style="text-align:right; font-weight:bold; color:#183153; margin-top:10px; border-top:1px solid #eee; padding-top:10px;">
                                Total : \${totalPrix} FCFA
                            </p>
                        </div>
                    </div>
                \`;
                achatsList.insertAdjacentHTML('beforeend', cardHtml);
            });

        } catch (error) {
            console.error("Erreur chargement achats :", error);
            achatsList.innerHTML = \`<p style="text-align:center; color:#e74c3c; font-size:14px; padding: 10px;">Impossible de charger l'historique des achats.</p>\`;
        }
    }
    // -----------------------------------------------------------------
    // GESTION IMPRESSION ORDONNANCE (PATIENT)
    // -----------------------------------------------------------------
    const btnPrintOrd = document.getElementById("btn-print-ord");
    const ordonnanceModal = document.getElementById("ordonnance-modal");
    const closeOrdModal = document.getElementById("close-ord-modal");

    if (btnPrintOrd) {
        btnPrintOrd.addEventListener("click", () => {
            const d = window.patientDossierComplet;
            if (!d) return;

            document.getElementById("ord-date-jour").innerText = new Date().toLocaleDateString('fr-FR');
            
            const username = document.getElementById("display-name").innerText;
            document.getElementById("ord-patient-nom").innerText = `${d.admin_nom || ''} ${d.admin_prenom || ''}`.trim() || username || '-';
            document.getElementById("ord-patient-age").innerText = `${d.admin_age ? d.admin_age + ' ans' : '-'} / ${d.admin_sexe || '-'}`;
            const shortId = currentUserId ? currentUserId.substring(0, 6).toUpperCase() : '-';
            document.getElementById("ord-patient-id").innerText = "#" + shortId;

            let motifs = [];
            if(d.motif_baisse_vision) motifs.push("Baisse de vision");
            if(d.motif_vision_floue) motifs.push("Vision floue");
            if(d.motif_douleur) motifs.push("Douleur");
            if(d.motif_rougeur) motifs.push("Rougeur");
            if(d.motif_routine) motifs.push("Routine");
            if(d.motif_traumatisme) motifs.push("Traumatisme");
            if(d.motif_autres) motifs.push(d.motif_autres);
            
            let motifFinal = motifs.length > 0 ? motifs.join(', ') : '-';
            if(d.diag_principal) motifFinal += ` | Diag: ${d.diag_principal}`;
            
            document.getElementById("ord-diag").innerText = motifFinal;
            document.getElementById("ord-obs").innerText = d.diag_associes || '-';

            document.getElementById("ord-medocs").innerText = d.trait_medocs || 'Aucun traitement médical prescrit.';

            document.getElementById("ord-od-sph").innerText = d.od_sph || '-';
            document.getElementById("ord-od-cyl").innerText = d.od_cyl || '-';
            document.getElementById("ord-od-axe").innerText = d.od_axe || '-';
            document.getElementById("ord-od-ac").innerText = d.exam_od_ac_avec || '-';

            document.getElementById("ord-og-sph").innerText = d.og_sph || '-';
            document.getElementById("ord-og-cyl").innerText = d.og_cyl || '-';
            document.getElementById("ord-og-axe").innerText = d.og_axe || '-';
            document.getElementById("ord-og-ac").innerText = d.exam_og_ac_avec || '-';

            const optDetails = [d.trait_prescription, d.trait_recos].filter(Boolean).join('\n');
            document.getElementById("ord-opt-details").innerText = optDetails || '-';

            document.getElementById("ord-recos").innerText = d.trait_recos || '-';
            document.getElementById("ord-rdv").innerText = d.trait_prochain_rdv ? new Date(d.trait_prochain_rdv).toLocaleDateString('fr-FR') : '-';

            ordonnanceModal.style.display = "flex";
        });
    }

    if (closeOrdModal) {
        closeOrdModal.addEventListener("click", () => {
            ordonnanceModal.style.display = "none";
        });
    }

});
