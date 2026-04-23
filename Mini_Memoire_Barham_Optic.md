# MINI-MÉMOIRE : DÉVELOPPEMENT D'UNE PLATEFORME WEB POUR BARHAM OPTIC

**Thème : Mise en place d'une plateforme web e-commerce et de gestion de rendez-vous pour Barham Optic**

---

## I. INTRODUCTION GÉNÉRALE

L’intégration du numérique dans le secteur de la santé visuelle n'est plus une simple option, mais une nécessité stratégique. Face à une clientèle de plus en plus connectée, les cabinets d'optique doivent repenser leur approche pour offrir des services rapides, accessibles et modernes. Historiquement, le domaine de la lunetterie s'est fortement appuyé sur le contact physique dû à la nécessité des essayages et des examens oculaires. Toutefois, les avancées du Web 2.0 permettent aujourd'hui de dématérialiser une grande partie de ce processus.

C'est dans cette dynamique d'innovation technologique que s'inscrit le présent projet, réalisé au sein de l'entreprise **Barham Optic**, spécialisée dans la vente de lunettes et les prestations de services optiques. Ce travail vise à concevoir une solution logicielle complète permettant de digitaliser les offres du cabinet et de simplifier l'interaction avec les patients, en passant d'un modèle de gestion purement physique à une organisation hybride (phygitale).

---

## II. CONTEXTE JUSTIFICATIF DU PROJET

L'étude préalable menée au sein de Barham Optic a permis de mettre en lumière plusieurs dysfonctionnements liés à l'organisation actuelle. Actuellement, la gestion de la clientèle repose exclusivement sur des méthodes traditionnelles :
1. **L'accueil physique exclusif :** La découverte des montures requiert le déplacement systématique du client, limitant le rayonnement géographique de la boutique.
2. **La gestion des rendez-vous :** Les prises de rendez-vous s'effectuent par appels téléphoniques fastidieux. Le registre manuel utilisé par le secrétariat engendre souvent des oublis ou des doublons de réservation.
3. **L'encombrement des locaux :** Les rendez-vous mal synchronisés entraînent des engorgements en salle d'attente, détériorant l'expérience du patient.

La transition vers un système informatisé, interactif et accessible 24h/24 ne relève donc pas d'un simple caprice technologique, mais se justifie par le besoin impératif de moderniser l'image de marque de l'établissement, d'optimiser le temps de travail du personnel administratif et d'élargir la zone de chalandise de l'opticien.

---

## III. PROBLÉMATIQUE

Derrière ces dysfonctionnements observationnels se cache un défi technique et structurel majeur. La question centrale qui guide nos travaux de recherche et de développement est la suivante :

> _« Comment concevoir, développer et déployer une plateforme e-commerce et de prise de rendez-vous fiable, capable d'optimiser la gestion interne de Barham Optic tout en améliorant significativement l'expérience d'acquisition des clients, le tout avec des contraintes de coûts d'hébergement maîtrisées ? »_

---

## IV. OBJECTIFS DE RECHERCHE

### a. Objectif général
L'objectif général de ce projet de recherche appliquée est de numériser de bout en bout l'activité de l'entreprise par la conception, le codage et la mise en production d'une application web dynamique, responsive (adaptée aux mobiles) et hautement sécurisée.

### b. Objectifs spécifiques
Pour matérialiser cet objectif général, le cahier des charges s'est articulé autour de quatre objectifs spécifiques :
* **Digitaliser le catalogue :** Mettre en place une vitrine numérique publique intégrant un système algorithmique de recherche et de filtrage dynamique multicritères (par marque, prix, type) exécutable instantanément par le navigateur.
* **Automatiser les réservations :** Concevoir un module de prise de rendez-vous en ligne asynchrone, incluant des garde-fous stricts dans la base de données (ex: blocage automatique au-delà de 2 rendez-vous par créneau horaire) pour empêcher le surbooking.
* **Optimiser le tunnel d'achat :** Faciliter le parcours client en développant une intégration directe avec l'API Web WhatsApp. Ainsi, la validation du panier génère un lien de discussion pré-rempli, transformant le site web en un outil de *Social Commerce* efficace.
* **Concevoir une Administration Autonome :** Développer un tableau de bord (Dashboard) sécurisé à l'architecture CRUD (Create, Read, Update, Delete) permettant à l'administrateur de gérer son catalogue et de suivre les consultations sans nécessiter de compétences avancées en programmation.

