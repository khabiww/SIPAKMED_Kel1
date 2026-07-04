import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, HeartPulse, Lightbulb } from "lucide-react";
import { PublicLayout, MedicalDisclaimer } from "@/components/public-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Penyakit, Gejala } from "@/lib/expert-system";

export const Route = createFileRoute("/hasil")({
  head: () => ({
    meta: [
      { title: "Hasil Diagnosis — SIPAKMED" },
      { name: "description", content: "Hasil skrining awal berdasarkan gejala yang Anda pilih." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Hasil,
});

type StoredResult =
  | { status: "single"; penyakit: Penyakit; confirmedGejala: Gejala[] }
  | { status: "multiple"; candidates: Penyakit[]; confirmedGejala: Gejala[] }
  | { status: "none"; confirmedGejala: Gejala[] };

function Hasil() {
  const [result, setResult] = useState<StoredResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("sipakmed:last-result");
    if (raw) {
      try { setResult(JSON.parse(raw)); } catch { /* ignore */ }
    }
    setLoaded(true);
  }, []);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
        <Link to="/diagnosis" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Diagnosis
        </Link>

        <h1 className="mt-4 text-3xl sm:text-4xl font-bold">Hasil Diagnosis</h1>
        <p className="mt-2 text-muted-foreground">Hasil analisis Forward Chaining berdasarkan gejala yang Anda pilih.</p>

        <div className="mt-6">
          <MedicalDisclaimer />
        </div>

        {!loaded ? null : !result ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">Belum ada hasil diagnosis. Silakan mulai dari halaman Diagnosis.</p>
            <Link to="/diagnosis" className="inline-block mt-4">
              <Button>Mulai Diagnosis</Button>
            </Link>
          </div>
        ) : result.status === "single" ? (
          <SinglePenyakit p={result.penyakit} gejala={result.confirmedGejala} />
        ) : (
          <Fallback status={result.status} candidates={result.status === "multiple" ? result.candidates : []} gejala={result.confirmedGejala} />
        )}
      </section>
    </PublicLayout>
  );
}

function SinglePenyakit({ p, gejala }: { p: Penyakit; gejala: Gejala[] }) {
  return (
    <div className="mt-6 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary-glow/5 p-6 sm:p-8 shadow-lg shadow-primary/10">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-md">
          <HeartPulse className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Kemungkinan Penyakit</div>
          <h2 className="mt-1 text-2xl sm:text-3xl font-display font-bold">{p.nama_penyakit}</h2>
          <Badge variant="secondary" className="mt-2">{p.kategori}</Badge>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Deskripsi</h3>
        <p className="mt-2 text-sm leading-relaxed">{p.deskripsi}</p>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-primary" /> Gejala Terkonfirmasi
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {gejala.map((g) => (
            <Badge key={g.id} className="bg-primary/15 text-primary border-0 hover:bg-primary/20">
              {g.nama_gejala}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-white/70 backdrop-blur border border-primary/20 p-5">
        <h3 className="flex items-center gap-2 font-display font-bold text-primary">
          <Lightbulb className="h-5 w-5" /> Saran Penanganan Awal
        </h3>
        <p className="mt-2 text-sm leading-relaxed">{p.saran_penanganan}</p>
      </div>
    </div>
  );
}

function Fallback({ status, candidates, gejala }: { status: "multiple" | "none"; candidates: Penyakit[]; gejala: Gejala[] }) {
  return (
    <div className="mt-6 rounded-2xl border-2 border-warning/40 bg-warning/5 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-warning/20 text-warning-foreground">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-warning-foreground/80">Perhatian</div>
          <h2 className="mt-1 text-2xl font-display font-bold">Diagnosis Tidak Dapat Ditentukan</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {status === "multiple"
              ? "Beberapa aturan cocok dengan kombinasi gejala Anda. Sistem tidak dapat memberikan satu kesimpulan pasti."
              : "Kombinasi gejala yang Anda pilih tidak memenuhi seluruh syarat pada aturan mana pun di basis pengetahuan kami."}
            {" "}Sangat disarankan untuk berkonsultasi langsung dengan tenaga medis profesional untuk pemeriksaan lebih lanjut.
          </p>
        </div>
      </div>

      {gejala.length > 0 && (
        <div className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gejala yang Anda pilih</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {gejala.map((g) => (
              <Badge key={g.id} variant="secondary">{g.nama_gejala}</Badge>
            ))}
          </div>
        </div>
      )}

      {candidates.length > 0 && (
        <div className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kemungkinan yang cocok</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {candidates.map((p) => (
              <Badge key={p.id} variant="outline">{p.nama_penyakit}</Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <Link to="/diagnosis"><Button variant="outline">Coba Lagi</Button></Link>
      </div>
    </div>
  );
}
