import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGetDashboardActivityQuery } from '@/api/apiSlice';
import { 
  Users, 
  GraduationCap, 
  CheckSquare, 
  MessageCircle, 
  BookOpen, 
  TrendingUp,
  Clock,
  MoreHorizontal,
  Loader2
} from 'lucide-react';


interface RecentActivitiesProps {
  maxItems?: number;
  showViewAll?: boolean;
}

export default function RecentActivities({ maxItems = 5, showViewAll = true }: RecentActivitiesProps) {
  const { data: activities = [], isLoading, error } = useGetDashboardActivityQuery(undefined, {
    pollingInterval: 30000, 
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckSquare className="h-4 w-4 text-green-500" />;
      case 'buddy_assigned':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'message_sent':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case 'progress_updated':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'resource_added':
        return <BookOpen className="h-4 w-4 text-indigo-500" />;
      case 'mentor_joined':
        return <GraduationCap className="h-4 w-4 text-teal-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'buddy_assigned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'message_sent':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'progress_updated':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'resource_added':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'mentor_joined':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const displayActivities = activities.slice(0, maxItems);

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes} minutes ago`;
      if (hours < 24) return `${hours} hours ago`;
      if (days < 7) return `${days} days ago`;
      return date.toLocaleDateString();
    } catch {
      return timestamp;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates from your team</CardDescription>
          </div>
          {showViewAll && (
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">Loading activities...</span>
          </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <p className="text-sm text-destructive">Failed to load activities</p>
          </div>
        )}
        
        {!isLoading && !error && activities.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No recent activities</p>
          </div>
        )}
        
        {!isLoading && !error && activities.length > 0 && (
          <div className="space-y-4">
            {displayActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium">{activity.type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Activity'}</p>
                  <Badge variant="outline" className="text-xs">
                    {activity.status || 'Active'}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {activity.message || activity.description}
                </p>
                
                <p className="text-xs text-muted-foreground mt-2">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
              
              <div className="flex-shrink-0">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={activity.user?.avatarUrl} alt={activity.user?.name} />
                  <AvatarFallback className="text-xs">
                    {activity.user?.name ? activity.user.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </motion.div>
          ))}
          {showViewAll && activities.length > maxItems && (
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full">
                View All Activities
              </Button>
            </div>
          )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 