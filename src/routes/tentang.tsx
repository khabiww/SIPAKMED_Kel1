import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Loader2 } from "lucide-react";
import { PublicLayout, MedicalDisclaimer } from "@/components/public-layout";
import { fetchKnowledgeBase } from "@/lib/expert-system";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Tentang SIPAKMED — Metode Forward Chaining" },
      { name: "description", content: "Penjelasan metode Forward Chaining dan daftar penyakit yang didukung SIPAKMED." },
      { property: "og:title", content: "Tentang SIPAKMED" },
      { property: "og:description", content: "Pelajari cara SIPAKMED bekerja dengan metode Forward Chaining." },
    ],
  }),
  component: Tentang,
});

function Tentang() {
  const { data, isLoading } = useQuery({ queryKey: ["kb"], queryFn: fetchKnowledgeBase });

  return (
    <PublicLayout>
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-center gap-3 text-primary">
          <BookOpen className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Tentang Aplikasi</span>
        </div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold">Sistem Pakar Medis SIPAKMED</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          SIPAKMED adalah sistem pakar untuk skrining awal penyakit berbasis basis pengetahuan medis dan
          metode inferensi <strong>Forward Chaining</strong>.
        </p>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-display font-bold">Metode Forward Chaining</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Forward Chaining adalah teknik penalaran <em>data-driven</em>: sistem berangkat dari fakta yang
            diketahui (dalam hal ini, gejala yang dipilih pengguna) lalu mencocokkannya dengan basis aturan
            (IF-THEN) sampai sebuah kesimpulan (penyakit) diperoleh.
          </p>
          <ol className="mt-4 space-y-2 list-decimal list-inside text-sm text-muted-foreground">
            <li>Pengguna memilih gejala yang dialami pada halaman Diagnosis.</li>
            <li>Sistem menyimpan gejala ke memori kerja.</li>
            <li>Setiap aturan dicek: jika <strong>SEMUA</strong> gejala dalam aturan terpenuhi, aturan dinyatakan <em>fired</em>.</li>
            <li>Kesimpulan (penyakit) ditampilkan bersama saran penanganan awal.</li>
          </ol>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-display font-bold">Penyakit yang Didukung</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Basis pengetahuan saat ini mencakup penyakit-penyakit berikut:
          </p>
          {isLoading ? (
            <div className="mt-4 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Memuat data...
            </div>
          ) : (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {data?.penyakit.map((p) => (
                <div key={p.id} className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
                  <div className="shrink-0 grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary text-xs font-bold">
                    {p.kode_penyakit}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{p.nama_penyakit}</div>
                    <div className="text-xs text-muted-foreground">{p.kategori}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <MedicalDisclaimer />
        </div>
      </section>
    </PublicLayout>
  );
}
