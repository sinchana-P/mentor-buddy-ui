import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Palette, Check } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps = {}) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [, navigate] = useLocation();
  const { theme, setTheme, themes } = useTheme();

  return (
    <header className="h-16 border-b border-border bg-background-secondary px-3 sm:px-6 flex-shrink-0">
      <div className="flex items-center justify-between h-full w-full max-w-full">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
              onClick={onMenuClick}
            >
              <Menu className="w-4 h-4" />
            </Button>
          )}
          <h2 className="text-sm sm:text-lg font-semibold text-foreground truncate">
            Welcome back, {user?.name || "Manager 2"}
          </h2>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {/* Theme Switcher Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-card"
                title="Change Theme"
              >
                <Palette className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl p-2">
              <div className="px-2 py-2 mb-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Choose Theme
                </p>
              </div>
              {themes.map((themeOption) => (
                <DropdownMenuItem
                  key={themeOption.value}
                  onClick={() => setTheme(themeOption.value)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all
                    ${theme === themeOption.value
                      ? 'bg-blue-500/10 border border-blue-500/30'
                      : 'hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  {/* Theme Color Indicator */}
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${themeOption.value === 'dark' ? 'bg-slate-900 border border-slate-700' : ''}
                    ${themeOption.value === 'navy' ? 'bg-blue-900 border border-blue-700' : ''}
                    ${themeOption.value === 'light' ? 'bg-white border border-gray-300' : ''}
                  `}>
                    <Palette className={`w-5 h-5 ${themeOption.value === 'light' ? 'text-gray-700' : 'text-white'}`} />
                  </div>

                  {/* Theme Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {themeOption.label}
                      </span>
                      {theme === themeOption.value && (
                        <Check className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {themeOption.description}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-card"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </Button>

          {/* User Avatar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/settings")}
            style={{ backgroundColor: "transparent" }}
            title="Go to Settings"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || "User"}
                className="w-8 h-8 rounded-full ring-1 ring-border object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-card rounded-full flex items-center justify-center ring-1 ring-border">
                <span className="text-sm font-bold text-foreground">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "M2"}
                </span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
