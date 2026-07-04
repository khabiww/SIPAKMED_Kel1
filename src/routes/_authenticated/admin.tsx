import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Activity, BookMarked, Database, LayoutDashboard, ListChecks, LogOut, Stethoscope, Workflow } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/penyakit", label: "Kelola Penyakit", icon: Database },
  { to: "/admin/gejala", label: "Kelola Gejala", icon: ListChecks },
  { to: "/admin/rule", label: "Kelola Aturan", icon: Workflow },
  { to: "/admin/riwayat", label: "Riwayat Diagnosis", icon: BookMarked },
];

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (path: string, exact?: boolean) =>
    exact ? pathname === path : pathname === path || pathname.startsWith(path + "/");

  const onSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Anda telah keluar.");
    navigate({ to: "/auth" });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-bold text-sm">SIPAKMED</div>
                <div className="text-[10px] text-muted-foreground">Admin Panel</div>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Manajemen</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {nav.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={isActive(item.to, item.exact)}>
                        <Link to={item.to}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onSignOut}>
                  <LogOut className="h-4 w-4" />
                  <span>Keluar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/">
                    <Activity className="h-4 w-4" />
                    <span>Lihat Publik</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border bg-background flex items-center px-4 gap-3">
            <SidebarTrigger />
            <div className="text-sm font-medium">Panel Administrator</div>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" onClick={onSignOut} className="gap-2">
                <LogOut className="h-4 w-4" /> Keluar
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
