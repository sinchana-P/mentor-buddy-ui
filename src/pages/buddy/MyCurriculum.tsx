import React from 'react';
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
import { useState, useEffect, useMemo } from 'react';

export default function MyCurriculum() {
  const user = useSelector((state: any) => state.auth.user);
  const [buddyProfile, setBuddyProfile] = useState<any>(null);
  const [activeWeekTab, setActiveWeekTab] = useState(1);

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

  // Group assignments by week number - ALWAYS call hooks before any returns
  const weeklyAssignments = useMemo(() => {
    if (!assignments.length) return {};

    const grouped: Record<number, any[]> = {};
    assignments.forEach((assignment: any) => {
      const weekNumber = assignment.week?.weekNumber || assignment.weekProgress?.weekNumber || 1;
      if (!grouped[weekNumber]) {
        grouped[weekNumber] = [];
      }
      grouped[weekNumber].push(assignment);
    });

    // Sort tasks within each week by display order
    Object.keys(grouped).forEach(week => {
      grouped[Number(week)].sort((a, b) =>
        (a.taskTemplate?.displayOrder || 0) - (b.taskTemplate?.displayOrder || 0)
      );
    });

    return grouped;
  }, [assignments]);

  // Get all week numbers for tabs
  const weekNumbers = useMemo(() => {
    const weekProgress = curriculumData?.weekProgress;
    if (weekProgress?.length) {
      return weekProgress.map((w: any) => w.weekNumber).sort((a: number, b: number) => a - b);
    }
    return Object.keys(weeklyAssignments).map(Number).sort((a, b) => a - b);
  }, [curriculumData?.weekProgress, weeklyAssignments]);

  // Set initial week tab when data loads
  useEffect(() => {
    if (weekNumbers.length > 0 && !weekNumbers.includes(activeWeekTab)) {
      setActiveWeekTab(weekNumbers[0]);
    }
  }, [weekNumbers, activeWeekTab]);

  // Early returns AFTER all hooks are called
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
          <p>Loading your curriculum...</p>
        </div>
      </Layout>
    );
  }

  if (curriculumError || !curriculumData) {
    return (
      <Layout>
        <div className="w-full px-6 py-6">
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
      <div className="w-full px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Curriculum</h1>
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

        {/* Weekly Progress with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>All tasks are visible - work at your own pace!</CardDescription>
          </CardHeader>
          <CardContent>
            {weekNumbers.length > 0 ? (
              <div>
                {/* Week Tabs - Clean Minimal Design */}
                <div className="bg-gray-100 dark:bg-slate-800/50 rounded-xl p-1 inline-flex gap-1 mb-6">
                  {weekNumbers.map((weekNum: number) => {
                    const weekProgressData = weekProgress?.find((w: any) => w.weekNumber === weekNum);
                    return (
                      <button
                        key={weekNum}
                        onClick={() => setActiveWeekTab(weekNum)}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          activeWeekTab === weekNum
                            ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          Week {weekNum}
                          {weekProgressData?.status === 'completed' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Week Details for Active Tab */}
                {weekProgress?.find((w: any) => w.weekNumber === activeWeekTab) && (
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          {weeklyAssignments[activeWeekTab]?.[0]?.week?.title || `Week ${activeWeekTab}`}
                        </h3>
                        {weeklyAssignments[activeWeekTab]?.[0]?.week?.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {weeklyAssignments[activeWeekTab][0].week.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Progress
                            value={weekProgress.find((w: any) => w.weekNumber === activeWeekTab)?.progressPercentage || 0}
                            className="w-24 h-2"
                          />
                          <span className="text-sm font-medium">
                            {weekProgress.find((w: any) => w.weekNumber === activeWeekTab)?.progressPercentage || 0}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {weekProgress.find((w: any) => w.weekNumber === activeWeekTab)?.completedTasks || 0}/
                          {weekProgress.find((w: any) => w.weekNumber === activeWeekTab)?.totalTasks || 0} tasks
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tasks for Active Week */}
                <div className="space-y-3">
                  {(weeklyAssignments[activeWeekTab] || []).length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                      <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No tasks in this week</p>
                    </div>
                  ) : (
                    (weeklyAssignments[activeWeekTab] || []).map((item: any) => (
                      <div
                        key={item.assignment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
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
                    ))
                  )}
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Tip:</strong> You can work ahead! All tasks are available now. Suggested pace: Complete
                    current week before moving on.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No week progress data available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
