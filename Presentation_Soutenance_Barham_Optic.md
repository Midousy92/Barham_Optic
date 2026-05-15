# Plan de Soutenance - Barham Optic (Version 15 Slides)

Ce document est un guide pour construire vos 15 diapositives (PowerPoint / Keynote). 
**Règle d'or :** Ne mettez pas trop de texte sur les diapositives. Les "Points clés" vont sur l'écran, et le "Discours" est ce que vous devez dire à l'oral (en moyenne 1 minute par slide).

---

## Slide 1 : Page de Garde
*   **Titre :** Digitalisation de Barham Optic et Implémentation d'un CRM Médical
*   **Sous-titre :** Soutenance de mémoire de fin d'études
*   **Présenté par :** [Ton Nom]
*   **Encadré par :** [Nom du Professeur/Encadrant]
*   *Visuel : Le logo de Barham Optic bien centré.*

---

## Slide 2 : Plan de la présentation
*   Contexte et Problématique
*   Méthodologie et Architecture
*   Développement des modules (Vitrine, CRM, Dashboard)
*   Sécurité et Déploiement
*   Bilan et Perspectives
*   *(Discours : "Bonjour à tous. Voici comment va s'articuler la présentation de mon travail sur la modernisation du cabinet Barham Optic...")*

---

## Slide 3 : Contexte (Barham Optic)
*   **Points clés :**
    *   Cabinet d'optique et lunetterie reconnu.
    *   Forte relation client de proximité.
    *   Besoin vital de transition numérique face à l'évolution du marché.
*   *(Discours : "Barham Optic possède une véritable expertise métier. Cependant, pour ne pas se laisser distancer par les nouvelles habitudes des consommateurs connectés, il fallait franchir un cap technologique.")*

---

## Slide 4 : Limites de l'Existant & Problématique
*   **Points clés :**
    *   Gestion manuelle des rendez-vous (risque de surbooking).
    *   Catalogue invisible en dehors de la boutique physique.
    *   Dossiers médicaux physiques chronophages.
    *   **Problématique :** *Comment moderniser la gestion de l'activité, optimiser le flux de patients et augmenter les ventes grâce au web ?*
*   *(Discours : "Le tout-papier montrait ses limites. Retrouver une ordonnance prenait du temps, et les clients ne pouvaient pas voir les montures le soir depuis chez eux.")*

---

## Slide 5 : La Solution Proposée
*   **Points clés :**
    *   Développement d'une plateforme web hybride (Vitrine + Gestion).
    *   **Côté client :** E-commerce, réservation en ligne, simulateur visuel.
    *   **Côté cabinet :** CRM Médical, génération d'ordonnances, gestion des stocks.

---

## Slide 6 : Démarche Méthodologique (UML)
*   **Points clés :**
    *   Modélisation des besoins avant le code.
    *   Définition des rôles : Client vs Administrateur/Médecin.
*   *Visuel : Insérer ici une version simplifiée du Diagramme des Cas d'Utilisation.*
*   *(Discours : "Avant de coder, j'ai modélisé les interactions grâce au langage UML. Cela m'a permis de bien séparer ce qu'un patient a le droit de faire par rapport au médecin.")*

---

## Slide 7 : Architecture Cloud & Technologies
*   **Points clés :**
    *   **Approche :** Serverless / BaaS (Backend as a Service).
    *   **Front-end :** HTML5, CSS3, JavaScript Vanilla (sans framework lourd).
    *   **Back-end :** Google Firebase (Firestore, Auth).
*   *Visuel : Insérer le Schéma de l'Architecture Technique.*
*   *(Discours : "Pour garantir rapidité et coûts réduits, j'ai opté pour une architecture Serverless avec JavaScript Vanilla et Firebase. Pas besoin de gérer de serveurs physiques.")*

---

## Slide 8 : Modélisation des Données (NoSQL)
*   **Points clés :**
    *   Utilisation de Firestore (Orienté Document).
    *   Structuration des entités : Utilisateurs, Dossiers Médicaux, Produits, Rendez-vous.
