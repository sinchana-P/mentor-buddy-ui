import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useSelector } from 'react-redux';
import { useGetBuddyCurriculumQuery, useGetBuddyAssignmentsQuery } from '@/api/curriculumManagementApi';
import { useGetBuddiesQuery } from '@/api/buddiesApi';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, FileText, AlertCircle, ArrowRight, GraduationCap, Target, TrendingUp, BookOpen } from 'lucide-react';

export default function BuddyDashboard() {
  const user = useSelector((state: any) => state.auth.user);
  const [buddyProfile, setBuddyProfile] = useState<any>(null);

  // Fetch all buddies to find current user's buddy profile
  const { data: allBuddies = [] } = useGetBuddiesQuery();

  useEffect(() => {
    if (allBuddies && user?.id) {
      // Find buddy profile by userId
      const profile = allBuddies.find((buddy: any) => buddy.userId === user.id);
      setBuddyProfile(profile);
    }
  }, [allBuddies, user?.id]);

  const buddyId = buddyProfile?.id;

  const { data: curriculumData, isLoading: loadingCurriculum, isError: curriculumError } = useGetBuddyCurriculumQuery(buddyId || '', {
    skip: !buddyId,
  });

  const { data: assignments = [], isLoading: loadingAssignments } = useGetBuddyAssignmentsQuery(buddyId || '', {
    skip: !buddyId,
  });

  if (!buddyId) {
    return (
      <Layout>
        <div className="w-full px-6 py-6">
          <Card>
            <CardContent className="text-center py-10">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Buddy Profile Found</h3>
              <p className="text-gray-600">Please contact your manager to set up your buddy profile.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (loadingCurriculum || loadingAssignments) {
    return (
      <Layout>
        <div className="w-full px-6 py-6">
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  // Calculate stats
  const inProgressTasks = assignments.filter((a: any) => a.assignment.status === 'in_progress').length;
  const submittedTasks = assignments.filter((a: any) => ['submitted', 'under_review'].includes(a.assignment.status)).length;
  const needsRevisionTasks = assignments.filter((a: any) => a.assignment.status === 'needs_revision').length;
  const completedTasksCount = assignments.filter((a: any) => a.assignment.status === 'completed').length;
  const totalTasks = curriculumData?.totalTasks || 0;
  const overallProgress = curriculumData?.overallProgress || 0;

  // Get recent/active tasks
  const activeTasks = assignments
    .filter((a: any) => ['in_progress', 'needs_revision'].includes(a.assignment.status))
    .slice(0, 3);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: { className: 'bg-green-500', label: 'Completed' },
      submitted: { className: 'bg-blue-500', label: 'Submitted' },
      under_review: { className: 'bg-blue-500', label: 'Under Review' },
      needs_revision: { className: 'bg-yellow-500', label: 'Needs Revision' },
      in_progress: { className: 'bg-orange-500', label: 'In Progress' },
      not_started: { variant: 'outline', label: 'Not Started' },
    };

    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge {...config}>{config.label}</Badge>;
  };

  return (
    <Layout>
      <div className="w-full px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Buddy'}!</h1>
          <p className="text-muted-foreground">Here's an overview of your learning progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <p className="text-2xl font-bold">{overallProgress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <Progress value={overallProgress} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Tasks</p>
                  <p className="text-2xl font-bold">{completedTasksCount}/{totalTasks}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{inProgressTasks}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Awaiting Review</p>
                  <p className="text-2xl font-bold">{submittedTasks}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Tasks */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Active Tasks</CardTitle>
                  <CardDescription>Tasks you're currently working on</CardDescription>
                </div>
                <Link href="/buddy/curriculum">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {activeTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No active tasks</p>
                    <Link href="/buddy/curriculum">
                      <Button>Start a Task</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeTasks.map((item: any) => (
                      <div
                        key={item.assignment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.taskTemplate?.title || 'Untitled Task'}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(item.assignment.status)}
                            {item.taskTemplate?.estimatedHours && (
                              <span className="text-xs text-muted-foreground">
                                {item.taskTemplate.estimatedHours}h estimated
                              </span>
                            )}
                          </div>
                        </div>
                        <Link href={`/buddy/task/${item.assignment.id}`}>
                          <Button size="sm">Continue</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}

                {needsRevisionTasks > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>{needsRevisionTasks} task(s)</strong> need revision based on mentor feedback
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Curriculum Card */}
            {curriculumData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    {curriculumData.curriculum.name}
                  </CardTitle>
                  <CardDescription>Your assigned curriculum</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Week</span>
                      <span className="font-medium">Week {curriculumData.enrollment.currentWeek || 1}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Weeks</span>
                      <span className="font-medium">{curriculumData.curriculum.totalWeeks}</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                    <Link href="/buddy/curriculum">
                      <Button className="w-full mt-2">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        View Curriculum
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/buddy/curriculum">
                  <Button variant="outline" className="w-full justify-start">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    My Curriculum
                  </Button>
                </Link>
                <Link href="/resources">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Learning Resources
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
