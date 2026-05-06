// c:\Users\MIDOU\Desktop\Barham-Optic-html\js\medecin.js

import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { collection, getDocs, getDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// L'unique adresse email autorisée à accéder au panel médecin
const MEDECIN_EMAIL = "skhamidou03@gmail.com";

// 1. Protection de la page
onAuthStateChanged(auth, (user) => {
    if (!user) {
        alert("Accès refusé. Vous devez être connecté.");
        window.location.href = "connection.html";
    } else if (user.email !== MEDECIN_EMAIL) {
        alert("Accès refusé. Cette page est strictement réservée au Médecin.");
        window.location.href = "index.html"; 
    } else {
        // L'Auth est validée
        chargerPatients();
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

// -------------------------------------------------------------
// GESTION DES ONGLETS
// -------------------------------------------------------------
const tabPatients = document.getElementById('tab-patients');
const tabRdv = document.getElementById('tab-rdv');
const sectionPatients = document.getElementById('section-patients');
const sectionRdv = document.getElementById('section-rdv');

const patientsTableBody = document.getElementById('medecin-patients-table');
const rdvTableBody = document.getElementById('medecin-rdv-table');

tabPatients.addEventListener('click', (e) => {
    e.preventDefault();
    tabPatients.classList.add('active');
    tabRdv.classList.remove('active');
    sectionPatients.style.display = 'block';
    sectionRdv.style.display = 'none';
    chargerPatients();
});

tabRdv.addEventListener('click', (e) => {
    e.preventDefault();
    tabRdv.classList.add('active');
    tabPatients.classList.remove('active');
    sectionRdv.style.display = 'block';
    sectionPatients.style.display = 'none';
    chargerRendezVous();
});

// -------------------------------------------------------------
// GESTION DES PATIENTS (CRM)
// -------------------------------------------------------------
let allPatients = [];

async function chargerPatients() {
    patientsTableBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Chargement des patients...</td></tr>";
    try {
        const querySnapshot = await getDocs(collection(db, "utilisateurs"));
        allPatients = [];
        
        if (querySnapshot.empty) {
            patientsTableBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Aucun patient inscrit.</td></tr>";
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            data.id = docSnap.id;
            data.shortId = data.id.substring(0, 6).toUpperCase();
            allPatients.push(data);
        });

        afficherPatients(allPatients);
        
    } catch (error) {
        console.error("Erreur chargement patients:", error);
        patientsTableBody.innerHTML = `<tr><td colspan='4' style='text-align:center; color:red;'>Erreur de chargement Firebase : ${error.message}</td></tr>`;
    }
}

function afficherPatients(liste) {
    patientsTableBody.innerHTML = "";
    if(liste.length === 0) {
        patientsTableBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Aucun patient trouvé.</td></tr>";
        return;
    }

    liste.forEach(data => {
        let ordonnanceHTML = "";
        if (data.dossierMedical && Object.keys(data.dossierMedical).length > 0) {
            ordonnanceHTML = `<button onclick="imprimerOrdonnance('${data.id}')" style="background:#2ecc71; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-size:12px;"><i class='bx bx-printer'></i> Imprimer l'ordonnance</button>`;
        } else {
            ordonnanceHTML = `<em style='color:gray;'>Pas d'ordonnance enregistrée</em>`;
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b style='color:#3498db; font-size:14px;'>#${data.shortId}</b><br><small style="color:gray;">Contact privé</small></td>
            <td><b>${data.username || "Client Nouveau"}</b></td>
            <td>${ordonnanceHTML}</td>
            <td>
                <button class="btn-edit" onclick="editerDossier('${data.id}')" title="Gérer le Dossier" style="width: auto; padding: 5px 15px; cursor: pointer; background: #3498db; color: white; border: none; border-radius: 4px;"><i class='bx bx-plus-medical'></i> Dossier</button>
            </td>
        `;
        patientsTableBody.appendChild(tr);
    });
}

// Recherche de patients
const searchPatientInput = document.getElementById('search-patient');
if (searchPatientInput) {
    searchPatientInput.addEventListener('input', (e) => {
        const val = e.target.value.toLowerCase();
        const filtered = allPatients.filter(p => 
            (p.username && p.username.toLowerCase().includes(val)) || 
            (p.shortId && p.shortId.toLowerCase().includes(val))
        );
        afficherPatients(filtered);
    });
}


window.editerDossier = async function(id) {
    document.getElementById('patient-id').value = id;
    const form = document.getElementById('patient-form');
    form.reset();
    
    // Uncheck all checkboxes by default
    form.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    try {
        const docSnap = await getDoc(doc(db, "utilisateurs", id));
        if (docSnap.exists() && docSnap.data().dossierMedical) {
            const dossier = docSnap.data().dossierMedical;
            
            // Populate form dynamically
            Object.keys(dossier).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = dossier[key] === true || dossier[key] === "true";
                    } else {
                        input.value = dossier[key];
                    }
                }
            });

            // Compatibilité avec l'ancien format (au cas où)
            if (dossier.date && !dossier.exam_date) {
                const examDateInput = form.querySelector('[name="exam_date"]');
                if(examDateInput) examDateInput.value = dossier.date;
            }
        }
    } catch(err) { console.error(err); }
    
    document.getElementById('patient-modal').style.display = 'flex';
}

window.closePatientModal = function() {
    document.getElementById('patient-modal').style.display = 'none';
}

document.getElementById('patient-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('save-patient-btn');
    saveBtn.disabled = true;
    saveBtn.innerText = "Enregistrement...";
    
    const id = document.getElementById('patient-id').value;
    
    const dossierMedical = {};
    const formData = new FormData(e.target);
    
    for (let [key, value] of formData.entries()) {
        dossierMedical[key] = value;
    }
    
    // Checkboxes ne sont incluses dans FormData que si elles sont cochées. 
    // On va s'assurer de bien stocker true ou false.
    e.target.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        dossierMedical[cb.name] = cb.checked;
    });
    
    const od_sph = dossierMedical.od_sph || '';
    const og_sph = dossierMedical.og_sph || '';
    const exam_date = dossierMedical.exam_date || 'N/A';
    
    const correctionApercu = od_sph || og_sph ? `OD: ${od_sph} | OG: ${og_sph}` : `Dossier mis à jour le ${exam_date}`;
    
    try {
        await updateDoc(doc(db, "utilisateurs", id), {
            dossierMedical: dossierMedical,
            correction: correctionApercu
        });
        closePatientModal();
        chargerPatients();
    } catch(err) {
        console.error(err);
        alert("Erreur lors de la sauvegarde.");
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = "Enregistrer le dossier complet";
    }
});


// -------------------------------------------------------------
// GESTION DES RENDEZ-VOUS
// -------------------------------------------------------------
let currentRendezVous = [];

async function chargerRendezVous() {
    const rdvTableBody = document.getElementById('medecin-rdv-table');
    rdvTableBody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Chargement des consultations...</td></tr>";
    try {
        const querySnapshot = await getDocs(collection(db, "rendezvous"));
        rdvTableBody.innerHTML = "";
        
        if (querySnapshot.empty) {
            rdvTableBody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Aucune consultation prévue.</td></tr>";
            return;
        }

        currentRendezVous = [];
        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();
            data.id = docSnap.id;
            currentRendezVous.push(data);
        });

        currentRendezVous.sort((a, b) => new Date(a.date) - new Date(b.date));

        currentRendezVous.forEach((data) => {
            const dateStr = new Date(data.date).toLocaleDateString('fr-FR');
            
            let badgeBg = "#f1c40f"; 
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
                    <button class="btn-edit" onclick="changerStatutRdv('${data.id}', 'Confirmé')" title="Confirmer" style="background:#f39c12; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;"><i class='bx bx-check'></i></button>
                    <button class="btn-delete" onclick="supprimerRendezVous('${data.id}')" title="Supprimer" style="background:#e74c3c; color:white; border:none; padding:5px; border-radius:4px; cursor:pointer;"><i class='bx bx-trash'></i></button>
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
    if (confirm("Êtes-vous sûr de vouloir supprimer / annuler cette consultation ?")) {
        try {
            await deleteDoc(doc(db, "rendezvous", id));
            chargerRendezVous();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la suppression.");
        }
    }
}

window.changerStatutRdv = async function(id, nouveauStatut) {
    if (confirm("Changer le statut de la consultation ?")) {
        try {
            await updateDoc(doc(db, "rendezvous", id), { statut: nouveauStatut });
            chargerRendezVous();
        } catch (error) {
            console.error(error);
            alert("Erreur lors du changement de statut.");
        }
    }
}

// -------------------------------------------------------------
// GESTION DE L'ORDONNANCE (IMPRESSION)
// -------------------------------------------------------------
window.closeOrdonnanceModal = function() {
    document.getElementById('ordonnance-modal').style.display = 'none';
}

window.imprimerOrdonnance = async function(id) {
    try {
        const docSnap = await getDoc(doc(db, "utilisateurs", id));
        if (docSnap.exists() && docSnap.data().dossierMedical) {
            const data = docSnap.data();
            const d = data.dossierMedical;

            document.getElementById("ord-date-jour").innerText = new Date().toLocaleDateString('fr-FR');
            
            document.getElementById("ord-patient-nom").innerText = `${d.admin_nom || ''} ${d.admin_prenom || ''}`.trim() || data.username || '-';
            document.getElementById("ord-patient-age").innerText = `${d.admin_age ? d.admin_age + ' ans' : '-'} / ${d.admin_sexe || '-'}`;
            const shortId = id.substring(0, 6).toUpperCase();
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

            document.getElementById("ordonnance-modal").style.display = "flex";
        }
    } catch(error) {
        console.error(error);
        alert("Erreur lors de l'ouverture de l'ordonnance.");
    }
}