*   *Visuel : Insérer le Diagramme de Classes.*
*   *(Discours : "En base de données, nous sommes sur du NoSQL. J'ai structuré les collections de façon à ce qu'un Dossier Médical et des Ordonnances soient directement liés à l'identifiant du patient.")*

---

## Slide 9 : Réalisation 1 - L'Expérience Client (E-commerce)
*   **Points clés :**
    *   Design moderne et épuré.
    *   Filtres dynamiques multicritères (Prix, Catégories, Marques).
    *   Recherche en temps réel.
*   *Visuel : Capture d'écran de la page des collections (avec les filtres).*

---

## Slide 10 : Réalisation 2 - Le Simulateur interactif
*   **Points clés :**
    *   Mise en avant des traitements optiques (Lumière bleue, Anti-reflet).
    *   Effet "Avant/Après" interactif au survol.
*   *Visuel : Capture d'écran de la page Verres.*
*   *(Discours : "Pour rendre le site premium, j'ai codé un simulateur visuel en CSS. Le client passe sa souris et voit immédiatement l'avantage d'acheter un verre anti-reflet.")*

---

## Slide 11 : Réalisation 3 - Le Social Commerce (WhatsApp)
*   **Points clés :**
    *   Processus de commande sans friction.
    *   Redirection vers l'API WhatsApp avec message pré-généré.
    *   Adapté aux habitudes des consommateurs cibles.
*   *(Discours : "Plutôt qu'un paiement par carte bancaire lourd, le bouton 'Acheter' ouvre WhatsApp avec la référence de la lunette. C'est immédiat, humain, et ça convertit très bien.")*

---

## Slide 12 : Réalisation 4 - Le CRM Médical
*   **Points clés :**
    *   Annuaire des patients via des "ID courts".
    *   Édition complète du dossier clinique (antécédents, corrections).
    *   Génération automatique d'ordonnances imprimables.
*   *Visuel : Capture d'écran du Dossier Patient ou d'une Ordonnance.*
*   *(Discours : "C'est l'outil métier par excellence. L'opticien retrouve le patient via un code court, saisit la correction optique, et génère un PDF d'ordonnance que le patient retrouve sur son Espace Personnel.")*

---

## Slide 13 : Réalisation 5 - Le Dashboard Administrateur
*   **Points clés :**
    *   Gestion CRUD complète du catalogue.
    *   *Soft Delete* : Statuts "En stock, Rupture, Masqué".
    *   **Optimisation :** Algorithme de compression d'images en Base64.
*   *Visuel : Capture d'écran du panneau d'administration.*
*   *(Discours : "Le gérant pilote tout ici. J'ai codé un algorithme qui compresse les images de lunettes en Base64 avant l'envoi, ce qui rend notre stockage de base de données gratuit.")*

---

## Slide 14 : Sécurité et Déploiement
*   **Points clés :**
    *   Protection des accès : *Firestore Security Rules*.
    *   Gestion des quotas (ex: max 2 rendez-vous par heure).
    *   Déploiement continu (CI/CD) sur **Vercel** avec SSL (HTTPS).
*   *(Discours : "L'application est hautement sécurisée. Les règles Firestore bloquent toute tentative de piratage du catalogue, et le site est déployé automatiquement sur Vercel avec une connexion chiffrée HTTPS.")*

---

## Slide 15 : Bilan, Perspectives et Conclusion
*   **Points clés :**
    *   **Bilan :** Objectifs atteints (surbooking éliminé, processus digitalisés).
    *   **Perspectives :** Essai virtuel 3D, IA, Paiement automatisé.
    *   Merci de votre attention !
*   *(Discours : "Ce travail m'a permis de concevoir un logiciel de A à Z. Barham Optic est aujourd'hui armé pour l'avenir numérique. Je vous remercie pour votre attention et je suis prêt à répondre à vos questions.")*
