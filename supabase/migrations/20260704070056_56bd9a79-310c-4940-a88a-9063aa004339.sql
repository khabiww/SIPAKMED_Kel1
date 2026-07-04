
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Penyakit
CREATE TABLE public.penyakit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_penyakit VARCHAR(10) NOT NULL UNIQUE,
  nama_penyakit VARCHAR(200) NOT NULL,
  kategori VARCHAR(100) NOT NULL DEFAULT 'Umum',
  deskripsi TEXT NOT NULL DEFAULT '',
  saran_penanganan TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.penyakit TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.penyakit TO authenticated;
GRANT ALL ON public.penyakit TO service_role;
ALTER TABLE public.penyakit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read penyakit" ON public.penyakit FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write penyakit" ON public.penyakit FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Gejala
CREATE TABLE public.gejala (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_gejala VARCHAR(10) NOT NULL UNIQUE,
  nama_gejala VARCHAR(200) NOT NULL,
  kategori VARCHAR(100) NOT NULL DEFAULT 'Umum',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gejala TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gejala TO authenticated;
GRANT ALL ON public.gejala TO service_role;
ALTER TABLE public.gejala ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gejala" ON public.gejala FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write gejala" ON public.gejala FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Rule
CREATE TABLE public.rule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_rule VARCHAR(10) NOT NULL UNIQUE,
  id_penyakit UUID NOT NULL REFERENCES public.penyakit(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rule TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.rule TO authenticated;
GRANT ALL ON public.rule TO service_role;
ALTER TABLE public.rule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read rule" ON public.rule FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write rule" ON public.rule FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Rule-gejala bridge
CREATE TABLE public.rule_gejala (
  id_rule UUID NOT NULL REFERENCES public.rule(id) ON DELETE CASCADE,
  id_gejala UUID NOT NULL REFERENCES public.gejala(id) ON DELETE CASCADE,
  PRIMARY KEY (id_rule, id_gejala)
);
GRANT SELECT ON public.rule_gejala TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.rule_gejala TO authenticated;
GRANT ALL ON public.rule_gejala TO service_role;
ALTER TABLE public.rule_gejala ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read rule_gejala" ON public.rule_gejala FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write rule_gejala" ON public.rule_gejala FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Riwayat
CREATE TABLE public.riwayat_diagnosis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal TIMESTAMPTZ NOT NULL DEFAULT now(),
  hasil_penyakit_id UUID REFERENCES public.penyakit(id) ON DELETE SET NULL,
  hasil_nama VARCHAR(200) NOT NULL,
  status VARCHAR(30) NOT NULL,
  gejala_dipilih JSONB NOT NULL DEFAULT '[]'::jsonb
);
GRANT INSERT ON public.riwayat_diagnosis TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.riwayat_diagnosis TO authenticated;
GRANT ALL ON public.riwayat_diagnosis TO service_role;
ALTER TABLE public.riwayat_diagnosis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone insert riwayat" ON public.riwayat_diagnosis FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin read riwayat" ON public.riwayat_diagnosis FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete riwayat" ON public.riwayat_diagnosis FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
