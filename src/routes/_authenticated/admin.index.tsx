import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookMarked, Database, ListChecks, Loader2, Workflow } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

async function fetchStats() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const [p, g, r, h] = await Promise.all([
    db.from("penyakit").select("*", { count: "exact", head: true }),
    db.from("gejala").select("*", { count: "exact", head: true }),
    db.from("rule").select("*", { count: "exact", head: true }),
    db.from("riwayat_diagnosis").select("*", { count: "exact", head: true }),
  ]);
  return {
    penyakit: p.count ?? 0,
    gejala: g.count ?? 0,
    rule: r.count ?? 0,
    riwayat: h.count ?? 0,
  };
}

function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchStats });

  const cards = [
    { label: "Total Penyakit", value: data?.penyakit, icon: Database, color: "text-primary bg-primary/10" },
    { label: "Total Gejala", value: data?.gejala, icon: ListChecks, color: "text-accent-foreground bg-accent" },
    { label: "Total Aturan", value: data?.rule, icon: Workflow, color: "text-primary bg-primary/10" },
    { label: "Total Riwayat", value: data?.riwayat, icon: BookMarked, color: "text-warning-foreground bg-warning/20" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Dashboard Admin</h1>
        <p className="text-sm text-muted-foreground">Ringkasan basis pengetahuan SIPAKMED.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div className="mt-4 text-3xl font-display font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : c.value ?? 0}
            </div>
            <div className="text-sm text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display font-bold text-lg">Selamat datang</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Gunakan menu di samping untuk mengelola data penyakit, gejala, dan aturan (rule base) yang digunakan
          oleh mesin inferensi Forward Chaining. Perubahan berlaku langsung untuk pengguna diagnosis.
        </p>
      </div>
    </div>
  );
}
