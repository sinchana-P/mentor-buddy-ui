import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import RecentActivities from '@/components/RecentActivities';
import { useLocation } from 'wouter';
import { Users, GraduationCap, BarChart3, Presentation, University, TrendingUp, Zap, Target, Award, Clock } from 'lucide-react';
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

  // Debug logs to see what we're getting
  console.log('Dashboard stats:', stats, 'Loading:', statsLoading, 'Error:', statsError);
  console.log('Recent activity:', recentActivity, 'Loading:', activityLoading, 'Error:', activityError);

  const roleCards = [
    {
      id: 'mentors',
      title: 'Mentors',
      description: 'Manage mentor profiles and assignments',
      icon: Presentation,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'hover:border-blue-500',
      stats: {
        total: stats?.totalMentors || 0,
        active: stats?.totalMentors || 0, // For now, assume all mentors are active
      },
    },
    {
      id: 'buddies',
      title: 'Buddies',
      description: 'Track buddy progress and development',
      icon: University,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'hover:border-green-500',
      stats: {
        total: stats?.totalBuddies || 0,
        active: stats?.totalBuddies || 0, // For now, assume all buddies are active
      },
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View reports and performance metrics',
      icon: BarChart3,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20',
      borderColor: 'hover:border-purple-500',
      stats: {
        reports: stats?.completedTasks || 0,
        growth: '+0%', // This can be calculated later
      },
    },
  ];

  return (
    <div className="min-h-screen p-6 space-y-8 page-container">
      {/* Hero Section with Premium Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden"
      >
        <div className="premium-card mb-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <motion.h1 
                className="text-4xl font-bold text-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Welcome back, {user?.name || 'Manager 2'}
              </motion.h1>
              <motion.p 
                className="text-muted-foreground text-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Here's your mentoring platform overview
              </motion.p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center ring-1 ring-border">
                <Award className="w-8 h-8 text-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Premium Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="premium-card hover-lift"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Mentors</p>
                <p className="text-3xl font-bold text-foreground">
                  {statsLoading ? '...' : (stats?.totalMentors ?? 0)}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  {statsError ? 'Error loading data' : '0% from last month'}
                </p>
              </div>
              <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center ring-1 ring-border">
                <Users className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="premium-card hover-lift"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Active Buddies</p>
                <p className="text-3xl font-bold text-foreground">
                  {statsLoading ? '...' : (stats?.activeBuddies ?? 0)}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  {statsError ? 'Error loading data' : '0% from last month'}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="premium-card hover-lift"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Tasks this Week</p>
                <p className="text-3xl font-bold text-foreground">
                  {statsLoading ? '...' : (stats?.activeTasks ?? 0)}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  {statsError ? 'Error loading data' : 'vs two tasks'}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="premium-card hover-lift"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Completion Rate</p>
                <p className="text-3xl font-bold text-foreground">
                  {statsLoading ? '...' : `${stats?.completionRate ?? 0}%`}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  {statsError ? 'Error loading data' : 'vs 86% last month'}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-foreground" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Premium Role Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center ring-1 ring-border">
              <Zap className="w-4 h-4 text-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Platform Management</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roleCards.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="premium-card hover-lift cursor-pointer group"
                  onClick={() => setLocation(`/${role.id}`)}
                >
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-card rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 ring-1 ring-border">
                      <Icon className="w-8 h-8 text-foreground" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{role.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{role.description}</p>
                    </div>
                    
                    <div className="flex justify-center gap-6 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{role.stats.total}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{role.stats.active}</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                    </div>

                    <button className="btn-gradient w-full group-hover:scale-105 transition-transform duration-300">
                      Manage {role.title}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Premium Activity & Actions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities with Premium Design */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="premium-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center ring-1 ring-border">
                <Clock className="w-4 h-4 text-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Recent Activities</h3>
            </div>
            <RecentActivities maxItems={5} />
          </motion.div>
          
          {/* Premium Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="premium-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center ring-1 ring-border">
                <Zap className="w-4 h-4 text-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Quick Actions</h3>
            </div>
            
            <div className="space-y-3">
              <button 
                className="w-full p-4 glass-card hover-lift flex items-center gap-3 text-left"
                onClick={() => setLocation('/tasks')}
              >
                <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center ring-1 ring-border">
                  <BarChart3 className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Create New Task</p>
                  <p className="text-sm text-muted-foreground">Assign tasks to buddies</p>
                </div>
              </button>
              
              <button 
                className="w-full p-4 glass-card hover-lift flex items-center gap-3 text-left"
                onClick={() => setLocation('/buddies')}
              >
                <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center ring-1 ring-border">
                  <GraduationCap className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Assign Buddy to Mentor</p>
                  <p className="text-sm text-muted-foreground">Connect learning pairs</p>
                </div>
              </button>
              
              <button 
                className="w-full p-4 glass-card hover-lift flex items-center gap-3 text-left"
                onClick={() => setLocation('/resources')}
              >
                <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center ring-1 ring-border">
                  <University className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Add Learning Resource</p>
                  <p className="text-sm text-muted-foreground">Expand the knowledge base</p>
                </div>
              </button>
              
              <button 
                className="w-full p-4 glass-card hover-lift flex items-center gap-3 text-left"
                onClick={() => setLocation('/analytics')}
              >
                <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center ring-1 ring-border">
                  <TrendingUp className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">View Analytics Report</p>
                  <p className="text-sm text-muted-foreground">Track platform performance</p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
