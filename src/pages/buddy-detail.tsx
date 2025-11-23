import { useState, useMemo } from 'react';
import { useParams } from 'wouter';
import { useSelector } from 'react-redux';
import {
  useGetBuddiesQuery,
  useUpdateTaskMutation,
} from '@/api';
import {
  useGetBuddyCurriculumQuery,
  useGetBuddyAssignmentsQuery,
} from '@/api/curriculumManagementApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Clock, Edit, MessageSquare } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import type { BuddyRO } from '@/api/dto';
import type { RootState } from '@/store';
import EditBuddyModal from '@/components/EditBuddyModal';
import { usePermissions } from '@/hooks/usePermissions';

// Status indicator with dot
const StatusIndicator = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return { label: 'Approved', dotColor: 'bg-green-500', textColor: 'text-green-600' };
      case 'under_review':
      case 'submitted':
        return { label: 'Under Review', dotColor: 'bg-orange-500', textColor: 'text-orange-600' };
      case 'in_progress':
        return { label: 'In Progress', dotColor: 'bg-green-500', textColor: 'text-green-600' };
      case 'not_started':
      default:
        return { label: 'Not Started', dotColor: 'bg-gray-400', textColor: 'text-gray-500' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      <span className={`text-sm font-medium ${config.textColor}`}>{config.label}</span>
    </div>
  );
};

// Time remaining indicator
const TimeIndicator = ({ status, dueDate }: { status: string; dueDate?: string }) => {
  if (status === 'completed' || status === 'approved') {
    return null;
  }
  if (dueDate) {
    const due = new Date(dueDate);
    const now = new Date();
    const daysRemaining = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysRemaining < 0) {
      return <span className="text-sm text-red-600">Overdue</span>;
    } else if (daysRemaining === 0) {
      return <span className="text-sm text-orange-600">Due today</span>;
    } else {
      return <span className="text-sm text-muted-foreground">{daysRemaining} days remaining</span>;
    }
  }
  return null;
};

// Action button based on status and permissions
const getActionButton = (status: string, isMentorOrManager: boolean, isOwnProfile: boolean) => {
  switch (status) {
    case 'completed':
    case 'approved':
      return { label: 'View Submission', variant: 'outline' as const, show: true };
    case 'under_review':
    case 'submitted':
      return isMentorOrManager
        ? { label: 'Review Submission', variant: 'default' as const, show: true }
        : { label: 'View Submission', variant: 'outline' as const, show: true };
    case 'in_progress':
      // Only the actual buddy can continue their own task
      return { label: 'Continue Task', variant: 'default' as const, show: isOwnProfile };
    case 'not_started':
    default:
      // Only the actual buddy can start their own task
      return { label: 'Start Task', variant: 'default' as const, show: isOwnProfile };
  }
};

