import XLSX from 'xlsx';
import fs from 'node:fs';

const source = '/home/ubuntu/upload/TABLEAUSYNOPTIQUEDESSTATISTIQUESSCOLAIRESDESECOLESSECONDAIRE2025-2026_022517.xlsx';
const workbook = XLSX.readFile(source, { cellDates: true });

const clean = value => String(value ?? '').trim().replace(/\s+/g, ' ');
const numberOrZero = value => {
  const parsed = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};
const usableCode = value => {
  const code = clean(value);
  return /^\d{6,8}$/.test(code) ? code : null;
};

function extractSecondary() {
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets['SECONDAIRE 2025-2026'], { header: 1, defval: '' });
  return rows.filter(row => Number.isInteger(Number(row[0])) && clean(row[1]) && usableCode(row[3])).map(row => ({
    sourceSheet: 'SECONDAIRE 2025-2026',
    sourceRow: row[0],
    officialName: clean(row[1]),
    legalStatus: clean(row[2]) || null,
    code: usableCode(row[3]),
    level: 'secondaire',
    schoolType: 'secondaire',
    studentCount: numberOrZero(row[23]),
    femaleStudentCount: numberOrZero(row[24]),
    teacherCount: numberOrZero(row[26]) + numberOrZero(row[27]),
  }));
}

function extractPrimary() {
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets['PRIMAIRE 2025-2026'], { header: 1, defval: '' });
  return rows.filter(row => Number.isInteger(Number(row[0])) && clean(row[1]) && usableCode(row[3])).map(row => ({
    sourceSheet: 'PRIMAIRE 2025-2026',
    sourceRow: row[0],
    officialName: clean(row[1]),
    legalStatus: clean(row[2]) || null,
    code: usableCode(row[3]),
    level: 'primaire',
    schoolType: 'primaire',
    studentCount: numberOrZero(row[22]),
    femaleStudentCount: numberOrZero(row[23]),
    teacherCount: numberOrZero(row[25]) + numberOrZero(row[26]),
  }));
}

function extractPreschool() {
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets['MATERNELLE 2025-2026'], { header: 1, defval: '' });
  return rows.filter(row => Number.isInteger(Number(row[0])) && clean(row[1]) && usableCode(row[3])).map(row => ({
    sourceSheet: 'MATERNELLE 2025-2026',
    sourceRow: row[0],
    officialName: clean(row[1]),
    legalStatus: clean(row[2]) || null,
    code: usableCode(row[3]),
    level: 'maternelle',
    schoolType: 'maternelle',
    studentCount: numberOrZero(row[13]),
    femaleStudentCount: numberOrZero(row[14]),
    teacherCount: numberOrZero(row[16]),
  }));
}

const all = [...extractSecondary(), ...extractPrimary(), ...extractPreschool()];
const unique = [];
const seenCodes = new Set();
for (const school of all) {
  if (!seenCodes.has(school.code)) {
    seenCodes.add(school.code);
    unique.push(school);
  }
}
const selected = unique.slice(0, 30);
const result = {
  sheets: workbook.SheetNames,
  totals: { extracted: all.length, unique: unique.length, selected: selected.length },
  selected,
};
fs.mkdirSync('/home/ubuntu/siel-uvira-1/tmp', { recursive: true });
fs.writeFileSync('/home/ubuntu/siel-uvira-1/tmp/import-schools.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
