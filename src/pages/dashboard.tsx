import { useAuth } from '@/hooks/useAuth';
import RecentActivities from '@/components/RecentActivities';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { Users, GraduationCap, BarChart3, Presentation, University, TrendingUp, Target, Clock, LayoutDashboard } from 'lucide-react';
import { useGetDashboardStatsQuery, useGetDashboardActivityQuery } from '@/api/dashboardApi';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect based on role
  useEffect(() => {
    if (user?.role === 'mentor') {
      setLocation('/mentor/dashboard');
    } else if (user?.role === 'buddy') {
      setLocation('/buddy/dashboard');
    }
    // Managers stay on this page
  }, [user?.role, setLocation]);

  // Use RTK Query with polling for real-time updates
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetDashboardStatsQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  
  const { data: recentActivity = [], isLoading: activityLoading, error: activityError } = useGetDashboardActivityQuery(undefined, {
    pollingInterval: 15000, // Poll every 15 seconds for activities
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const statCards = [
    {
      title: 'Total Mentors',
      value: stats?.totalMentors ?? 0,
      icon: Users,
      description: 'Active mentors',
    },
    {
      title: 'Active Buddies',
      value: stats?.activeBuddies ?? 0,
      icon: GraduationCap,
      description: 'Learning buddies',
    },
    {
      title: 'Tasks this Week',
      value: stats?.activeTasks ?? 0,
      icon: Target,
      description: 'In progress',
    },
    {
      title: 'Completion Rate',
      value: `${stats?.completionRate ?? 0}%`,
      icon: TrendingUp,
      description: 'Overall progress',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Mentors',
      description: 'View and manage mentor profiles',
      icon: Presentation,
      path: '/mentors',
    },
    {
      title: 'Manage Buddies',
      description: 'Track buddy progress and development',
      icon: University,
      path: '/buddies',
    },
    {
      title: 'View Analytics',
      description: 'Performance metrics and reports',
      icon: BarChart3,
      path: '/analytics',
    },
  ];

  if (statsLoading || activityLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      {/* Standardized Page Header */}
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="Overview of your mentoring platform"
      />

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.title}
                className="cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => setLocation(action.path)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{action.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-lg">Recent Activities</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <RecentActivities maxItems={5} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