export default function BuddyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('tasks');
  const [activeWeekTab, setActiveWeekTab] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const { toast } = useToast();

  // Get current user from Redux and permissions
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { userId, isMentor, isManager, isBuddy } = usePermissions();

  // Fetch buddy data
  const { data: buddies = [], isLoading } = useGetBuddiesQuery({});
  const buddy = buddies.find((b: BuddyRO) => b.id === id);

  // Fetch curriculum progress and assignments
  const { data: curriculumData, isLoading: isLoadingCurriculum } = useGetBuddyCurriculumQuery(id || '', {
    skip: !id,
  });

  const { data: assignments = [], isLoading: isLoadingAssignments } = useGetBuddyAssignmentsQuery(id || '', {
    skip: !id,
  });

  // Task mutations
  const [updateTaskTrigger] = useUpdateTaskMutation();

  // Group assignments by week
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
    if (curriculumData?.weekProgress?.length) {
      return curriculumData.weekProgress.map((w: any) => w.weekNumber).sort((a: number, b: number) => a - b);
    }
    return Object.keys(weeklyAssignments).map(Number).sort((a, b) => a - b);
  }, [curriculumData, weeklyAssignments]);

  // Set initial week tab when data loads
  useMemo(() => {
    if (weekNumbers.length > 0 && !weekNumbers.includes(activeWeekTab)) {
      setActiveWeekTab(weekNumbers[0]);
    }
  }, [weekNumbers]);

  // Check if current user is viewing their own profile
  const buddyUserId = buddy?.user?.id || buddy?.userId || '';
  const isOwnProfile = buddyUserId === userId;
  const isMentorOrManager = isMentor || isManager;

  // Handle task expand/collapse
  const handleTaskClick = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
    setFeedbackText('');
  };

  // Handle approve task
  const handleApprove = async (assignmentId: string) => {
    try {
      await updateTaskTrigger({
        id: assignmentId,
        data: { status: 'approved' }
      }).unwrap();
      toast({ title: 'Success', description: 'Task approved!' });
      setExpandedTaskId(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to approve task.', variant: 'destructive' });
    }
  };

  // Handle request changes
  const handleRequestChanges = async (assignmentId: string) => {
    try {
      await updateTaskTrigger({
        id: assignmentId,
        data: { status: 'in_progress', feedback: feedbackText }
      }).unwrap();
      toast({ title: 'Success', description: 'Changes requested.' });
      setExpandedTaskId(null);
      setFeedbackText('');
    } catch {
      toast({ title: 'Error', description: 'Failed to request changes.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background">
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!buddy) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background">
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buddy not found</h1>
          <Link href="/buddies">
            <Button className="mt-4">Back to Buddies</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate overall progress from curriculum data
  const overallProgress = curriculumData?.overallProgress || 0;
  const curriculumName = curriculumData?.curriculum?.name || 'No curriculum assigned';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background">
      <div className="w-full px-6 py-6">
        {/* Back Button */}
        <Link href="/buddies">
          <Button variant="ghost" className="mb-6 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Buddies
          </Button>
        </Link>

        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={buddy.user?.avatarUrl} />
              <AvatarFallback className="bg-slate-200 text-slate-600 text-xl font-medium">
                {buddy.user?.name?.split(' ').map(n => n[0]).join('') || 'B'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{buddy.user?.name}</h1>
              <p className="text-blue-600 font-medium">{curriculumName}</p>
            </div>
          </div>

          {/* Progress Card */}
          <Card className="min-w-[200px] border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <span className="text-lg font-bold text-blue-600">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2 bg-blue-100" />
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border-b border-gray-200 dark:border-gray-700 w-full justify-start rounded-none h-auto p-0 mb-6">
            <TabsTrigger
              value="tasks"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3"
            >
              Details
            </TabsTrigger>
          </TabsList>

          {/* Tasks Tab Content */}
          <TabsContent value="tasks" className="mt-0">
            {isLoadingCurriculum || isLoadingAssignments ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading curriculum tasks...</p>
              </div>
            ) : weekNumbers.length > 0 ? (
              <div>
                {/* Week Tabs - Clean Minimal Design */}
                <div className="bg-gray-100 dark:bg-slate-800/50 rounded-xl p-1 inline-flex gap-1 mb-6">
                  {weekNumbers.map((weekNum: number) => (
                    <button
                      key={weekNum}
                      onClick={() => setActiveWeekTab(weekNum)}
                      className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeWeekTab === weekNum
                          ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Week {weekNum}
                    </button>
                  ))}
                </div>

                {/* Tasks for Active Week */}
                <div className="space-y-4">
                  {(weeklyAssignments[activeWeekTab] || []).map((item: any) => {
                    const task = item.taskTemplate;
                    const assignment = item.assignment;
                    const status = assignment?.status || 'not_started';
                    const isExpanded = expandedTaskId === (assignment?.id || task?.id);
                    const actionBtn = getActionButton(status, isMentorOrManager, isOwnProfile);

                    return (
                      <Card
                        key={assignment?.id || task?.id}
                        className={`border shadow-sm transition-all ${
                          isExpanded ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''
                        }`}
                      >
                        <CardContent className="p-5">
                          {/* Task Row */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {task?.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {task?.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <div className="text-right">
                                <StatusIndicator status={status} />
                                <TimeIndicator status={status} dueDate={assignment?.dueDate} />
                              </div>
                              {actionBtn.show && (
                                <Button
                                  variant={actionBtn.variant}
                                  size="sm"
                                  onClick={() => handleTaskClick(assignment?.id || task?.id)}
                                  className={actionBtn.variant === 'default' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                >
                                  {actionBtn.label}
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Expanded Section - For Under Review tasks */}
                          {isExpanded && (status === 'under_review' || status === 'submitted') && isMentorOrManager && (
                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                              {/* Submission Comment */}
                              <div className="flex gap-3 mb-4">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                  <AvatarFallback className="bg-slate-200 text-slate-600 text-sm">
                                    {buddy.user?.name?.split(' ').map(n => n[0]).join('') || 'B'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {assignment?.submissionNote || "I've submitted my work for review. Let me know if everything looks correct!"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {buddy.user?.name} - {assignment?.submittedAt ? new Date(assignment.submittedAt).toLocaleDateString() : 'Recently'}
                                  </p>
                                </div>
                              </div>

                              {/* Feedback Input */}
                              <div className="flex gap-3 mb-4">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                                    {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'M'}
                                  </AvatarFallback>
                                </Avatar>
                                <Textarea
                                  placeholder="Add feedback..."
                                  value={feedbackText}
                                  onChange={(e) => setFeedbackText(e.target.value)}
                                  className="flex-1 min-h-[60px] resize-none"
                                />
                              </div>

                              {/* Action Buttons */}
                              <div className="flex justify-end gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => handleRequestChanges(assignment?.id)}
                                >
                                  Request Changes
                                </Button>
                                <Button
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => handleApprove(assignment?.id)}
                                >
                                  Approve
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Expanded Section - For viewing completed/approved submissions */}
                          {isExpanded && (status === 'completed' || status === 'approved') && (
                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                              <div className="flex gap-3">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                  <AvatarFallback className="bg-slate-200 text-slate-600 text-sm">
                                    {buddy.user?.name?.split(' ').map(n => n[0]).join('') || 'B'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {assignment?.submissionNote || "Task completed and approved."}
                                  </p>
                                  <p className="text-xs text-green-600 mt-1">
                                    Completed - {assignment?.completedAt ? new Date(assignment.completedAt).toLocaleDateString() : 'Recently'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Expanded Section - Task details for not started / in progress */}
                          {isExpanded && (status === 'not_started' || status === 'in_progress') && (
                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                              {task?.requirements && (
                                <div className="mb-4">
                                  <h4 className="font-medium text-sm mb-2">Requirements</h4>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {task.requirements}
                                  </p>
                                </div>
                              )}
                              {task?.resources && task.resources.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm mb-2">Resources</h4>
                                  <ul className="space-y-1">
                                    {task.resources.map((resource: any, idx: number) => (
                                      <li key={idx}>
                                        <a
                                          href={resource.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline"
                                        >
                                          {resource.title}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                                {task?.estimatedHours && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {task.estimatedHours}h estimated
                                  </span>
                                )}
                                {task?.difficulty && (
                                  <Badge variant="outline" className="text-xs">
                                    {task.difficulty}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}

                  {(weeklyAssignments[activeWeekTab] || []).length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border">
                      <Clock className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-muted-foreground">No tasks in this week</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No curriculum assigned</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This buddy doesn't have a curriculum assigned yet.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Details Tab Content */}
          <TabsContent value="details" className="mt-0">
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Buddy Information</CardTitle>
                  {(isManager || isMentor || (isBuddy && isOwnProfile)) && (
                    <Button onClick={() => setIsEditModalOpen(true)} variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="mt-1 font-medium">{buddy.user?.name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="mt-1 font-medium">{buddy.user?.email || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Domain Role</label>
                    <p className="mt-1 font-medium capitalize">{buddy.user?.domainRole || buddy.domainRole || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <p className="mt-1">
                      <Badge className={`${
                        buddy.status === 'active' ? 'bg-green-100 text-green-800' :
                        buddy.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {buddy.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assigned Mentor</label>
                    <p className="mt-1 font-medium">{buddy.mentor?.user?.name || buddy.mentorName || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                    <p className="mt-1 font-medium">
                      {buddy.joinDate ? new Date(buddy.joinDate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>

                {curriculumData?.curriculum && (
                  <div className="pt-4 border-t">
                    <label className="text-sm font-medium text-muted-foreground">Assigned Curriculum</label>
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        {curriculumData.curriculum.name}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {curriculumData.curriculum.totalWeeks} weeks • {curriculumData.totalTasks || 0} tasks
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Buddy Modal */}
        {buddy && (
          <EditBuddyModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            buddy={buddy}
          />
        )}
      </div>
    </div>
  );
}
