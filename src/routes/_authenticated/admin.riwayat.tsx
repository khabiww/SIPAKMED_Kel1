import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/riwayat")({
  component: RiwayatDiagnosis,
});

type Row = {
  id: string;
  tanggal: string;
  hasil_nama: string;
  status: string;
  gejala_dipilih: { kode: string; nama: string }[];
};

async function fetchRiwayat(): Promise<Row[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("riwayat_diagnosis")
    .select("id, tanggal, hasil_nama, status, gejala_dipilih")
    .order("tanggal", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data;
}

function statusBadge(status: string) {
  if (status === "single") return <Badge className="bg-primary/15 text-primary border-0">Terdiagnosis</Badge>;
  if (status === "multiple") return <Badge className="bg-warning/20 text-warning-foreground border-0">Ambigu</Badge>;
  return <Badge variant="secondary">Tidak ditentukan</Badge>;
}

function RiwayatDiagnosis() {
  const { data, isLoading } = useQuery({ queryKey: ["riwayat"], queryFn: fetchRiwayat });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">Riwayat Diagnosis</h1>
        <p className="text-sm text-muted-foreground">Log konsultasi pengguna publik (200 terbaru).</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Hasil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Gejala</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin inline" /></TableCell></TableRow>
            ) : data?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Belum ada riwayat.</TableCell></TableRow>
            ) : (
              data?.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(r.tanggal).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="font-medium">{r.hasil_nama}</TableCell>
                  <TableCell>{statusBadge(r.status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-md">
                      {(r.gejala_dipilih ?? []).map((g, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{g.nama}</Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
