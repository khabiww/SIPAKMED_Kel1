import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2, Search, Stethoscope, Sparkles } from "lucide-react";
import { PublicLayout, MedicalDisclaimer } from "@/components/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { fetchKnowledgeBase, runForwardChaining, saveDiagnosis } from "@/lib/expert-system";
import { toast } from "sonner";

export const Route = createFileRoute("/diagnosis")({
  head: () => ({
    meta: [
      { title: "Diagnosis — SIPAKMED" },
      { name: "description", content: "Pilih gejala yang Anda alami dan dapatkan skrining awal secara otomatis." },
      { property: "og:title", content: "Diagnosis SIPAKMED" },
      { property: "og:description", content: "Konsultasi gejala online dengan Forward Chaining." },
    ],
  }),
  component: Diagnosis,
});

function Diagnosis() {
  const navigate = useNavigate();
  const { data: kb, isLoading } = useQuery({ queryKey: ["kb"], queryFn: fetchKnowledgeBase });

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const grouped = useMemo(() => {
    if (!kb) return [] as { kategori: string; items: import("@/lib/expert-system").Gejala[] }[];
    const filter = q.trim().toLowerCase();
    const filtered = filter
      ? kb.gejala.filter((g) =>
          g.nama_gejala.toLowerCase().includes(filter) ||
          g.kode_gejala.toLowerCase().includes(filter),
        )
      : kb.gejala;
    const map = new Map<string, import("@/lib/expert-system").Gejala[]>();
    for (const g of filtered) {
      if (!map.has(g.kategori)) map.set(g.kategori, []);
      map.get(g.kategori)!.push(g);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([kategori, items]) => ({ kategori, items }));
  }, [kb, q]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onAnalyze = async () => {
    if (!kb) return;
    if (selected.size === 0) {
      toast.warning("Pilih minimal satu gejala terlebih dahulu.");
      return;
    }
    setAnalyzing(true);
    const result = runForwardChaining(Array.from(selected), kb);
    const gejalaDipilih = result.confirmedGejala.map((g) => ({ kode: g.kode_gejala, nama: g.nama_gejala }));
    if (result.status === "single") {
      await saveDiagnosis({
        hasil_penyakit_id: result.penyakit.id,
        hasil_nama: result.penyakit.nama_penyakit,
        status: "single",
        gejala_dipilih: gejalaDipilih,
      });
      sessionStorage.setItem("sipakmed:last-result", JSON.stringify({
        status: "single",
        penyakit: result.penyakit,
        confirmedGejala: result.confirmedGejala,
      }));
    } else if (result.status === "multiple") {
      await saveDiagnosis({
        hasil_penyakit_id: null,
        hasil_nama: "Beberapa kemungkinan",
        status: "multiple",
        gejala_dipilih: gejalaDipilih,
      });
      sessionStorage.setItem("sipakmed:last-result", JSON.stringify({
        status: "multiple",
        candidates: result.candidates,
        confirmedGejala: result.confirmedGejala,
      }));
    } else {
      await saveDiagnosis({
        hasil_penyakit_id: null,
        hasil_nama: "Tidak dapat ditentukan",
        status: "none",
        gejala_dipilih: gejalaDipilih,
      });
      sessionStorage.setItem("sipakmed:last-result", JSON.stringify({
        status: "none",
        confirmedGejala: result.confirmedGejala,
      }));
    }
    setAnalyzing(false);
    navigate({ to: "/hasil" });
  };

  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center gap-3 text-primary">
          <Stethoscope className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Konsultasi</span>
        </div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold">Pilih Gejala yang Anda Alami</h1>
        <p className="mt-2 text-muted-foreground">
          Tandai semua gejala yang sesuai. Sistem akan mencocokkan dengan basis aturan Forward Chaining.
        </p>

        <div className="mt-6">
          <MedicalDisclaimer />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari gejala (mis. demam, batuk, mual)..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>

            {isLoading ? (
              <div className="flex items-center gap-2 py-10 text-muted-foreground justify-center">
                <Loader2 className="h-5 w-5 animate-spin" /> Memuat daftar gejala...
              </div>
            ) : grouped.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Tidak ada gejala yang cocok dengan pencarian.
              </div>
            ) : (
              <Accordion type="multiple" defaultValue={grouped.map((g) => g.kategori)} className="mt-4">
                {grouped.map((group) => (
                  <AccordionItem key={group.kategori} value={group.kategori}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{group.kategori}</span>
                        <Badge variant="secondary" className="text-xs">{group.items.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {group.items.map((g) => {
                          const checked = selected.has(g.id);
                          return (
                            <label
                              key={g.id}
                              className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                                checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                              }`}
                            >
                              <Checkbox checked={checked} onCheckedChange={() => toggle(g.id)} className="mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium">{g.nama_gejala}</div>
                                <div className="text-[11px] text-muted-foreground">{g.kode_gejala}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 self-start rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold">Ringkasan</span>
            </div>
            <div className="mt-3 text-4xl font-display font-bold">{selected.size}</div>
            <div className="text-sm text-muted-foreground">gejala terpilih</div>

            {selected.size > 0 && kb && (
              <div className="mt-4 flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {kb.gejala
                  .filter((g) => selected.has(g.id))
                  .map((g) => (
                    <Badge key={g.id} variant="secondary" className="text-xs">
                      {g.nama_gejala}
                    </Badge>
                  ))}
              </div>
            )}

            <Button
              onClick={onAnalyze}
              disabled={analyzing || isLoading}
              className="mt-5 w-full gap-2"
              size="lg"
            >
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Stethoscope className="h-4 w-4" />}
              Analisis Diagnosis
            </Button>
            {selected.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(new Set())}
                className="mt-2 w-full"
              >
                Reset pilihan
              </Button>
            )}
          </aside>
        </div>
      </section>
    </PublicLayout>
  );
}
