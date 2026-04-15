import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Apple, Syringe, LineChart, MonitorSmartphone, Lightbulb, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useChildContext } from "@/hooks/use-child";
import { useGetChildren } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/nutrition", label: "Nutrition", icon: Apple },
  { path: "/vaccination", label: "Vaccination", icon: Syringe },
  { path: "/growth", label: "Growth", icon: LineChart },
  { path: "/screentime", label: "Screen Time", icon: MonitorSmartphone },
  { path: "/tips", label: "Tips", icon: Lightbulb },
];

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const { selectedChildId, setSelectedChildId } = useChildContext();
  const { data: childrenData } = useGetChildren();

  // If no children, and not on add-child page, might prompt to add child.
  // For now, just handle selection in sidebar/header.

  return (
    <div className="flex h-screen bg-background text-foreground dark">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            ስ
          </div>
          <span className="text-xl font-bold text-primary">ስለ ልጅሽ</span>
        </div>

        <div className="px-6 pb-4">
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
            Selected Child
          </label>
          <select 
            className="w-full bg-input text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={selectedChildId || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "add") {
                // Navigate to add child
                window.location.href = "/add-child";
              } else {
                setSelectedChildId(parseInt(val, 10));
              }
            }}
          >
            <option value="" disabled>Select a child</option>
            {childrenData?.map(child => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
            <option value="add">+ Add Child</option>
          </select>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-foreground">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{user?.name}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0 relative dark">
        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-card border-b border-border flex items-center justify-between px-4 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              ስ
            </div>
            <span className="font-bold text-primary">ስለ ልጅሽ</span>
          </div>
          
          <select 
            className="bg-input text-foreground border border-border rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary max-w-[120px]"
            value={selectedChildId || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "add") {
                window.location.href = "/add-child";
              } else {
                setSelectedChildId(parseInt(val, 10));
              }
            }}
          >
            <option value="" disabled>Child</option>
            {childrenData?.map(child => (
              <option key={child.id} value={child.id}>{child.name}</option>
            ))}
            <option value="add">+ Add</option>
          </select>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2 z-20">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
