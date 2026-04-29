const fs = require('fs');
const https = require('https');
const path = require('path');

const dir = path.join(__dirname, 'images_uml');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const diagrams = [
    {
        name: 'use_case.png',
        type: 'plantuml',
        content: `@startuml
left to right direction
actor "Client" as c
actor "Administrateur" as a
package "Systeme Web Barham Optic" {
  usecase "Consulter le catalogue" as UC1
  usecase "Filtrer les produits" as UC2
  usecase "S'inscrire / Se connecter" as UC3
  usecase "Prendre un rendez-vous" as UC4
  usecase "Passer commande via WhatsApp" as UC5
  usecase "Gerer le catalogue complet" as UC6
  usecase "Visualiser les rendez-vous" as UC7
}
c --> UC1
c --> UC2
c --> UC3
c --> UC4
c --> UC5
UC4 ..> UC3 : <<include>>
UC5 ..> UC3 : <<extend>>
a --> UC3
a --> UC6
a --> UC7
@enduml`
    },
    {
        name: 'sequence_commande.png',
        type: 'mermaid',
        content: `sequenceDiagram
    actor Client
    participant InterfaceUI as Front-End
    participant ServeurFB as Back-End Firebase
    participant WhatsApp as API WhatsApp
    
    Client->>InterfaceUI: Navigue sur Collections.html
    InterfaceUI->>ServeurFB: Requete Tous les produits
    ServeurFB-->>InterfaceUI: Liste des lunettes
    InterfaceUI-->>Client: Affiche les produits
    
    Client->>InterfaceUI: Clique sur Commander
    InterfaceUI->>InterfaceUI: Genere le lien
    InterfaceUI->>WhatsApp: Redirige via wa.me/numero
    WhatsApp-->>Client: Ouvre l'application
    Client->>WhatsApp: Confirme l'envoi`
    },
    {
        name: 'sequence_rdv.png',
        type: 'mermaid',
        content: `sequenceDiagram
    actor Client
    participant InterfaceUI as Formulaire Rendez-vous
    participant Auth as Firebase Auth
    participant CloudDB as Firebase Firestore
    
    Client->>InterfaceUI: Saisit date et heure
    Client->>InterfaceUI: Clique sur Valider
    InterfaceUI->>Auth: Verifie connexion
    
    alt Non Authentifie
        Auth-->>InterfaceUI: Utilisateur non reconnu
        InterfaceUI-->>Client: Redirection connexion
    else Authentifie
        Auth-->>InterfaceUI: Token valide
        InterfaceUI->>CloudDB: Insertion RDV
        CloudDB->>CloudDB: Verifie quotas
        
        alt Quota atteint
            CloudDB-->>InterfaceUI: Erreur date
            InterfaceUI-->>Client: Affiche pop-up
        else Quota respecte
            CloudDB-->>InterfaceUI: Insertion reussie
            InterfaceUI-->>Client: Message confirme
        end
    end`
    },
    {
        name: 'class_diagram.png',
        type: 'mermaid',
        content: `classDiagram
    class Utilisateur {
        +String UID
        +String nomComplet
        +String role
        +sInscrire()
        +seConnecter()
    }
    
    class Produit {
        +String ReferenceID
        +String nomMonture
        +String categorie
        +String imageUrl
        +modifierStock()
    }
    
    class RendezVous {
        +String RDV_ID
        +Date dateRDV
        +String motif
        +String fk_utilisateur_UID
        +annulerRDV()
    }

    Utilisateur "1" o--  "0..*" RendezVous : effectue
    Administrateur "1" o-- "0..*" Produit : gere
    Utilisateur <|-- Administrateur : herite`
    }
];

function downloadImage(diagram) {
    return new Promise((resolve, reject) => {
        const data = diagram.content;
        const options = {
            hostname: 'kroki.io',
            port: 443,
            path: '/' + diagram.type + '/png',
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
                console.error("Failed to generate " + diagram.name + ": " + res.statusCode);
                res.resume();
                return resolve(false);
            }
            const file = fs.createWriteStream(path.join(dir, diagram.name));
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log("Successfully saved " + diagram.name);
                resolve(true);
            });
        });

        req.on('error', (e) => {
            console.error("Problem with request: " + e.message);
            resolve(false);
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    for (const d of diagrams) {
        await downloadImage(d);
    }
}

run();
