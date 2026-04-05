// c:\Users\MIDOU\Desktop\Barham-Optic-html\js\contact.js

const contactForm = document.querySelector('.contact-form form');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // On récupère les valeurs que le client a tapé sans avoir besoin d'id ou de name dans ton HTML
        const nom = contactForm.querySelector('input[placeholder="Votre nom"]').value;
        const email = contactForm.querySelector('input[placeholder="Votre email"]').value;
        const sujet = contactForm.querySelector('input[placeholder="Sujet"]').value;
        const message = contactForm.querySelector('textarea[placeholder="Votre message"]').value;

        // ⚠️ CLÉ SECRÈTE À REMPLACER ⚠️
        const ACCESS_KEY = "efd60bae-b1ca-4a1c-8507-7ea626936474"; 

        try {
            // Modification du bouton pendant l'envoi
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Envoi en cours...";
            submitBtn.disabled = true;

            // Envoi des données vers Web3Forms qui va t'envoyer le mail
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    access_key: ACCESS_KEY,
                    subject: "Site Web - Nouveau message de : " + nom + " (" + sujet + ")",
                    from_name: nom,
                    email: email, // L'email du client (pour pouvoir lui répondre)
                    message: message
                })
            });

            const result = await response.json();

            // Nettoyage de l'ancien texte de succès/erreur s'il y en a un
            const ancienMsg = contactForm.querySelector('.firebase-msg');
            if(ancienMsg) ancienMsg.remove();

            if (result.success) {
                // Afficher un beau message vert
                submitBtn.insertAdjacentHTML('beforebegin', `<p class="firebase-msg" style="color: #ffd401; margin-bottom: 10px; font-weight: bold; text-align: center;">✅ Message envoyé avec succès à barhamoptic70@gmail.com !</p>`);
                contactForm.reset();
            } else {
                // Afficher un message rouge en cas d'erreur
                submitBtn.insertAdjacentHTML('beforebegin', `<p class="firebase-msg" style="color: red; margin-bottom: 10px; font-weight: bold; text-align: center;">❌ Impossible d'envoyer le message.</p>`);
            }

            // Remettre le bouton à son état normal
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

        } catch (error) {
            console.error("Erreur avec l'envoi du formulaire:", error);
            alert("Une erreur technique est survenue.");
        }
    });
}
