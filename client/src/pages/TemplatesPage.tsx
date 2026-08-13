import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Printer, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";

export default function TemplatesPage() {
  const [body, setBody] = useState("S-DIVISION EDU-NC UVIRA 1\n\nRéférence : {{reference}}\n\nObjet : {{objet}}\n\nMadame, Monsieur,\n\n{{contenu}}\n\nLe Sous-PROVED\n{{signataire}}");
  const [values, setValues] = useState({ reference: "S-DIV/UVR/0001/2026", objet: "Correspondance administrative", contenu: "Texte généré à relire et valider par l’autorité compétente.", signataire: "Nom du signataire" });
  const generated = trpc.templates.preview.useQuery({ body, variables: values });
  const variables = useMemo(() => Array.from(body.matchAll(/{{([^}]+)}}/g)).map(match => match[1]).filter((value, index, array) => array.indexOf(value) === index), [body]);
  return <DashboardLayout><div className="mx-auto max-w-7xl space-y-6"><div><p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Production documentaire</p><h1 className="mt-2 text-3xl font-semibold">Modèles & prévisualisation</h1><p className="mt-2 text-muted-foreground">Renseignez les variables, contrôlez la mise en page puis imprimez uniquement après validation humaine.</p></div><div className="grid gap-6 xl:grid-cols-2"><Card className="border-0 shadow-sm"><CardHeader><CardTitle>Modèle à compléter</CardTitle></CardHeader><CardContent className="space-y-4"><Textarea value={body} onChange={event => setBody(event.target.value)} className="min-h-72 font-mono text-sm" />{variables.map(variable => <div key={variable}><label className="mb-1 block text-sm font-medium">{variable}</label><Input value={values[variable as keyof typeof values] ?? ""} onChange={event => setValues(current => ({ ...current, [variable]: event.target.value }))} /></div>)}<Button onClick={() => void generated.refetch()} className="gap-2"><Wand2 className="h-4 w-4" />Actualiser l’aperçu</Button></CardContent></Card><Card className="border-0 shadow-sm"><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Aperçu avant impression</CardTitle><Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2"><Printer className="h-4 w-4" />Imprimer</Button></CardHeader><CardContent><article className="min-h-[520px] rounded-sm border bg-white p-10 text-sm leading-7 text-slate-900 shadow-inner"><div className="mb-8 border-b-2 border-slate-900 pb-4 text-center font-semibold tracking-wide">MINISTÈRE DE L’EDUCATION NATIONALE<br />SOUS-DIVISION EDU-NC · UVIRA 1</div><div className="whitespace-pre-wrap">{generated.data?.rendered ?? body}</div></article></CardContent></Card></div></div></DashboardLayout>;
}
