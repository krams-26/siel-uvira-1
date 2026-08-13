import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Archive, Download, Search } from "lucide-react";
import { useState } from "react";

export default function GedPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = trpc.documents.list.useQuery({ search: search || undefined });
  return <DashboardLayout><div className="mx-auto max-w-7xl space-y-6"><div><p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Conservation numérique</p><h1 className="mt-2 text-3xl font-semibold">GED & archives</h1><p className="mt-2 text-muted-foreground">Retrouvez les fichiers administratifs grâce à leurs métadonnées et à leur référence S3 persistante.</p></div><Card className="border-0 shadow-sm"><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><Archive className="h-5 w-5 text-primary" />Documents archivés</CardTitle><div className="flex w-72 items-center gap-2 rounded-lg border bg-muted/30 px-3"><Search className="h-4 w-4 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} className="border-0 bg-transparent shadow-none focus-visible:ring-0" placeholder="Titre, type ou référence" /></div></CardHeader><CardContent className="space-y-3">{isLoading ? <p className="text-sm text-muted-foreground">Chargement…</p> : data?.map(doc => <div key={doc.id} className="flex flex-col justify-between gap-3 rounded-xl border p-4 md:flex-row md:items-center"><div><p className="font-medium">{doc.title}</p><p className="mt-1 text-xs text-muted-foreground">{doc.documentType} · version {doc.version} · {doc.mimeType}</p><div className="mt-2 flex gap-2"><Badge variant="outline">{doc.category ?? "Sans catégorie"}</Badge>{doc.reference && <Badge variant="secondary">{doc.reference}</Badge>}</div></div><a href={doc.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><Download className="h-4 w-4" />Ouvrir</a></div>)}{!isLoading && !data?.length && <p className="py-8 text-center text-sm text-muted-foreground">Aucun document archivé.</p>}</CardContent></Card></div></DashboardLayout>;
}
