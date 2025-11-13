import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";




import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "./AppSidebar";

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Sticky header */}
          <header className="h-16 flex items-center justify-between border-b bg-card px-6 sticky top-0 z-40">
            <div className="flex items-center space-x-4">
              <SidebarTrigger />
              {user && (
                <div>
                  <h2 className="text-lg font-semibold font-poppins">Welcome back, {user.name}</h2>
                  <p className="text-sm text-muted-foreground capitalize">
                    {user.role.replace("_", " ")} Dashboard
                  </p>
                </div>
              )}
            </div>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {user.email} ▾
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </header>
          {/* Main area */}
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};
