import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileCheck2 } from "lucide-react";

export default function ReportsPage() {
  const { data, isLoading } = trpc.reports.list.useQuery();
  return <DashboardLayout><div className="mx-auto max-w-7xl space-y-6"><div><p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Suivi documentaire</p><h1 className="mt-2 text-3xl font-semibold">Rapports des écoles</h1><p className="mt-2 text-muted-foreground">Contrôlez les rapports reçus et identifiez les documents à compléter.</p></div><Card className="border-0 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><FileCheck2 className="h-5 w-5 text-primary" />Rapports reçus</CardTitle></CardHeader><CardContent className="space-y-3">{isLoading ? <p className="text-sm text-muted-foreground">Chargement…</p> : data?.map(report => <div key={report.id} className="flex flex-col justify-between gap-3 rounded-xl border p-4 md:flex-row md:items-center"><div><p className="font-medium">{report.reportType} · {report.period}</p><p className="mt-1 text-xs text-muted-foreground">École #{report.schoolId} · déposé le {new Date(report.submittedAt).toLocaleDateString("fr-FR")}</p>{report.observations && <p className="mt-2 text-sm text-muted-foreground">{report.observations}</p>}</div><Badge variant={report.status === "rejected" ? "destructive" : report.status === "accepted" ? "default" : "secondary"}>{report.status}</Badge></div>)}{!isLoading && !data?.length && <p className="py-8 text-center text-sm text-muted-foreground">Aucun rapport reçu.</p>}</CardContent></Card></div></DashboardLayout>;
}
