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
    <header className="h-16 border-b border-border bg-card px-6">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center space-x-4">
          {isMobile && (
            <Button variant="ghost" size="sm">
              <Menu className="w-4 h-4" />
            </Button>
          )}
          <h2 className="text-lg font-semibold">
            Welcome back, {user?.name || 'User'}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <BulbOutlined style={{ fontSize: 20 }} />
            ) : (
              <MoonOutlined style={{ fontSize: 20 }} />
            )}
          </Button>
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatarUrl} alt={user?.name} />
            <AvatarFallback>
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

export default TopBar;