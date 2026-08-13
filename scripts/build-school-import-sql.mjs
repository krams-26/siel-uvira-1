import fs from 'node:fs';

const source = JSON.parse(fs.readFileSync('/home/ubuntu/siel-uvira-1/tmp/import-schools.json', 'utf8'));
const schools = source.selected;
const escape = value => String(value ?? '').replaceAll("'", "''");
const values = schools.map(school => `('${escape(school.code)}','${escape(school.officialName)}','${escape(school.schoolType)}','${escape(school.level)}','active','${escape(school.legalStatus ?? '')}',${school.studentCount},${school.femaleStudentCount},${Math.max(0, school.studentCount - school.femaleStudentCount)},${school.teacherCount},1,'Import Excel ${escape(school.sourceSheet)} · ligne ${school.sourceRow}')`).join(',\n');
const codes = schools.map(school => `'${escape(school.code)}'`).join(',');
const statistics = schools.map(school => `SELECT id,'2025-2026',${school.studentCount},${school.femaleStudentCount},${Math.max(0, school.studentCount - school.femaleStudentCount)},${school.teacherCount},0,'imported',1 FROM schools WHERE code='${escape(school.code)}'`).join('\nUNION ALL\n');

const sql = `
INSERT INTO schools (code,officialName,schoolType,level,status,legalStatus,studentCount,femaleStudentCount,maleStudentCount,teacherCount,createdBy,notes)
VALUES
${values}
ON DUPLICATE KEY UPDATE officialName=VALUES(officialName), schoolType=VALUES(schoolType), level=VALUES(level), status='active', legalStatus=VALUES(legalStatus), studentCount=VALUES(studentCount), femaleStudentCount=VALUES(femaleStudentCount), maleStudentCount=VALUES(maleStudentCount), teacherCount=VALUES(teacherCount), notes=VALUES(notes);

INSERT INTO users (openId,name,role,schoolId,isActive)
SELECT CONCAT('school-secope-',code), CONCAT('PORTAIL À ACTIVER — ',officialName), 'ecole', id, false
FROM schools WHERE code IN (${codes})
ON DUPLICATE KEY UPDATE name=VALUES(name), role='ecole', schoolId=VALUES(schoolId), isActive=false;

INSERT INTO schoolStatistics (schoolId,schoolYear,studentCount,femaleStudentCount,maleStudentCount,teacherCount,classroomCount,status,submittedBy)
${statistics}
ON DUPLICATE KEY UPDATE studentCount=VALUES(studentCount), femaleStudentCount=VALUES(femaleStudentCount), maleStudentCount=VALUES(maleStudentCount), teacherCount=VALUES(teacherCount), classroomCount=VALUES(classroomCount), status='imported', submittedBy=1;

INSERT INTO auditLogs (actorId,action,entityType,entityId,afterData)
VALUES (1,'SCHOOL_IMPORT_BATCH','schoolImport',NULL,'${escape(JSON.stringify({ source: 'TABLEAU SYNOPTIQUE DES STATISTIQUES SCOLAIRES 2025-2026', importedSchools: schools.length, codes: schools.map(school => school.code) }))}');
`;
fs.writeFileSync('/home/ubuntu/siel-uvira-1/tmp/import-30-schools.sql', sql.trim() + '\n');
console.log(JSON.stringify({ schoolCount: schools.length, codes: schools.map(school => school.code), output: '/home/ubuntu/siel-uvira-1/tmp/import-30-schools.sql' }, null, 2));
