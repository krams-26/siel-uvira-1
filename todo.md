# Project TODO

- [x] Authentification sécurisée et RBAC granulaire pour Sous-PROVED, Secrétariat, Chef de bureau, OPS, Inspecteur, École et Admin
- [x] Modèle configurable des permissions par action : consulter, créer, modifier, orienter, valider, rejeter, signer, exporter et administrer
- [x] Référentiel des écoles avec fiche complète, recherche, filtres et historique des modifications
- [x] Gestion des bureaux et rattachement institutionnel des utilisateurs
- [x] Gestion du courrier entrant et sortant avec priorité, délais, pièces jointes et statuts
- [x] Numérotation annuelle par séquence transactionnelle, unique et configurable
- [x] Workflow de dossiers réception → orientation → instruction → avis → OPS → signature → archivage
- [x] Historique complet de chaque transition de workflow
- [x] Tableaux de bord Sous-PROVED, Secrétariat, Chefs de bureau et OPS
- [x] GED avec métadonnées, recherche, versions, aperçu et archivage
- [x] Stockage S3 des fichiers et persistance des références en base de données
- [x] Modèles documentaires avec variables {{nom_variable}} et prévisualisation
- [x] Génération de documents administratifs et prévisualisation avant impression
- [x] Rapports des écoles avec dépôt, contrôle, validation, rejet et demande de complément
- [x] Statistiques filtrables et exports CSV, Excel et PDF
- [x] Notifications in-app extensibles via NotificationService
- [x] Journal d’audit non supprimable par les utilisateurs ordinaires et détaillant avant/après
- [x] Données de démonstration non sensibles pour valider les parcours sans fabriquer de témoignages ou d’avis utilisateurs
- [x] Tests Vitest des règles RBAC, séquences, transitions de workflow, audit et procédures principales
- [x] Vérification TypeScript, tests, rendu responsive et logs du serveur
- [x] Sauvegarde d’un checkpoint final après validation de la version utilisable

## Corrections nécessaires avant livraison

- [x] Appliquer réellement les permissions granulaires aux procédures tRPC et ajouter une gestion configurable des permissions et affectations
- [x] Compléter les modules écoles, bureaux et utilisateurs avec CRUD, filtres avancés, mises à jour et historique consultable
- [x] Implémenter un workflow métier contraint avec transitions autorisées, vues par rôle et historique consultable
- [x] Brancher le stockage S3 et les pièces jointes aux courriers et documents
- [x] Ajouter un NotificationService et créer automatiquement les alertes lors des événements clés
- [x] Ajouter la consultation de l’audit et appliquer la règle de non-suppression sauf Admin
- [x] Ajouter des tests Vitest pour séquences, transitions, audit et procédures critiques
- [x] Vérifier réellement les vues responsive avec des captures d’écran

## Adaptation aux références SIEL-EDU et commission d’affectation

- [x] Repenser l’identité visuelle en style institutionnel SIEL-EDU : bleu profond, bleu vif, vert, orange, cartes KPI et navigation latérale
- [x] Ajouter les rubriques de navigation Gestion des écoles, Personnel, Documents & Rapports, Actes administratifs, Statistiques, Examens, Communication, Paramètres, Utilisateurs et Rôles & Permissions
- [ ] Créer les écrans détaillés écoles : liste filtrable, fiche école, statistiques, personnel, documents et historique
- [ ] Créer les écrans personnel et affectations avec liste des agents, fiche agent et historique des affectations
- [ ] Créer les écrans actes administratifs, rapports manquants et portail école
- [x] Ajouter le formulaire structuré de commission d’affectation selon le modèle fourni
- [x] Prévisualiser la commission d’affectation avec en-tête institutionnel et sans aucune mention « MINUTE »
- [x] Ajouter les champs de mutation, promotion, révocation, mise en disponibilité, suspension, exclusion, désertion, maladie, retraite, décès et autres motifs du modèle
- [x] Tester visuellement les nouveaux écrans sur desktop et mobile
