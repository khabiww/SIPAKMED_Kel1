import { supabase } from "@/integrations/supabase/client";

export type Penyakit = {
  id: string;
  kode_penyakit: string;
  nama_penyakit: string;
  kategori: string;
  deskripsi: string;
  saran_penanganan: string;
};

export type Gejala = {
  id: string;
  kode_gejala: string;
  nama_gejala: string;
  kategori: string;
};

export type Rule = {
  id: string;
  kode_rule: string;
  id_penyakit: string;
  rule_gejala: { id_gejala: string }[];
};

export type KnowledgeBase = {
  penyakit: Penyakit[];
  gejala: Gejala[];
  rules: Rule[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export async function fetchKnowledgeBase(): Promise<KnowledgeBase> {
  const [penyakitRes, gejalaRes, rulesRes] = await Promise.all([
    db.from("penyakit").select("*").order("kode_penyakit"),
    db.from("gejala").select("*").order("kode_gejala"),
    db.from("rule").select("id, kode_rule, id_penyakit, rule_gejala(id_gejala)").order("kode_rule"),
  ]);
  if (penyakitRes.error) throw penyakitRes.error;
  if (gejalaRes.error) throw gejalaRes.error;
  if (rulesRes.error) throw rulesRes.error;
  return {
    penyakit: penyakitRes.data ?? [],
    gejala: gejalaRes.data ?? [],
    rules: rulesRes.data ?? [],
  };
}

export type InferenceResult =
  | { status: "single"; penyakit: Penyakit; matchedRule: Rule; confirmedGejala: Gejala[] }
  | { status: "multiple"; candidates: Penyakit[]; confirmedGejala: Gejala[] }
  | { status: "none"; confirmedGejala: Gejala[] };

export function runForwardChaining(
  selectedGejalaIds: string[],
  kb: KnowledgeBase,
): InferenceResult {
  const selectedSet = new Set(selectedGejalaIds);
  const confirmedGejala = kb.gejala.filter((g) => selectedSet.has(g.id));

  const firedRules = kb.rules.filter((rule) => {
    if (rule.rule_gejala.length === 0) return false;
    return rule.rule_gejala.every((rg) => selectedSet.has(rg.id_gejala));
  });

  const uniqueDiseases = Array.from(
    new Map(
      firedRules
        .map((r) => kb.penyakit.find((p) => p.id === r.id_penyakit))
        .filter((p): p is Penyakit => Boolean(p))
        .map((p) => [p.id, p]),
    ).values(),
  );

  if (uniqueDiseases.length === 1) {
    return {
      status: "single",
      penyakit: uniqueDiseases[0],
      matchedRule: firedRules[0],
      confirmedGejala,
    };
  }
  if (uniqueDiseases.length > 1) {
    return { status: "multiple", candidates: uniqueDiseases, confirmedGejala };
  }
  return { status: "none", confirmedGejala };
}

export async function saveDiagnosis(params: {
  hasil_penyakit_id: string | null;
  hasil_nama: string;
  status: string;
  gejala_dipilih: { kode: string; nama: string }[];
}) {
  const { error } = await db.from("riwayat_diagnosis").insert({
    hasil_penyakit_id: params.hasil_penyakit_id,
    hasil_nama: params.hasil_nama,
    status: params.status,
    gejala_dipilih: params.gejala_dipilih,
  });
  if (error) console.error("save riwayat error", error);
}
