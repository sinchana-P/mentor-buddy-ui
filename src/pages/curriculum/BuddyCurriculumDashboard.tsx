/**
 * Buddy Curriculum Dashboard
 * Interactive curriculum overview with progress tracking for buddies
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { useGetBuddyDashboardQuery } from '@/api/curriculum/curriculumApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  BookOpen,
  ChevronDown,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  Target,
  Calendar,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { TaskAssignment, BuddyWeekProgress, BuddyDashboardData } from '@/types/curriculum';
import BuddyTaskItem from '@/components/curriculum/BuddyTaskItem';

interface BuddyCurriculumDashboardProps {
  buddyId: string;
}

export default function BuddyCurriculumDashboard({ buddyId }: BuddyCurriculumDashboardProps) {
  const [, navigate] = useLocation();
  const { data: dashboardData, isLoading } = useGetBuddyDashboardQuery(buddyId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-12 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!dashboardData || !dashboardData.enrollment) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="py-16 text-center">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Curriculum Assigned</h3>
              <p className="text-muted-foreground">
                You haven't been enrolled in a curriculum yet. Contact your mentor.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { enrollment, weekProgress, statistics, upcomingTasks } = dashboardData;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            {enrollment.curriculum?.name || 'Your Curriculum'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {enrollment.curriculum?.description}
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.overallProgress}%</div>
              <Progress value={statistics.overallProgress} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {statistics.completedTasks}/{statistics.totalTasks} tasks completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Week</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Week {statistics.currentWeek}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                of {statistics.totalWeeks} total weeks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days Active</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.daysActive}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Started {formatDistanceToNow(new Date(enrollment.startedAt), { addSuffix: true })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.pendingSubmissions}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Awaiting mentor feedback
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Tasks */}
        {upcomingTasks && upcomingTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/curriculum/tasks/${task.id}`)}
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{task.taskTemplate?.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      {task.dueDate && (
                        <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm">
                    {task.status === 'not_started' ? 'Start' : 'Continue'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <p className="text-sm text-muted-foreground">
              Track your progress week by week. All tasks are visible - you can work ahead!
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {weekProgress.map((week) => (
              <WeekProgressCard key={week.id} week={week} buddyId={buddyId} />
            ))}
          </CardContent>
        </Card>

        {/* Helpful Tip */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">You can work ahead!</h4>
                <p className="text-sm text-muted-foreground">
                  All tasks are unlocked from day one. We recommend completing the current week
                  before moving on, but you're free to explore future tasks anytime.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Week Progress Card Component
function WeekProgressCard({ week, buddyId }: { week: BuddyWeekProgress; buddyId: string }) {
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(week.status === 'in_progress');

  const getStatusIcon = () => {
    switch (week.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Circle className="h-5 w-5 text-yellow-500 fill-yellow-500/20" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    const badges = {
      completed: <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>,
      in_progress: <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">In Progress</Badge>,
      not_started: <Badge variant="outline">Not Started</Badge>,
    };
    return badges[week.status];
  };

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-4 p-4">
          {getStatusIcon()}

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">
                Week {week.weekNumber}: {week.week?.title}
              </h3>
              {getStatusBadge()}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {week.completedTasks}/{week.totalTasks} tasks
              </span>
              <div className="flex-1">
                <Progress value={week.progressPercentage} className="h-2" />
              </div>
              <span className="font-medium">{week.progressPercentage}%</span>
            </div>

            {week.completedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Completed {formatDistanceToNow(new Date(week.completedAt), { addSuffix: true })}
              </p>
            )}
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-2 border-t pt-4">
            {week.week?.description && (
              <p className="text-sm text-muted-foreground mb-3">{week.week.description}</p>
            )}

            {week.assignments && week.assignments.length > 0 ? (
              <div className="space-y-2">
                {week.assignments.map((assignment) => (
                  <BuddyTaskItem
                    key={assignment.id}
                    assignment={assignment}
                    onClick={() => navigate(`/curriculum/tasks/${assignment.id}`)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks assigned for this week yet.
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
