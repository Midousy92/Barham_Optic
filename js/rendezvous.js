// c:\Users\MIDOU\Desktop\Barham-Optic-html\js\rendezvous.js

import { db, auth } from "./firebase-init.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const rdvForm = document.getElementById("rdv-form");
    const dateInput = document.getElementById("rdv-date");
    const heureSelect = document.getElementById("rdv-heure");
    const msgContainer = document.getElementById("msg-container");
    const btnSubmit = document.getElementById("btn-submit");

    if (!rdvForm) return;

    // 1. Restriction de Date : Pas de dates futures (Minimum Aujourd'hui)
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDate = `${today.getFullYear()}-${mm}-${dd}`;
    
    // On peut réserver jusqu'à 3 mois en avance maximum (confortable)
    const maxDateObj = new Date();
    maxDateObj.setMonth(maxDateObj.getMonth() + 3);
    const max_mm = String(maxDateObj.getMonth() + 1).padStart(2, '0');
    const max_dd = String(maxDateObj.getDate()).padStart(2, '0');
    const maxDate = `${maxDateObj.getFullYear()}-${max_mm}-${max_dd}`;

    dateInput.setAttribute("min", minDate);
    dateInput.setAttribute("max", maxDate);

    // Les créneaux horaires configurables (Pause entre 13h00 et 14h30)
    const horaires = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
        "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
    ];

    // 2. Comportement dynamique des créneaux
    dateInput.addEventListener("change", (e) => {
        const selectedDateStr = e.target.value;
        const selectedDate = new Date(selectedDateStr);
        const dayOfWeek = selectedDate.getDay(); // 0 = Dimanche, 1 = Lundi...

        heureSelect.innerHTML = "";

        // Cas 1 : Si c'est un Dimanche (fermé !)
        if (dayOfWeek === 0) {
            heureSelect.disabled = true;
            heureSelect.innerHTML = `<option value="" disabled selected>Fermé le Dimanche</option>`;
            dateInput.setCustomValidity("Nous sommes fermés le Dimanche. Veuillez choisir un autre jour.");
            dateInput.reportValidity();
            return;
        }

        // Sinon, c'est bon
        dateInput.setCustomValidity(""); // Clear custom errors
        heureSelect.disabled = false;
        heureSelect.innerHTML = `<option value="" disabled selected>Sélectionnez une heure...</option>`;
        
        // On peuple le select (On pourrait ajouter une vérif dispo ici plus tard)
        horaires.forEach(heure => {
            const opt = document.createElement("option");
            opt.value = heure;
            opt.textContent = heure;
            heureSelect.appendChild(opt);
        });
    });

    // 3. Soumission du Formulaire
    rdvForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Afficher message de chargement
        btnSubmit.disabled = true;
        btnSubmit.innerText = "Traitement en cours...";
        msgContainer.innerHTML = "";

        const rdvData = {
            nom: document.getElementById("rdv-nom").value,
            telephone: document.getElementById("rdv-tel").value,
            email: document.getElementById("rdv-email").value || "Non fourni",
            motif: document.getElementById("rdv-motif").value,
            date: dateInput.value,
            heure: heureSelect.value,
            notes: document.getElementById("rdv-notes").value || "Pas de note",
            statut: "En attente", // Statut initial de la réservation
            dateCreation: serverTimestamp(), // Enregistre la date exacte de soumission
            userId: auth.currentUser ? auth.currentUser.uid : "Non connecté" // Lie le rdv au compte si la personne est connectée
        };

        try {
            console.log("⏳ Sauvegarde du RDV dans Firebase...");
            // Envoyer la demande à Firebase dans la collection "rendezvous"
            await addDoc(collection(db, "rendezvous"), rdvData);

            console.log("⏳ Envoi de l'alerte Email via Web3Forms...");
            // Envoyer un Email automatique à l'administrateur
            await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    access_key: "efd60bae-b1ca-4a1c-8507-7ea626936474", // Clé existante du formulaire de Contact
                    subject: `Nouveau Rendez-vous : ${rdvData.nom}`,
                    from_name: "Site Barham Optic",
                    message: `Bonjour,\n\nVous avez un nouveau rendez-vous depuis le site internet :\n
                    Client : ${rdvData.nom}
                    Téléphone : ${rdvData.telephone}
                    Email : ${rdvData.email}
                    Motif : ${rdvData.motif}
                    Date : ${rdvData.date}
                    Heure : ${rdvData.heure}
                    Notes : ${rdvData.notes}\n
                    Connectez-vous à votre Espace Administrateur pour le gérer.`
                })
            });

            // Message de Succès
            msgContainer.innerHTML = `<div class="firebase-msg success">✅ Votre rendez-vous a été enregistré pour le ${rdvData.date} à ${rdvData.heure}. Nous vous attendons avec impatience !</div>`;
            
            // On reset  le formulaire
            rdvForm.reset();
            heureSelect.innerHTML = `<option value="" disabled selected>Sélectionnez d'abord la date</option>`;
            heureSelect.disabled = true;

        } catch (error) {
            console.error("Erreur lors de la réservation:", error);
            // On affiche le message d'erreur exact envoyé par Firebase pour comprendre d'où vient le blocage !
            msgContainer.innerHTML = `<div class="firebase-msg error">❌ Impossible d'enregistrer le rendez-vous.<br><br><small><b>Erreur Firebase :</b> ${error.message}</small></div>`;
        } finally {
            // Remettre le bouton
            btnSubmit.disabled = false;
            btnSubmit.innerText = "Confirmer le Rendez-vous";
            
            // Scroll to message
            window.scrollTo({ top: msgContainer.offsetTop - 100, behavior: 'smooth' });
        }
    });
});
