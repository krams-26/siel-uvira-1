import fs from 'node:fs';

const assets = JSON.parse(fs.readFileSync('/home/ubuntu/siel-uvira-1/tmp/demo-assets.json', 'utf8'));
const asset = name => assets.find(item => item.name === name);
const palmares = asset('rapport-demo-palmares.pdf');
const pv = asset('pv-reunion-demo.pdf');
const justificatif = asset('justificatif-demo.pdf');
const circulaire = asset('circulaire-demo.pdf');

const sql = `
-- Toutes les lignes de ce lot sont volontairement libellées DEMO et séparées des données réelles.
INSERT INTO users (openId,name,email,loginMethod,role,isActive)
VALUES
('demo-sous-proved','DEMO — Sous-PROVED','demo.sousproved@example.test','demo','sous_proved',true),
('demo-secretariat','DEMO — Secrétariat','demo.secretariat@example.test','demo','secretariat',true),
('demo-chef-baf','DEMO — Chef BAF','demo.baf@example.test','demo','chef_bureau',true),
('demo-ops','DEMO — OPS','demo.ops@example.test','demo','ops',true),
('demo-inspecteur','DEMO — Inspecteur','demo.inspecteur@example.test','demo','inspecteur',true)
ON DUPLICATE KEY UPDATE name=VALUES(name),email=VALUES(email),role=VALUES(role),isActive=true;

INSERT INTO offices (code,name,description,isActive)
VALUES
('DEMO-SEC','DEMO — Secrétariat','Bureau de démonstration du secrétariat',true),
('DEMO-BAF','DEMO — Bureau administratif et financier','Bureau de démonstration BAF',true),
('DEMO-OPS','DEMO — OPS','Bureau de démonstration OPS',true),
('DEMO-INS','DEMO — Inspection','Bureau de démonstration inspection',true)
ON DUPLICATE KEY UPDATE name=VALUES(name),description=VALUES(description),isActive=true;

INSERT INTO schools (code,officialName,schoolType,level,directorName,phone,email,province,territory,commune,quartier,status,legalStatus,decreeNumber,studentCount,femaleStudentCount,maleStudentCount,teacherCount,notes,createdBy)
VALUES
('DEMO-SEC-001','DEMO — Institut Horizon','secondaire','secondaire','Responsable Démonstration Horizon','+243 000 000 101','horizon@example.test','Sud-Kivu','Uvira','Uvira','Kalundu','active','DEMO','ARRETE-DEMO-001',486,242,244,31,'Donnée de démonstration — ne pas confondre avec les établissements réels.',1),
('DEMO-PRI-001','DEMO — École Primaire Lumière','primaire','primaire','Responsable Démonstration Lumière','+243 000 000 102','lumiere@example.test','Sud-Kivu','Uvira','Uvira','Mulongwe','active','DEMO','ARRETE-DEMO-002',312,158,154,17,'Donnée de démonstration — ne pas confondre avec les établissements réels.',1),
('DEMO-MAT-001','DEMO — Maternelle Espoir','maternelle','maternelle','Responsable Démonstration Espoir','+243 000 000 103','espoir@example.test','Sud-Kivu','Uvira','Uvira','Kavimvira','active','DEMO','ARRETE-DEMO-003',96,49,47,9,'Donnée de démonstration — ne pas confondre avec les établissements réels.',1),
('DEMO-TEC-001','DEMO — Institut Technique Avenir','technique','secondaire','Responsable Démonstration Avenir','+243 000 000 104','avenir@example.test','Sud-Kivu','Uvira','Uvira','Kilibula','active','DEMO','ARRETE-DEMO-004',274,122,152,24,'Donnée de démonstration — ne pas confondre avec les établissements réels.',1)
ON DUPLICATE KEY UPDATE officialName=VALUES(officialName),studentCount=VALUES(studentCount),femaleStudentCount=VALUES(femaleStudentCount),maleStudentCount=VALUES(maleStudentCount),teacherCount=VALUES(teacherCount),notes=VALUES(notes);

INSERT INTO users (openId,name,email,loginMethod,role,schoolId,isActive)
SELECT 'demo-school-horizon','DEMO — Portail Institut Horizon','horizon.portail@example.test','demo','ecole',id,true FROM schools WHERE code='DEMO-SEC-001'
ON DUPLICATE KEY UPDATE name=VALUES(name),schoolId=VALUES(schoolId),role='ecole',isActive=true;
INSERT INTO users (openId,name,email,loginMethod,role,schoolId,isActive)
SELECT 'demo-school-lumiere','DEMO — Portail EP Lumière','lumiere.portail@example.test','demo','ecole',id,true FROM schools WHERE code='DEMO-PRI-001'
ON DUPLICATE KEY UPDATE name=VALUES(name),schoolId=VALUES(schoolId),role='ecole',isActive=true;
INSERT INTO users (openId,name,email,loginMethod,role,schoolId,isActive)
SELECT 'demo-school-espoir','DEMO — Portail EMA Espoir','espoir.portail@example.test','demo','ecole',id,true FROM schools WHERE code='DEMO-MAT-001'
ON DUPLICATE KEY UPDATE name=VALUES(name),schoolId=VALUES(schoolId),role='ecole',isActive=true;

INSERT INTO userOfficeAssignments (userId,officeId,jobTitle,employeeNumber)
SELECT u.id,o.id,'Chef de bureau DEMO','DEMO-BAF-01' FROM users u JOIN offices o ON o.code='DEMO-BAF' WHERE u.openId='demo-chef-baf';
INSERT INTO userOfficeAssignments (userId,officeId,jobTitle,employeeNumber)
SELECT u.id,o.id,'Agent OPS DEMO','DEMO-OPS-01' FROM users u JOIN offices o ON o.code='DEMO-OPS' WHERE u.openId='demo-ops';

INSERT INTO schoolStaff (schoolId,fullName,gender,functionTitle,qualification,employeeNumber,status,createdBy)
SELECT id,'DEMO — Amina Kabanga','F','Directrice','Licence','DEMO-PERS-001','active',1 FROM schools WHERE code='DEMO-SEC-001';
INSERT INTO schoolStaff (schoolId,fullName,gender,functionTitle,qualification,employeeNumber,status,createdBy)
SELECT id,'DEMO — Jean Bahati','M','Professeur','Graduat','DEMO-PERS-002','active',1 FROM schools WHERE code='DEMO-SEC-001';
INSERT INTO schoolStaff (schoolId,fullName,gender,functionTitle,qualification,employeeNumber,status,createdBy)
SELECT id,'DEMO — Clarisse Mukunzi','F','Enseignante','Graduat','DEMO-PERS-003','active',1 FROM schools WHERE code='DEMO-PRI-001';

INSERT INTO schoolStatistics (schoolId,schoolYear,studentCount,femaleStudentCount,maleStudentCount,teacherCount,classroomCount,status,submittedBy,reviewedBy)
SELECT s.id,'2025-2026',486,242,244,31,18,'validated',u.id,(SELECT id FROM users WHERE openId='demo-sous-proved') FROM schools s JOIN users u ON u.openId='demo-school-horizon' WHERE s.code='DEMO-SEC-001'
ON DUPLICATE KEY UPDATE studentCount=VALUES(studentCount),status='validated';
INSERT INTO schoolStatistics (schoolId,schoolYear,studentCount,femaleStudentCount,maleStudentCount,teacherCount,classroomCount,status,submittedBy)
SELECT s.id,'2025-2026',312,158,154,17,12,'submitted',u.id FROM schools s JOIN users u ON u.openId='demo-school-lumiere' WHERE s.code='DEMO-PRI-001'
ON DUPLICATE KEY UPDATE studentCount=VALUES(studentCount),status='submitted';

INSERT INTO dossiers (reference,subject,description,source,sender,externalReference,schoolId,currentOfficeId,status,priority,receivedAt,dueAt,createdBy)
SELECT 'DEMO-COUR-2026-0001','Transmission du palmarès trimestriel DEMO','Dossier de démonstration pour le circuit de traitement.','Portail école','DEMO — Institut Horizon','HORIZON-DEM-001',s.id,o.id,'pending_signature','urgent',NOW(),DATE_ADD(NOW(),INTERVAL 4 DAY),u.id FROM schools s JOIN offices o ON o.code='DEMO-OPS' JOIN users u ON u.openId='demo-secretariat' WHERE s.code='DEMO-SEC-001'
ON DUPLICATE KEY UPDATE subject=VALUES(subject),status='pending_signature',priority='urgent';
INSERT INTO dossiers (reference,subject,description,source,sender,externalReference,schoolId,currentOfficeId,status,priority,receivedAt,dueAt,createdBy)
SELECT 'DEMO-COUR-2026-0002','Demande de mise à jour des statistiques DEMO','Dossier de démonstration orienté vers le BAF.','Courrier entrant','DEMO — EP Lumière','LUMIERE-DEM-002',s.id,o.id,'in_review','normal',NOW(),DATE_ADD(NOW(),INTERVAL 10 DAY),u.id FROM schools s JOIN offices o ON o.code='DEMO-BAF' JOIN users u ON u.openId='demo-secretariat' WHERE s.code='DEMO-PRI-001'
ON DUPLICATE KEY UPDATE subject=VALUES(subject),status='in_review';

INSERT INTO dossierEvents (dossierId,action,fromStatus,toStatus,fromOfficeId,toOfficeId,comment,actorId)
SELECT d.id,'ORIENTED','received','in_review',NULL,o.id,'DEMO — orientation vers le BAF pour analyse.',u.id FROM dossiers d JOIN offices o ON o.code='DEMO-BAF' JOIN users u ON u.openId='demo-secretariat' WHERE d.reference='DEMO-COUR-2026-0002';
INSERT INTO dossierEvents (dossierId,action,fromStatus,toStatus,fromOfficeId,toOfficeId,comment,actorId)
SELECT d.id,'READY_FOR_SIGNATURE','ops_validation','pending_signature',o.id,o.id,'DEMO — avis OPS favorable.',u.id FROM dossiers d JOIN offices o ON o.code='DEMO-OPS' JOIN users u ON u.openId='demo-ops' WHERE d.reference='DEMO-COUR-2026-0001';

INSERT INTO documents (dossierId,schoolId,officeId,title,documentType,category,reference,version,fileKey,fileUrl,mimeType,fileSize,uploadedBy)
SELECT d.id,s.id,o.id,'DEMO — Circulaire de collecte statistique','circulaire','communication','DEMO-CIRC-2026-001',1,'${circulaire.key}','${circulaire.url}','application/pdf',96,u.id FROM dossiers d JOIN schools s ON s.code='DEMO-SEC-001' JOIN offices o ON o.code='DEMO-SEC' JOIN users u ON u.openId='demo-secretariat' WHERE d.reference='DEMO-COUR-2026-0001';
INSERT INTO documentTemplates (name,documentType,body,variables,isActive,createdBy)
VALUES ('DEMO — Lettre de transmission','courrier','Objet : {{objet}}\nÉtablissement : {{ecole}}\nRéférence : {{reference}}','["objet","ecole","reference"]',true,(SELECT id FROM users WHERE openId='demo-secretariat'));

INSERT INTO reports (schoolId,reportType,period,status,fileKey,fileUrl,observations,submittedBy,reviewedBy,reviewedAt)
SELECT s.id,'palmares','1er trimestre 2025-2026','accepted','${palmares.key}','${palmares.url}','DEMO — rapport validé pour vérifier la revue.',u.id,(SELECT id FROM users WHERE openId='demo-sous-proved'),NOW() FROM schools s JOIN users u ON u.openId='demo-school-horizon' WHERE s.code='DEMO-SEC-001';
INSERT INTO reports (schoolId,reportType,period,status,fileKey,fileUrl,observations,submittedBy)
SELECT s.id,'pv_reunion','Janvier 2026','received','${pv.key}','${pv.url}','DEMO — PV en attente de revue.',u.id FROM schools s JOIN users u ON u.openId='demo-school-lumiere' WHERE s.code='DEMO-PRI-001';
INSERT INTO reports (schoolId,reportType,period,status,fileKey,fileUrl,observations,submittedBy,reviewedBy,reviewedAt)
SELECT s.id,'justificatif','Février 2026','rejected','${justificatif.key}','${justificatif.url}','DEMO — compléter la référence de l’acte.',u.id,(SELECT id FROM users WHERE openId='demo-sous-proved'),NOW() FROM schools s JOIN users u ON u.openId='demo-school-espoir' WHERE s.code='DEMO-MAT-001';

INSERT INTO schoolBulletins (reference,title,body,audience,documentId,createdBy)
VALUES ('DEMO-CIRC-2026-001','DEMO — Collecte des statistiques','Communication fictive destinée à vérifier l’affichage et l’accusé de réception.','all',(SELECT id FROM documents WHERE reference='DEMO-CIRC-2026-001' LIMIT 1),(SELECT id FROM users WHERE openId='demo-secretariat'))
ON DUPLICATE KEY UPDATE title=VALUES(title),body=VALUES(body);
INSERT IGNORE INTO schoolBulletinRecipients (bulletinId,schoolId,readAt,acknowledgedAt)
SELECT b.id,s.id,CASE WHEN s.code='DEMO-SEC-001' THEN NOW() ELSE NULL END,CASE WHEN s.code='DEMO-SEC-001' THEN NOW() ELSE NULL END FROM schoolBulletins b JOIN schools s ON s.code IN ('DEMO-SEC-001','DEMO-PRI-001','DEMO-MAT-001','DEMO-TEC-001') WHERE b.reference='DEMO-CIRC-2026-001';

INSERT INTO assignmentCommissions (reference,agentDinacope,agentName,postName,firstName,gender,diploma,\`option\`,destinationSchoolId,destinationFunction,actNature,actReference,effectiveDate,reason,previousSchoolName,previousSchoolCode,previousFunction,previousProvince,previousSubDivision,status,createdBy,signedBy)
SELECT 'DEMO-CA-2026-001','DEMO-1719177','KABANGA','PROFESSEUR','Amina','F','Licence','Pédagogie',s.id,'PREFET','Mutation','DEMO-ACTE-001','2026-09-01','Mutation','DEMO — Institut Horizon','DEMO-SEC-001','PROFESSEUR','Sud-Kivu','EDUNC-Uvira 1','signed',u.id,(SELECT id FROM users WHERE openId='demo-sous-proved') FROM schools s JOIN users u ON u.openId='demo-ops' WHERE s.code='DEMO-TEC-001'
ON DUPLICATE KEY UPDATE status='signed',signedBy=VALUES(signedBy);
INSERT INTO assignmentCommissions (reference,agentDinacope,agentName,postName,firstName,gender,diploma,\`option\`,destinationSchoolId,destinationFunction,actNature,actReference,effectiveDate,reason,previousSchoolName,previousSchoolCode,previousFunction,previousProvince,previousSubDivision,status,createdBy)
SELECT 'DEMO-CA-2026-002','DEMO-1890401','MUKUNZI','ENSEIGNANTE','Clarisse','F','Graduat','Lettres',s.id,'ENSEIGNANTE','Promotion','DEMO-ACTE-002','2026-09-01','Promotion','DEMO — École Primaire Lumière','DEMO-PRI-001','ENSEIGNANTE','Sud-Kivu','EDUNC-Uvira 1','validated',u.id FROM schools s JOIN users u ON u.openId='demo-ops' WHERE s.code='DEMO-SEC-001'
ON DUPLICATE KEY UPDATE status='validated';

INSERT INTO notifications (userId,type,title,body,entityType,entityId,isRead)
VALUES
((SELECT id FROM users WHERE openId='demo-sous-proved'),'DOSSIER_URGENT','DEMO — Dossier urgent','Le dossier DEMO-COUR-2026-0001 attend une signature.','dossier',(SELECT id FROM dossiers WHERE reference='DEMO-COUR-2026-0001'),false),
((SELECT id FROM users WHERE openId='demo-school-horizon'),'CIRCULAR_RECEIVED','DEMO — Nouvelle circulaire','Une circulaire de démonstration est disponible.','schoolBulletin',(SELECT id FROM schoolBulletins WHERE reference='DEMO-CIRC-2026-001'),false),
((SELECT id FROM users WHERE openId='demo-school-espoir'),'REPORT_REJECTED','DEMO — Rapport à compléter','Le justificatif de démonstration requiert un complément.','report',(SELECT id FROM reports WHERE reportType='justificatif' AND period='Février 2026' LIMIT 1),false);

INSERT INTO auditLogs (actorId,action,entityType,entityId,afterData)
VALUES
(1,'DEMO_DATASEEDED','demoSeed',NULL,'{"label":"DEMO","modules":"users,schools,staff,statistics,dossiers,documents,reports,bulletins,commissions,notifications"}'),
((SELECT id FROM users WHERE openId='demo-sous-proved'),'DEMO_REPORT_REVIEWED','report',(SELECT id FROM reports WHERE reportType='palmares' AND period='1er trimestre 2025-2026' LIMIT 1),'{"status":"accepted","label":"DEMO"}');
`;

fs.writeFileSync('/home/ubuntu/siel-uvira-1/tmp/seed-demo.sql', sql.trim() + '\n');
console.log(JSON.stringify({ output: '/home/ubuntu/siel-uvira-1/tmp/seed-demo.sql', assets }, null, 2));
