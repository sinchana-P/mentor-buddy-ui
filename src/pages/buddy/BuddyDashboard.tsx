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
import { CheckCircle, Clock, FileText, AlertCircle, Calendar, Target } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
        <div className="container mx-auto py-6">
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
        <div className="container mx-auto py-6">
          <p>Loading your curriculum...</p>
        </div>
      </Layout>
    );
  }

  if (curriculumError || !curriculumData) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="text-center py-10">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Curriculum Assigned</h3>
              <p className="text-gray-600">You haven't been assigned a curriculum yet. Please contact your mentor.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const { enrollment, curriculum, weekProgress, totalTasks, completedTasks, overallProgress } = curriculumData;

  // Group assignments by week
  const assignmentsByWeek = assignments.reduce((acc: any, item: any) => {
    const weekId = item.week?.id;
    if (!acc[weekId]) {
      acc[weekId] = [];
    }
    acc[weekId].push(item);
    return acc;
  }, {});

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'submitted':
      case 'under_review':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'needs_revision':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

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
    return (
      <Badge {...config}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Buddy'}!</h1>
          <h2 className="text-xl text-gray-600">{curriculum.name}</h2>
        </div>

        {/* Progress Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>Your journey through the curriculum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">
                    Completed: {completedTasks}/{totalTasks} tasks
                  </span>
                  <span className="text-sm font-medium">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Started</p>
                    <p className="font-semibold">
                      {enrollment.startedAt ? new Date(enrollment.startedAt).toLocaleDateString() : 'Not started'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Current Week</p>
                    <p className="font-semibold">Week {enrollment.currentWeek || 1}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Target Completion</p>
                    <p className="font-semibold">
                      {enrollment.targetCompletionDate
                        ? new Date(enrollment.targetCompletionDate).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>All tasks are visible - work at your own pace!</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {weekProgress && weekProgress.length > 0 ? (
                weekProgress.map((week: any) => {
                  const weekTasks = assignmentsByWeek[week.curriculumWeekId] || [];
                  const weekData = weekTasks[0]?.week;

                  return (
                    <AccordionItem key={week.id} value={week.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center gap-3">
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">
                                  Week {week.weekNumber}: {weekData?.title || `Week ${week.weekNumber}`}
                                </p>
                                {week.status === 'completed' && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {week.completedTasks}/{week.totalTasks} tasks ({week.progressPercentage}%)
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Progress value={week.progressPercentage} className="w-24 h-2" />
                            <span className="text-sm font-medium">{week.progressPercentage}%</span>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent>
                        <div className="pl-8 pr-4 py-4 space-y-3">
                          {weekData?.description && (
                            <p className="text-sm text-gray-600 mb-4">{weekData.description}</p>
                          )}

                          {weekTasks.length === 0 ? (
                            <p className="text-sm text-gray-500">No tasks for this week yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {weekTasks.map((item: any) => (
                                <div
                                  key={item.assignment.id}
                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    {getStatusIcon(item.assignment.status)}
                                    <div className="flex-1">
                                      <p className="font-medium">{item.taskTemplate?.title || 'Untitled Task'}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        {getStatusBadge(item.assignment.status)}
                                        {item.taskTemplate?.difficulty && (
                                          <Badge variant="outline" className="text-xs">
                                            {item.taskTemplate.difficulty}
                                          </Badge>
                                        )}
                                        {item.taskTemplate?.estimatedHours && (
                                          <span className="text-xs text-gray-500">
                                            {item.taskTemplate.estimatedHours}h
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <Link href={`/buddy/task/${item.assignment.id}`}>
                                    <Button size="sm" variant="outline">
                                      {item.assignment.status === 'not_started' ? 'Start Task' : 'View Task'}
                                    </Button>
                                  </Link>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">No week progress data available.</p>
              )}
            </Accordion>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>💡 Tip:</strong> You can work ahead! All tasks are available now. Suggested pace: Complete
                current week before moving on.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
