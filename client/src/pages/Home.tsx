import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ArrowUpRight, Clock3, FileText, School, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";

const statusLabels: Record<string, string> = { received: "Reçu", oriented: "Orienté", in_progress: "En cours", ready_signature: "Prêt pour signature", archived: "Archivé" };
const statusTone: Record<string, "default" | "secondary" | "destructive" | "outline"> = { received: "secondary", oriented: "outline", in_progress: "default", ready_signature: "destructive", archived: "outline" };

function Metric({ title, value, note, icon: Icon, accent }: { title: string; value: number; note: string; icon: typeof FileText; accent: string }) {
  return <Card className="border-0 shadow-sm bg-card/90"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground">{title}</p><p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div><div className={`rounded-xl p-3 ${accent}`}><Icon className="h-5 w-5" /></div></div></CardContent></Card>;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const dashboard = trpc.dashboard.useQuery();
  const dossiers = trpc.dossiers.list.useQuery();
  const schools = trpc.schools.list.useQuery({ search: search || undefined });
  const notifications = trpc.notifications.unread.useQuery();

  return <DashboardLayout>
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Sous-Division EDU-NC · Uvira 1</p><h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Centre de pilotage administratif</h1><p className="mt-2 max-w-2xl text-muted-foreground">Une vue fiable des dossiers, des écoles et des décisions à traiter, avec un historique complet de chaque action.</p></div><Button className="gap-2 self-start"><FileText className="h-4 w-4" />Nouveau courrier</Button></header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric title="Écoles référencées" value={dashboard.data?.schools ?? 0} note="Référentiel centralisé" icon={School} accent="bg-emerald-100 text-emerald-700" /><Metric title="Dossiers suivis" value={dashboard.data?.dossiers ?? 0} note="Tous les circuits actifs" icon={FileText} accent="bg-blue-100 text-blue-700" /><Metric title="Priorités urgentes" value={dashboard.data?.urgent ?? 0} note="À traiter en priorité" icon={AlertTriangle} accent="bg-amber-100 text-amber-700" /><Metric title="À signer" value={dashboard.data?.pendingSignature ?? 0} note="En attente Sous-PROVED" icon={ShieldCheck} accent="bg-violet-100 text-violet-700" /></section>
      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="border-0 shadow-sm"><CardHeader className="flex flex-row items-center justify-between space-y-0"><div><CardTitle>Dossiers récents</CardTitle><p className="mt-1 text-sm text-muted-foreground">Suivi des entrées et décisions en cours</p></div><Button variant="outline" size="sm" className="gap-2">Voir tout <ArrowUpRight className="h-4 w-4" /></Button></CardHeader><CardContent><div className="mb-4 flex items-center gap-2 rounded-lg border bg-muted/30 px-3"><Search className="h-4 w-4 text-muted-foreground" /><Input className="border-0 bg-transparent shadow-none focus-visible:ring-0" placeholder="Rechercher par référence ou objet" /></div><div className="space-y-3">{dossiers.isLoading ? <p className="py-8 text-center text-sm text-muted-foreground">Chargement des dossiers…</p> : dossiers.data?.slice(0, 6).map(({ dossier, office, school }) => <div key={dossier.id} className="flex flex-col gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/30 md:flex-row md:items-center md:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><span className="font-mono text-xs text-primary">{dossier.reference}</span><Badge variant={statusTone[dossier.status] ?? "outline"}>{statusLabels[dossier.status] ?? dossier.status}</Badge></div><p className="mt-1 truncate font-medium">{dossier.subject}</p><p className="mt-1 text-xs text-muted-foreground">{dossier.sender}{school ? ` · ${school.officialName}` : ""}{office ? ` · ${office.code}` : ""}</p></div><div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="h-4 w-4" />{new Date(dossier.receivedAt).toLocaleDateString("fr-FR")}</div></div>)}{!dossiers.isLoading && !dossiers.data?.length && <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Aucun dossier enregistré pour le moment.</div>}</div></CardContent></Card>
        <div className="space-y-6"><Card className="border-0 bg-slate-950 text-white shadow-sm"><CardHeader><CardTitle className="text-base">Alertes à traiter</CardTitle></CardHeader><CardContent className="space-y-4">{notifications.data?.slice(0, 4).map(n => <div key={n.id} className="border-b border-white/10 pb-3 last:border-0 last:pb-0"><p className="text-sm font-medium">{n.title}</p><p className="mt-1 text-xs text-slate-300">{n.body}</p></div>)}{!notifications.data?.length && <p className="text-sm text-slate-300">Aucune notification non lue.</p>}</CardContent></Card><Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-base">Recherche écoles</CardTitle></CardHeader><CardContent className="space-y-3"><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, code ou responsable" />{schools.data?.slice(0, 4).map(school => <div key={school.id} className="flex items-center justify-between border-b py-2 last:border-0"><div><p className="text-sm font-medium">{school.officialName}</p><p className="text-xs text-muted-foreground">{school.code} · {school.level}</p></div><Badge variant="outline">{school.status}</Badge></div>)}</CardContent></Card></div>
      </section>
    </div>
  </DashboardLayout>;
}
