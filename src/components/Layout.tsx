import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  UserCircle,
  Settings,
  LogOut,
  X,
  GraduationCap,
  MessageSquare,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import TopBar from './TopBar';

// Base navigation items for manager/mentor
const baseNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['manager', 'mentor'] },
];

// Buddy-specific base navigation
const buddyBaseNavigation = [
  { name: 'Dashboard', href: '/buddy/dashboard', icon: LayoutDashboard, roles: ['buddy'] },
];

// Role-specific navigation items
const managerNavigation = [
  { name: 'Managers', href: '/managers', icon: Shield, roles: ['manager'] },
  { name: 'Mentors', href: '/mentors', icon: Users, roles: ['manager', 'mentor'] },
  { name: 'Buddies', href: '/buddies', icon: UserCheck, roles: ['manager', 'mentor'] },
  { name: 'Curriculum', href: '/curriculum-management', icon: GraduationCap, roles: ['manager', 'mentor'] },
  { name: 'Resources', href: '/resources', icon: BookOpen, roles: ['manager', 'mentor'] },
];

const mentorNavigation = [
  { name: 'Review Queue', href: '/mentor/review-queue', icon: MessageSquare, roles: ['mentor'] },
];

const buddyNavigation = [
  { name: 'My Curriculum', href: '/buddy/curriculum', icon: GraduationCap, roles: ['buddy'] },
  { name: 'Mentors', href: '/mentors', icon: Users, roles: ['buddy'] },
  { name: 'Buddies', href: '/buddies', icon: UserCheck, roles: ['buddy'] },
  { name: 'Resources', href: '/resources', icon: BookOpen, roles: ['buddy'] },
];

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
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
    // For manager/mentor dashboard
    if (href === '/dashboard') {
      return location === '/' || location === '/dashboard';
    }

    // For buddy dashboard
    if (href === '/buddy/dashboard') {
      return location === '/buddy/dashboard';
    }

    // Match exact path or any nested paths (e.g., /buddies matches /buddies/:id)
    return location === href || location.startsWith(href + '/');
  };

  // Get navigation items based on user role
  const getNavigationItems = () => {
    const userRole = user?.role || 'buddy';
    let navItems: typeof baseNavigation = [];

    if (userRole === 'manager') {
      navItems = [...baseNavigation, ...managerNavigation];
    } else if (userRole === 'mentor') {
      navItems = [...baseNavigation, ...managerNavigation.filter(item => item.roles.includes('mentor')), ...mentorNavigation];
    } else if (userRole === 'buddy') {
      navItems = [...buddyBaseNavigation, ...buddyNavigation];
    }

    return navItems;
  };

  const Sidebar = () => {
    const navigationItems = getNavigationItems();

    return (
      <div className="flex flex-col h-full sidebar-premium">
        {/* User Profile Section - Top */}
        <div className="p-6 border-b border-border">
          <div className="text-center">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || 'User'}
                className="w-16 h-16 rounded-full ring-1 ring-border mx-auto mb-4 object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center ring-1 ring-border mx-auto mb-4">
                <span className="text-xl font-bold text-foreground">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'M2'}
                </span>
              </div>
            )}
            <h3 className="text-lg font-bold text-foreground mb-1">
              {user?.name || 'Manager 2'}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {user?.email || 'manager2@gmail.com'}
            </p>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Manager'}
            </div>
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
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <div key={item.href}>
                  <Link href={item.href}>
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

                  {/* My Profile link - only for mentors and buddies - show after Dashboard */}
                  {index === 0 && user?.role && ['mentor', 'buddy'].includes(user.role) && user.profileId && (
                    <Link href={user.role === 'mentor' ? `/mentors/${user.profileId}` : `/buddies/${user.profileId}`}>
                      <button
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left font-medium mt-1",
                          isActive(user.role === 'mentor' ? `/mentors/${user.profileId}` : `/buddies/${user.profileId}`)
                            ? "bg-card text-foreground border border-border shadow-sm"
                            : "hover:bg-card/50 text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => isMobile && setSidebarOpen(false)}
                      >
                        <UserCircle className={cn(
                          "h-5 w-5 transition-colors",
                          isActive(user.role === 'mentor' ? `/mentors/${user.profileId}` : `/buddies/${user.profileId}`)
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )} />
                        <span className={cn(
                          "font-medium",
                          isActive(user.role === 'mentor' ? `/mentors/${user.profileId}` : `/buddies/${user.profileId}`)
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}>
                          My Profile
                        </span>
                      </button>
                    </Link>
                  )}
                </div>
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
  };

  return (
    <div className="flex h-dvh page-container overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out xl:translate-x-0 xl:static xl:inset-0 flex-shrink-0",
        isMobile && !sidebarOpen && "-translate-x-full"
      )}>
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden bg-background">
        {/* Top bar for all screens */}
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background w-full">
          {children}
        </main>
      </div>
    </div>
  );
}