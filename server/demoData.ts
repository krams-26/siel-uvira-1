export const demoSchools = [
  { code: "DEMO-UVR-001", officialName: "École publique de démonstration Nord", schoolType: "publique", level: "primaire", directorName: "Responsable de démonstration", territory: "Uvira", commune: "Kavimvira", status: "active" },
  { code: "DEMO-UVR-002", officialName: "Institut de démonstration Sud", schoolType: "publique", level: "secondaire", directorName: "Direction de démonstration", territory: "Uvira", commune: "Kalundu", status: "active" },
] as const;

export const demoDossier = { reference: "DEMO/S-DIV/0001/2026", subject: "Dossier administratif de démonstration", sender: "Établissement de démonstration", source: "demo", priority: "normal" as const, status: "received" as const };

export const demoNotification = { type: "DEMO_WORKFLOW", title: "Notification de démonstration", body: "Exemple non sensible utilisé uniquement pour valider l’interface." } as const;
