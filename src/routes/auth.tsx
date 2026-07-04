import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, LogIn, Stethoscope } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/hooks/use-session";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Login Admin — SIPAKMED" },
      { name: "description", content: "Login area administrator SIPAKMED." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rpc = supabase as any;

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    if (!data.user) { setLoading(false); return; }
    // Attempt bootstrap in case this is the first user
    await rpc.rpc("claim_admin_if_first");
    const isAdmin = await checkIsAdmin(data.user.id);
    if (!isAdmin) {
      await supabase.auth.signOut();
      toast.error("Akun Anda bukan admin. Hubungi administrator sistem.");
      setLoading(false);
      return;
    }
    toast.success("Login berhasil");
    navigate({ to: "/admin" });
  };

  return (
    <PublicLayout>
      <section className="mx-auto max-w-md px-4 sm:px-6 py-16">
        <div className="text-center">
          <div className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-md">
            <Stethoscope className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-display font-bold">Area Administrator</h1>
          <p className="mt-1 text-sm text-muted-foreground">Login untuk mengelola basis pengetahuan SIPAKMED.</p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-md">
          <form onSubmit={onLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@sipakmed.id" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Masuk
            </Button>
          </form>
        </div>
      </section>
    </PublicLayout>
  );
}
