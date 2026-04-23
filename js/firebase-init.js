// c:\Users\MIDOU\Desktop\Barham-Optic-html\js\firebase-init.js

// Importation de l'application Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";

// Importation de la base de données Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Importation de l'Authentification Firebase
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// La configuration de ton projet Barham Optic
const firebaseConfig = {
  apiKey: "AIzaSyBj6ZxokZR5z3a1z3OdeqKliaEbnKFs5BI",
  authDomain: "barham-optic.firebaseapp.com",
  projectId: "barham-optic",
  storageBucket: "barham-optic.firebasestorage.app",
  messagingSenderId: "441246550615",
  appId: "1:441246550615:web:db930c9f200d3d14ef3112"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation de la base de données et exportation pour pouvoir l'utiliser ailleurs
export const db = getFirestore(app);

// Initialisation de l'authentification et exportation
export const auth = getAuth(app);

// ---- GESTION DU BOUTON CONNEXION / MON PROFIL ----
onAuthStateChanged(auth, (user) => {
    // On trouve ton bouton "Connexion" dans la barre de navigation
    const connexionLink = document.querySelector('nav .navigation a[href="connection.html"]');
    
    if (connexionLink) {
        if (user) {
            // Si le client est connecté, on transforme le menu en "Mon Profil"
            connexionLink.innerHTML = "<i class='bx bxs-user-circle'></i> Mon Profil";
            connexionLink.href = "profil.html"; 
            
            // AJOUT DU LIEN DASHBOARD ADMIN (Uniquement pour barhamoptic70@gmail.com)
            if (user.email === "barhamoptic70@gmail.com") {
                if (!document.getElementById('nav-admin-link')) {
                    const liAdmin = document.createElement('li');
                    liAdmin.id = 'nav-admin-link';
                    liAdmin.innerHTML = '<a href="admin.html" style="color: #ffd401; font-weight: bold;">Dashboard Admin</a>';
                    // On l'insère juste avant le bouton "Mon Profil"
                    connexionLink.parentElement.parentElement.insertBefore(liAdmin, connexionLink.parentElement);
                }
            }
            
            // Plus besoin d'action de déconnexion ici, car le bouton pointe maintenant vers "profil.html"
            // La déconnexion sera gérée directement à l'intérieur de la page Profil.
        }
    }
});

console.log("🔥 Firebase est bien connecté au projet Barham Optic !");
