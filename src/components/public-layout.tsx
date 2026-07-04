import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Stethoscope, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Beranda" },
  { to: "/tentang", label: "Tentang" },
  { to: "/diagnosis", label: "Diagnosis" },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-md">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-lg leading-none">SIPAKMED</div>
              <div className="text-[10px] text-muted-foreground truncate">Sistem Pakar Medis</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === l.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/auth">
              <Button variant="outline" size="sm" className="ml-2">Admin</Button>
            </Link>
          </nav>

          <button
            className="md:hidden p-2 rounded-md hover:bg-muted"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border/60 bg-background">
            <nav className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-4 py-2.5 rounded-md text-sm font-medium",
                    pathname === l.to
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <Link to="/auth" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-md text-sm font-medium border mt-1 text-center">
                Login Admin
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/60 bg-muted/30 mt-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-sm text-muted-foreground flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <div className="font-display font-semibold text-foreground">SIPAKMED</div>
            <div>Sistem Pakar Medis berbasis Forward Chaining</div>
          </div>
          <div className="text-xs sm:text-right">
            © {new Date().getFullYear()} · Untuk keperluan edukasi & skrining awal.
          </div>
        </div>
      </footer>
    </div>
  );
}

export function MedicalDisclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn(
      "rounded-lg border border-warning/40 bg-warning/10 text-warning-foreground px-4 py-3 flex gap-3",
      compact ? "text-xs" : "text-sm",
    )}>
      <div className="shrink-0 mt-0.5">⚠️</div>
      <p>
        <strong>Disclaimer:</strong> Hasil diagnosis ini hanya bersifat informasi/skrining awal dan
        <strong> tidak menggantikan diagnosis dokter medis profesional.</strong> Segera konsultasikan ke tenaga medis untuk pemeriksaan lanjutan.
      </p>
    </div>
  );
}
