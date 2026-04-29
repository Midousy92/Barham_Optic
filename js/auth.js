// c:\Users\MIDOU\Desktop\Barham-Optic-html\js\auth.js

import { auth, db } from "./firebase-init.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// --- GESTION DE L'INSCRIPTION (Register) ---
const registerForm = document.querySelector('.form-box.register form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Empêche la page de se recharger par défaut
        
        // On récupère les valeurs tapées par l'utilisateur en ciblant tes champs existants
        const usernameInput = document.querySelector('.form-box.register input[placeholder="Username"]').value;
        const emailInput = document.querySelector('.form-box.register input[type="email"]').value;
        const passwordInput = document.querySelector('.form-box.register input[type="password"]').value;

        try {
            console.log("⏳ Création du compte en cours...");
            
            // 1. On crée le compte dans le système d'authentification de Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
            const user = userCredential.user;

            // 2. On sauvegarde le "Username" dans Firestore (car Auth ne stocke que l'email et le mot de passe)
            await setDoc(doc(db, "utilisateurs", user.uid), {
                username: usernameInput,
                email: emailInput,
                dateCreation: new Date()
            });

            // 3. Afficher le message de succès dans le formulaire au lieu d'un alert() "moche"
            // On nettoie l'ancien message s'il existe
            const ancienMsg = registerForm.querySelector('.firebase-msg');
            if(ancienMsg) ancienMsg.remove();
            
            const btnSubmit = registerForm.querySelector('.btn');
            btnSubmit.insertAdjacentHTML('beforebegin', `<p class="firebase-msg" style="color: #ffd401; margin-bottom: 10px; font-weight: bold; text-align: center;">🎉 Compte créé avec succès ! Tu peux maintenant te connecter.</p>`);

            registerForm.reset(); 
            
        } catch (error) {
            console.error("Erreur lors de l'inscription:", error);
            const ancienMsg = registerForm.querySelector('.firebase-msg');
            if(ancienMsg) ancienMsg.remove();

            const btnSubmit = registerForm.querySelector('.btn');
            btnSubmit.insertAdjacentHTML('beforebegin', `<p class="firebase-msg" style="color: red; margin-bottom: 10px; font-weight: bold; text-align: center;">❌ Erreur: Compte existant ou mot de passe trop court.</p>`);
        }
    });
}

// --- GESTION DE LA CONNEXION (Login) ---
const loginForm = document.querySelector('.form-box.login form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // On récupère l'email et le mot de passe du formulaire de Login
        const emailInput = document.querySelector('.form-box.login input[type="email"]').value;
        const passwordInput = document.querySelector('.form-box.login input[type="password"]').value;

        try {
            console.log("⏳ Connexion en cours...");
            
            await signInWithEmailAndPassword(auth, emailInput, passwordInput);
            
            // On nettoie l'ancien message s'il existe
            const ancienMsg = loginForm.querySelector('.firebase-msg');
            if(ancienMsg) ancienMsg.remove();
            
            const btnSubmit = loginForm.querySelector('.btn');
            btnSubmit.insertAdjacentHTML('beforebegin', `<p class="firebase-msg" style="color: #ffd401; margin-bottom: 10px; font-weight: bold; text-align: center;">✅ Connexion réussie ! Redirection...</p>`);

            loginForm.reset();
            
            // On attend 2 secondes pour te laisser voir le message avant la redirection
            setTimeout(() => {
                window.location.href = "index.html"; 
            }, 2000);
            
        } catch (error) {
            console.error("Erreur lors de la connexion:", error);
            
            const ancienMsg = loginForm.querySelector('.firebase-msg');
            if(ancienMsg) ancienMsg.remove();
            
            const btnSubmit = loginForm.querySelector('.btn');
            btnSubmit.insertAdjacentHTML('beforebegin', `<p class="firebase-msg" style="color: red; margin-bottom: 10px; font-weight: bold; text-align: center;">❌ Identifiant ou mot de passe incorrect.</p>`);
        }
    });
}

// --- GESTION DE L'OUBLI DE MOT DE PASSE ---
const forgotPasswordBtn = document.querySelector('.forgot-link a');

if (forgotPasswordBtn && loginForm) {
    forgotPasswordBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // On récupère l'email depuis le champ de connexion, sinon on le demande
        let emailInput = document.querySelector('.form-box.login input[type="email"]').value;
        
        if (!emailInput) {
            emailInput = prompt("Veuillez entrer votre adresse email pour réinitialiser votre mot de passe :");
            if (!emailInput) return; // Si l'utilisateur annule
        }

        try {
            console.log("⏳ Envoi de l'email de réinitialisation...");
            
            // On nettoie l'ancien message s'il existe
            const ancienMsg = loginForm.querySelector('.firebase-msg');
            if(ancienMsg) ancienMsg.remove();
            
            await sendPasswordResetEmail(auth, emailInput);
            
            const btnSubmit = loginForm.querySelector('.btn');
            btnSubmit.insertAdjacentHTML('beforebegin', `<p class="firebase-msg" style="color: #ffd401; margin-bottom: 10px; font-weight: bold; text-align: center;">✅ Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.</p>`);
            
        } catch (error) {
            console.error("Erreur lors de la réinitialisation:", error);
            
            const ancienMsg = loginForm.querySelector('.firebase-msg');
            if(ancienMsg) ancienMsg.remove();
            
            let errorMessage = "❌ Erreur lors de l'envoi.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
                errorMessage = "❌ Adresse email incorrecte ou introuvable.";
            }
            
            const btnSubmit = loginForm.querySelector('.btn');
            btnSubmit.insertAdjacentHTML('beforebegin', `<p class="firebase-msg" style="color: red; margin-bottom: 10px; font-weight: bold; text-align: center;">${errorMessage}</p>`);
        }
    });
}

// --- GESTION DE LA CONNEXION AVEC GOOGLE ---
const googleLoginBtn = document.getElementById('btn-google-login');
const googleRegisterBtn = document.getElementById('btn-google-register');

async function handleGoogleLogin(e, formElement) {
    e.preventDefault();
    const provider = new GoogleAuthProvider();
    try {
        console.log("⏳ Connexion Google en cours...");
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Vérifier si l'utilisateur existe déjà dans Firestore
        const userDoc = await getDoc(doc(db, "utilisateurs", user.uid));
        
        if (!userDoc.exists()) {
            // S'il n'existe pas (première connexion), on lui crée un profil avec son nom Google
            await setDoc(doc(db, "utilisateurs", user.uid), {
                username: user.displayName || "Utilisateur Google",
                email: user.email,
                dateCreation: new Date()
            });
        }
        
        // Message de succès dynamique
        const ancienMsg = formElement.querySelector('.firebase-msg');
        if(ancienMsg) ancienMsg.remove();
        
        const btnSubmit = formElement.querySelector('.btn');
        btnSubmit.insertAdjacentHTML('beforebegin', `<p class="firebase-msg" style="color: #ffd401; margin-bottom: 10px; font-weight: bold; text-align: center;">✅ Connexion Google réussie ! Redirection...</p>`);
        
        setTimeout(() => {
            window.location.href = "index.html"; 
        }, 1500);

    } catch (error) {
        console.error("Erreur connexion Google:", error);
        alert("Erreur lors de la connexion avec Google. Assurez-vous que l'option est activée sur Firebase.");
    }
}

if (googleLoginBtn && loginForm) {
    googleLoginBtn.addEventListener('click', (e) => handleGoogleLogin(e, loginForm));
}
if (googleRegisterBtn && registerForm) {
    googleRegisterBtn.addEventListener('click', (e) => handleGoogleLogin(e, registerForm));
}
