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
- [ ] GED avec métadonnées, recherche, versions, aperçu et archivage
- [ ] Stockage S3 des fichiers et persistance des références en base de données
- [ ] Modèles documentaires avec variables {{nom_variable}} et prévisualisation
- [ ] Génération de documents administratifs et prévisualisation avant impression
- [ ] Rapports des écoles avec dépôt, contrôle, validation, rejet et demande de complément
- [ ] Statistiques filtrables et exports CSV, Excel et PDF
- [x] Notifications in-app extensibles via NotificationService
- [x] Journal d’audit non supprimable par les utilisateurs ordinaires et détaillant avant/après
- [ ] Données de démonstration non sensibles pour valider les parcours sans fabriquer de témoignages ou d’avis utilisateurs
- [x] Tests Vitest des règles RBAC, séquences, transitions de workflow, audit et procédures principales
- [x] Vérification TypeScript, tests, rendu responsive et logs du serveur
- [ ] Sauvegarde d’un checkpoint final après validation de la version utilisable

## Corrections nécessaires avant livraison

- [x] Appliquer réellement les permissions granulaires aux procédures tRPC et ajouter une gestion configurable des permissions et affectations
- [ ] Compléter les modules écoles, bureaux et utilisateurs avec CRUD, filtres avancés, mises à jour et historique consultable
- [x] Implémenter un workflow métier contraint avec transitions autorisées, vues par rôle et historique consultable
- [x] Brancher le stockage S3 et les pièces jointes aux courriers et documents
- [x] Ajouter un NotificationService et créer automatiquement les alertes lors des événements clés
- [x] Ajouter la consultation de l’audit et appliquer la règle de non-suppression sauf Admin
- [x] Ajouter des tests Vitest pour séquences, transitions, audit et procédures critiques
- [x] Vérifier réellement les vues responsive avec des captures d’écran
