import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  ClipboardList, 
  BookOpen,
  GraduationCap,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import TopBar from './TopBar';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mentors', href: '/mentors', icon: Users },
  { name: 'Buddies', href: '/buddies', icon: UserCheck },
  { name: 'Tasks', href: '/tasks', icon: ClipboardList },
  { name: 'Resources', href: '/resources', icon: BookOpen },
  // { name: 'Curriculum', href: '/curriculum', icon: GraduationCap },
];

interface LayoutProps {
  children?: React.ReactNode;
  theme?: string;
  setTheme?: (theme: string) => void;
}

export default function Layout({ children, theme, setTheme }: LayoutProps) {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    // Clear cached data and redirect
    localStorage.removeItem('user_profile');
    localStorage.removeItem('supabase_user_mapping');
    window.location.href = '/';
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location === '/' || location === '/dashboard';
    }
    return location === href || location.startsWith(href + '/');
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full sidebar-premium">
      {/* User Profile Section - Top */}
      <div className="p-6 border-b border-border">
        <div className="text-center">
          <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center ring-1 ring-border mx-auto mb-4">
            <span className="text-xl font-bold text-foreground">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'M2'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            {user?.name || 'Manager 2'}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {user?.email || 'manager2@gmail.com'}
          </p>
        </div>
        {isMobile && (
          <button 
            className="absolute top-4 right-4 p-2 rounded-lg bg-card hover:bg-card-hover transition-colors text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left font-medium",
                    active 
                      ? "bg-card text-foreground border border-border shadow-sm" 
                      : "hover:bg-card/50 text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <Icon className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-foreground" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "font-medium",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {item.name}
                  </span>
                </button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-border space-y-1">
        <Link href="/settings">
          <button className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
            isActive('/settings') 
              ? "bg-card text-foreground border border-border shadow-sm"
              : "hover:bg-card/50 text-muted-foreground hover:text-foreground"
          )}>
            <Settings className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </button>
        </Link>
        <button 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors font-medium"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-dvh page-container">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isMobile && !sidebarOpen && "-translate-x-full"
      )}>
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Top bar for all screens */}
        <TopBar theme={theme || 'dark'} setTheme={setTheme || (() => {})} />
        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}