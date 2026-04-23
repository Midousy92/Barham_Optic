# PROJET DE MÉMOIRE : PROTOCOLE DE RECHERCHE

**Thème : Mise en place d'une plateforme web e-commerce et de gestion de rendez-vous pour Barham Optic**

---

### I. Introduction

L’intégration du numérique dans le secteur de la santé visuelle n'est plus une simple option, mais une nécessité stratégique. Face à une clientèle de plus en plus connectée, les cabinets d'optique doivent repenser leur approche pour offrir des services rapides, accessibles et modernes. C'est dans cette dynamique d'innovation technologique que s'inscrit le présent projet, réalisé au sein de l'entreprise **Barham Optic**, spécialisée dans la vente de lunettes et les prestations de services optiques. Ce travail vise à concevoir une solution complète permettant de digitaliser les offres du cabinet et de simplifier l'interaction avec les patients.

### II. Contexte justificatif du projet

Le projet trouve sa justification dans les limites organisationnelles rencontrées actuellement par la boutique Barham Optic. Actuellement, la gestion de la clientèle repose sur des méthodes traditionnelles : accueil physique exclusif pour la découverte des montures, prises de rendez-vous téléphoniques fastidieuses, et un registre manuel pour la gestion des données patient. Cette organisation entraîne des engorgements en salle d'attente, une visibilité restreinte des collections (limitée aux passants du quartier), et un risque élevé d'erreurs (doublons de rendez-vous). La transition vers un système informatisé, accessible 24h/24, se justifie par le besoin impératif de moderniser l'image de marque et d'optimiser le temps de travail du personnel.

### III. Problématique

Au regard du contexte défini, la question centrale qui guidera nos travaux de recherche et de développement est la suivante :
_« Comment concevoir, développer et déployer une plateforme e-commerce et de prise de rendez-vous fiable, capable d'optimiser la gestion interne de Barham Optic tout en améliorant significativement l'expérience d'acquisition des clients ? »_

### IV. Objectifs de recherche

#### a. Objectif général

L'objectif général de ce projet est de numériser de bout en bout l'activité de l'entreprise par la conception et la mise en ligne d'une application web dynamique, responsive et sécurisée.

#### b. Objectifs spécifiques

Pour atteindre cet objectif général, nous nous fixons les objectifs spécifiques suivants :

- Mettre en place un catalogue numérique public intégrant un système de recherche et de filtrage dynamique multicritères (par marque, prix, type).
- Concevoir un module automatisé de prise de rendez-vous en ligne, incluant des garde-fous pour empêcher le surbooking de l'opticien.
- Faciliter le tunnel d'achat en développant une intégration directe avec l'API WhatsApp pour valider les commandes.
- Développer un tableau de bord (Dashboard) sécurisé (CRUD) permettant à l'administrateur de gérer son catalogue et de suivre les consultations sans nécessiter de compétences en informatique.

### V. Hypothèse de recherche

L’hypothèse principale de notre travail postule que **l'implémentation d'une architecture logicielle moderne orientée "Serverless" (basée sur le cloud Firebase) couplée à une interface utilisateur intuitive (HTML/CSS/JS) réduira significativement les frictions organisationnelles**. Concrètement, nous supposons que cette digitalisation déchargera le secrétariat de plus de 50% des appels entrants pour motif de rendez-vous, et augmentera la visibilité commerciale du catalogue.

### VI. Méthodes et techniques d'investigation

Pour mener à bien cette étude et concevoir une solution adaptée, notre démarche méthodologique s'articulera autour des axes suivants :

- **Recherche documentaire et Webographie :** Étude des standards actuels du web, des architectures Cloud (BaaS) et des bonnes pratiques en UI/UX design.
- **Méthode d'analyse et de conception :** Utilisation du langage de modélisation standardisé **UML (Unified Modeling Language)** pour schématiser les interactions, formaliser les cas d'utilisation et structurer la base de données.
- **Approche itérative (Inspiration Agile) :** Développement modulaire du code avec des phases de tests continus (intégration statique d'abord, dynamisation JavaScript ensuite, puis connexion au backend Firebase).

### VII. Bibliographie provisoire

- **Roques, P.**, _UML 2 par la pratique : Études de cas et exercices corrigés_.
- **Mozilla Developer Network (MDN)** - _Architecture JavaScript et manipulation du DOM_. URL : https://developer.mozilla.org/fr/
- **Documentation Google Firebase** - _Cloud Firestore & Firebase Authentication Guidelines_. URL : https://firebase.google.com/docs
- **WhatsApp Business API** - _Structuring wa.me text parameters_. URL : https://faq.whatsapp.com/
