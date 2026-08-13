import { writeFileSync } from 'node:fs';
import { storagePut } from '../server/storage.ts';

const files = [
  ['rapport-demo-palmares.pdf', 'Palmarès scolaire de démonstration — données fictives et non officielles.', 'application/pdf'],
  ['pv-reunion-demo.pdf', 'Procès-verbal de réunion de démonstration — document fictif.', 'application/pdf'],
  ['justificatif-demo.pdf', 'Document justificatif de démonstration — document fictif.', 'application/pdf'],
  ['circulaire-demo.pdf', 'Circulaire de démonstration destinée aux établissements.', 'application/pdf'],
];

const uploaded = [];
for (const [name, content, mimeType] of files) {
  uploaded.push({ name, ...(await storagePut(`demo/${name}`, content, mimeType)) });
}
writeFileSync('/home/ubuntu/siel-uvira-1/tmp/demo-assets.json', JSON.stringify(uploaded, null, 2));
console.log(JSON.stringify(uploaded, null, 2));
