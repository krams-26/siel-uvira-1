import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BarChart3, Download } from "lucide-react";

export default function StatisticsPage() {
  const { data } = trpc.statistics.summary.useQuery();
  const csv = trpc.statistics.exportCsv.useQuery();
  const download = () => { if (!csv.data) return; const url = URL.createObjectURL(new Blob([csv.data], { type: "text/csv;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = "siel-statistiques.csv"; a.click(); URL.revokeObjectURL(url); };
  return <DashboardLayout><div className="mx-auto max-w-7xl space-y-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Pilotage par les données</p><h1 className="mt-2 text-3xl font-semibold">Statistiques</h1><p className="mt-2 text-muted-foreground">Indicateurs agrégés du référentiel et des flux administratifs.</p></div><Button onClick={download} variant="outline" className="gap-2"><Download className="h-4 w-4" />Exporter CSV</Button></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[["Écoles", data?.schools ?? 0], ["Élèves", data?.students ?? 0], ["Enseignants", data?.teachers ?? 0], ["Dossiers", data?.dossiers ?? 0], ["Rapports", data?.reports ?? 0]].map(([label, value]) => <Card key={label} className="border-0 shadow-sm"><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></CardContent></Card>)}</div><Card className="border-0 shadow-sm"><CardContent className="flex min-h-52 flex-col items-center justify-center text-center"><BarChart3 className="h-10 w-10 text-primary/70" /><p className="mt-3 font-medium">Les graphiques détaillés seront ajoutés avec les filtres de période et de zone.</p><p className="mt-1 text-sm text-muted-foreground">L’export CSV est déjà disponible pour les contrôles et consolidations.</p></CardContent></Card></div></DashboardLayout>;
}
