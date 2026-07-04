import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Brain, ClipboardCheck, ShieldCheck, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout, MedicalDisclaimer } from "@/components/public-layout";

export const Route = createFileRoute("/")({
  component: Beranda,
});

function Beranda() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-1 text-xs font-medium text-primary shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Sistem Pakar Berbasis Forward Chaining
            </div>
            <h1 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              Skrining Awal Penyakit,{" "}
              <span className="text-primary">Cepat & Terpercaya</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              SIPAKMED membantu Anda mengenali kemungkinan penyakit berdasarkan gejala yang dialami,
              menggunakan basis pengetahuan medis dan metode inferensi Forward Chaining.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/diagnosis">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
                  Mulai Diagnosis
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/tentang">
                <Button size="lg" variant="outline">
                  Pelajari Metode
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl bg-white shadow-2xl border border-primary/10 p-8">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                <Stethoscope className="h-8 w-8" />
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm font-medium">✓ Demam tinggi</span>
                  <span className="text-xs text-muted-foreground">G01</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm font-medium">✓ Batuk</span>
                  <span className="text-xs text-muted-foreground">G02</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <span className="text-sm font-medium">✓ Sakit tenggorokan</span>
                  <span className="text-xs text-muted-foreground">G04</span>
                </div>
                <div className="mt-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
                  <div className="text-xs font-medium text-muted-foreground">Hasil Diagnosis</div>
                  <div className="text-lg font-display font-bold text-primary">Influenza</div>
                  <div className="text-xs text-muted-foreground">Aturan R01 terpenuhi</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Brain, title: "Forward Chaining", desc: "Menyimpulkan penyakit dari gejala yang dipilih menggunakan aturan IF-THEN." },
            { icon: ClipboardCheck, title: "12 Penyakit Umum", desc: "Cakupan basis pengetahuan meliputi 12 penyakit yang sering dijumpai di masyarakat." },
            { icon: ShieldCheck, title: "Transparan", desc: "Setiap hasil disertai daftar gejala terkonfirmasi dan saran penanganan awal." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display font-bold text-lg">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <MedicalDisclaimer />
        </div>
      </section>
    </PublicLayout>
  );
}
