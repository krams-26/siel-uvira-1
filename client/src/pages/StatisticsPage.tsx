import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { BarChart3, Download } from "lucide-react";
import { useMemo, useState } from "react";

export default function StatisticsPage() {
  const [territory, setTerritory] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("");
  const filters = useMemo(() => ({ territory: territory || undefined, level: level || undefined, status: status || undefined }), [territory, level, status]);
  const { data } = trpc.statistics.summary.useQuery(filters);
  const csv = trpc.statistics.exportCsv.useQuery(filters);
  const xlsx = trpc.statistics.exportFile.useQuery({ format: "xlsx", ...filters }, { enabled: false });
  const pdf = trpc.statistics.exportFile.useQuery({ format: "pdf", ...filters }, { enabled: false });
  const download = (content: string, filename: string, type: string) => { const url = URL.createObjectURL(new Blob([content], { type })); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); };
  const downloadCsv = () => { if (csv.data) download(csv.data, "siel-statistiques.csv", "text/csv;charset=utf-8"); };
  const downloadBinary = async (format: "xlsx" | "pdf") => { const result = format === "xlsx" ? await xlsx.refetch() : await pdf.refetch(); if (result.data?.base64) download(atob(result.data.base64), format === "xlsx" ? "siel-statistiques.xlsx" : "siel-statistiques.pdf", result.data.mimeType); };
  return <DashboardLayout><div className="mx-auto max-w-7xl space-y-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Pilotage par les données</p><h1 className="mt-2 text-3xl font-semibold">Statistiques</h1><p className="mt-2 text-muted-foreground">Indicateurs filtrables par zone, niveau et statut.</p></div><div className="flex flex-wrap gap-2"><Button onClick={downloadCsv} variant="outline" className="gap-2"><Download className="h-4 w-4" />CSV</Button><Button onClick={() => void downloadBinary("xlsx")} variant="outline">Excel</Button><Button onClick={() => void downloadBinary("pdf")} variant="outline">PDF</Button></div></div><Card className="border-0 shadow-sm"><CardContent className="grid gap-3 p-5 md:grid-cols-3"><Input value={territory} onChange={event => setTerritory(event.target.value)} placeholder="Zone / territoire" /><Input value={level} onChange={event => setLevel(event.target.value)} placeholder="Niveau" /><Input value={status} onChange={event => setStatus(event.target.value)} placeholder="Statut" /></CardContent></Card><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[["Écoles", data?.schools ?? 0], ["Élèves", data?.students ?? 0], ["Enseignants", data?.teachers ?? 0], ["Dossiers", data?.dossiers ?? 0], ["Rapports", data?.reports ?? 0]].map(([label, value]) => <Card key={label} className="border-0 shadow-sm"><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></CardContent></Card>)}</div><Card className="border-0 shadow-sm"><CardContent className="flex min-h-52 flex-col items-center justify-center text-center"><BarChart3 className="h-10 w-10 text-primary/70" /><p className="mt-3 font-medium">Les indicateurs sont recalculés selon les filtres actifs.</p><p className="mt-1 text-sm text-muted-foreground">Les exports CSV, Excel et PDF reprennent la consolidation courante.</p></CardContent></Card></div></DashboardLayout>;
}
