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
- [x] Créer les écrans détaillés écoles : liste filtrable, fiche école, statistiques, personnel, documents et historique
- [x] Créer les écrans personnel et affectations avec liste des agents, fiche agent et historique des affectations
- [x] Créer les écrans actes administratifs, rapports manquants et portail école
- [x] Ajouter le formulaire structuré de commission d’affectation selon le modèle fourni
- [x] Prévisualiser la commission d’affectation avec en-tête institutionnel et sans aucune mention « MINUTE »
- [x] Ajouter les champs de mutation, promotion, révocation, mise en disponibilité, suspension, exclusion, désertion, maladie, retraite, décès et autres motifs du modèle
- [x] Tester visuellement les nouveaux écrans sur desktop et mobile

## Refonte fonctionnelle après retour utilisateur

- [x] Vérifier systématiquement chaque entrée de navigation et supprimer toutes les routes qui renvoient vers une page générique ou 404
- [x] Reproduire le tableau de bord de la planche avec KPI colorés, activités récentes, alertes, statistiques et recherche écoles
- [x] Reproduire la gestion des écoles avec liste, fiche détaillée, onglets statistiques/personnel/documents/historique et actions fonctionnelles
- [x] Reproduire la gestion du personnel avec liste, fiche agent, affectations, actes et historique
- [x] Reproduire les écrans Documents & Rapports avec liste, ajout de document et rapports manquants
- [x] Reproduire les écrans Actes administratifs avec liste, commission d’affectation, PV disciplinaire et PV d’ouverture
- [x] Reproduire le portail école avec tableau de bord, dépôt de rapport, circulaires et résultats
- [x] Brancher les boutons visibles à de vraies actions ou retirer les boutons non fonctionnels
- [x] Vérifier toutes les routes desktop et mobile, corriger les erreurs de navigation et les états vides

## Correction prioritaire : portail des établissements et commissions

- [x] Permettre l’activation d’un compte portail école via la connexion OAuth puis son rattachement strict à une seule école depuis l’administration.
- [x] Isoler les données visibles et modifiables par chaque compte école selon le RBAC et l’établissement rattaché.
- [x] Ajouter le tableau de bord école avec informations générales, statistiques scolaires, personnels, documents, rapports, circulaires et résultats.
- [x] Permettre à une école de compléter et mettre à jour ses statistiques et son personnel avec historique et validation côté Sous-PROVED.
- [x] Permettre la diffusion d’un courrier à une ou plusieurs écoles ciblées, ou à toutes les écoles, avec accusé de réception et notifications.
- [x] Ajouter un espace de consultation des courriers reçus dans chaque portail école.
- [x] Rendre la création de commission d’affectation visible depuis Actes administratifs et accessible par une action "Nouvelle commission".
- [x] Persister les commissions d’affectation avec les champs du modèle fourni, aperçu sans mention « MINUTE », validation, signature et archivage.
- [x] Tester l’isolation entre deux écoles, les courriers ciblés/généraux, le portail école et le parcours complet de commission.

## Import pilote des écoles et rapports

- [x] Analyser les feuilles secondaire, primaire et maternelle du tableau fourni et normaliser les fiches écoles exploitables.
- [x] Importer au moins 30 établissements réels avec code SECOPE, niveau, régime, effectifs et personnel disponibles.
- [x] Préparer un précompte portail rattaché pour chaque établissement importé, sans inventer d’identité ou de coordonnées de responsable.
- [x] Ajouter des types de rapports scolaires initiaux : palmarès, PV de réunion et document justificatif.
- [x] Vérifier l’import en base, les fiches portail et les futurs parcours de dépôt de rapports.

## Validation du portail école importé

- [x] Tester un compte école importé de bout en bout : rattachement, affichage de la fiche, isolation des données et consultation des courriers.
- [x] Vérifier le dépôt d’un palmarès, d’un PV de réunion et d’un document justificatif depuis un portail rattaché, avec visibilité côté Sous-PROVED.

## Scénarios positifs d’activation et de dépôt

- [ ] Tester le rattachement d’un précompte école importé à son établissement et la consultation de ses courriers reçus.
- [ ] Tester un dépôt réussi pour les types palmarès, PV de réunion et justificatif, puis leur apparition dans la revue Sous-PROVED.
