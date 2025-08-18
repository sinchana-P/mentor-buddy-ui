import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, Bell, Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { BulbOutlined, MoonOutlined } from '@ant-design/icons';

interface TopBarProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export function TopBar({ theme, setTheme }: TopBarProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header className="h-16 border-b border-border bg-background-secondary px-6">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center space-x-4">
          {isMobile && (
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Menu className="w-4 h-4" />
            </Button>
          )}
          <h2 className="text-lg font-semibold text-foreground">
            Welcome back, {user?.name || 'Manager 2'}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-muted-foreground hover:text-foreground hover:bg-card"
          >
            <Bell className="w-4 h-4" />
          </Button>
          <div className="w-8 h-8 bg-card rounded-full flex items-center justify-center ring-1 ring-border">
            <span className="text-sm font-bold text-foreground">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'M2'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;