---

## V. HYPOTHÈSE DE RECHERCHE ET VÉRIFICATION

L’hypothèse principale de notre travail postulait que **l'implémentation d'une architecture logicielle moderne orientée "Serverless" (basée sur le cloud Firebase) couplée à une interface utilisateur intuitive (Vanilla HTML/CSS/JS) réduirait significativement les frictions organisationnelles**. 

**Vérification de l'hypothèse (Résultats obtenus) :**
La réalisation concrète du site a confirmé cette hypothèse. L'approche choisie se révèle extrêmement efficace :
- Le Secrétariat n'a plus à consigner les appels manuellement : les requêtes de rendez-vous s'affichent automatiquement dans le Dashboard sécurisé de l'administration.
- Le choix de ne **pas utiliser le stockage payant des médias** (Firebase Storage) mais de privilégier des chemins relatifs d'images locales synchronisés avec Firestore garantit à l'entreprise un projet hébergé à bas coût, maîtrisant le principe du *FinOps*.
- Le recours au langage natif (Vanilla JS, sans surcouches lourdes comme React.js) permet un chargement quasi instantané, favorisant l'expérience utilisateur mobile.

---

## VI. MÉTHODES ET TECHNIQUES D'INVESTIGATION

Pour mener à bien cette étude et aboutir à un produit logiciel robuste, notre démarche méthodologique s'est structurée sur trois axes :

### 1. Modélisation Conceptuelle (UML)
Avant d'écrire la moindre ligne de code, nous avons eu recours au **langage de modélisation standardisé UML (Unified Modeling Language)**. 
- *Les Diagrammes de Cas d'Utilisation* ont permis de scinder les droits entre l'Acteur Client (qui consulte le catalogue et réserve) et l'Acteur Administrateur (qui édite et supprime).
- *Les Diagrammes de Séquences* ont schématisé la chronologie des requêtes asynchrones entre l'interface utilisateur, la validation par Firebase Authentication, et l'enregistrement sur Cloud Firestore.

### 2. Le Stack Technologique Adopté
- **Le Front-end (Côté Client) :** L'interface a été entièrement codée en `HTML5` (pour la sémantique), `CSS3` (avec les modes Grid et Flexbox implémentant un design Responsive) et animée via `JavaScript`.
- **Le Back-end (Côté Serveur) :** Le choix de l'architecture s'est porté sur un Backend-as-a-Service (BaaS) via Google Firebase. Nous exploitons spécifiquement :
  - *Firebase Authentication :* Pour la création protégée des profils patients et de l'accès Administrateur.
  - *Cloud Firestore :* Pour l'hébergement de notre base de données NoSQL distribuée (stockage au format JSON de notre catalogue avec traitement instantané).

### 3. L'Approche Itérative (Inspiration Agile)
Le développement a suivi un cycle évolutif et itératif : intégration des maquettes statiques d'abord, dynamisation par algorithmes JavaScript ensuite (le panier en LocalStorage), pour achever par le branchement aux serveurs Cloud Firebase et la restriction sécuritaire des routes privées. 

---

## VII. BIBLIOGRAPHIE ET TECHNOLOGIES

1. **Roques, P.**, _UML 2 par la pratique : Études de cas et exercices corrigés_ - (Ouvrage de formalisation d'architecture système).
2. **Mozilla Developer Network (MDN)** - _Architecture JavaScript Asynchrone, DOM manipulation et API Fetch_. URL : https://developer.mozilla.org/fr/
3. **Google Firebase Documentation** - _Sécurisation des bases Cloud Firestore & Firebase Authentication Guidelines_. URL : https://firebase.google.com/docs
4. **WhatsApp Business API Docs** - _Implémentation du Click-to-chat et structuration automatique par balises URL wa.me_. URL : https://faq.whatsapp.com/
