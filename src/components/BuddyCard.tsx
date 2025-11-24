import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useLocation } from 'wouter';
import type { BuddyRO } from '@/api/dto';

interface BuddyCardProps {
  buddy: BuddyRO | any; // Support both BuddyRO and legacy structure
  showMentor?: boolean;
}

export default function BuddyCard({ buddy, showMentor = true }: BuddyCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/buddies/${buddy.id}`);
  };

  // Get buddy name from either buddy.name or buddy.user.name
  const buddyName = buddy.name || buddy.user?.name || 'Unknown Buddy';
  const buddyEmail = buddy.email || buddy.user?.email || '';
  const buddyDomain = buddy.domainRole || buddy.user?.domainRole || 'Unknown';
  const buddyAvatar = buddy.avatarUrl || buddy.user?.avatarUrl || '';
  const buddyStatus = buddy.status || 'inactive';
  const buddyProgress = buddy.progress || 0;
  const tasksCompleted = buddy.tasksCompleted || buddy.stats?.completedTasks || 0;
  const totalTasks = buddy.totalTasks || buddy.stats?.totalTasks || 0;
  const mentorName = buddy.mentorName || buddy.mentor?.user?.name || '';

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'default',
      inactive: 'secondary',
      exited: 'destructive',
    };
    return colors[status as keyof typeof colors] || 'secondary';
  };

  const getStatusBadgeClass = (status: string) => {
    const classes = {
      active: 'bg-green-500/10 text-green-600 border-green-500/20',
      inactive: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      exited: 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    return classes[status as keyof typeof classes] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  };

  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-sm h-full"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={buddyAvatar} alt={buddyName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {buddyName.split(' ').map(n => n[0]).join('').toUpperCase() || 'B'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate text-base">{buddyName}</h3>
            <p className="text-xs text-muted-foreground capitalize">
              {buddyDomain} Developer
            </p>
            <Badge
              variant="outline"
              className={`mt-1.5 text-xs capitalize ${getStatusBadgeClass(buddyStatus)}`}
            >
              {buddyStatus}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Join Date:</span>
            <span className="font-medium">{new Date(buddy.joinDate).toLocaleDateString()}</span>
          </div>

          {showMentor && mentorName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mentor:</span>
              <span className="font-medium text-primary truncate ml-2">{mentorName}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">Tasks:</span>
            <span className="font-semibold">
              <span className="text-green-600">{tasksCompleted}</span>
              <span className="text-muted-foreground">/{totalTasks}</span>
            </span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-muted-foreground">Progress:</span>
            <span className="font-semibold">{buddyProgress}%</span>
          </div>
          <Progress value={buddyProgress} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  );
}
