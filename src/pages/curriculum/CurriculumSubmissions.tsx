/**
 * Curriculum Submissions Overview
 * For Managers & Mentors to view all buddy submissions across a curriculum
 */

import { useState, useMemo } from 'react';
import { useParams, Link } from 'wouter';
import {
  useGetCurriculumSubmissionsQuery,
  useGetCurriculumByIdQuery,
  type WeekWithSubmissions,
  type TaskWithSubmissions,
  type BuddySubmission,
} from '@/api/curriculumManagementApi';
import {
  useGetSubmissionFeedbackQuery,
  useAddFeedbackMutation,
  useApproveSubmissionMutation,
  useRequestRevisionMutation,
} from '@/api/submissionApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  Users,
  MessageSquare,
  ExternalLink,
  AlertCircle,
  Send,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CurriculumSubmissions() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [activeWeek, setActiveWeek] = useState(1);
  const [selectedTask, setSelectedTask] = useState<TaskWithSubmissions | null>(null);
  const [selectedBuddy, setSelectedBuddy] = useState<BuddySubmission | null>(null);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');

  // API
  const { data: curriculum } = useGetCurriculumByIdQuery(id || '');
  const { data: submissionsData, isLoading } = useGetCurriculumSubmissionsQuery(id || '', {
    skip: !id,
  });

  const [addFeedback] = useAddFeedbackMutation();
  const [approveSubmission] = useApproveSubmissionMutation();
  const [requestRevision] = useRequestRevisionMutation();

  // Get week data
  const weeks = useMemo(() => submissionsData?.weeks || [], [submissionsData]);
  const currentWeek = useMemo(
    () => weeks.find((w) => w.week.weekNumber === activeWeek),
    [weeks, activeWeek]
  );

  // Initialize active week when data loads
  useMemo(() => {
    if (weeks.length > 0 && !weeks.find((w) => w.week.weekNumber === activeWeek)) {
      setActiveWeek(weeks[0].week.weekNumber);
    }
  }, [weeks, activeWeek]);

  const handleViewSubmission = (task: TaskWithSubmissions, buddy: BuddySubmission) => {
    setSelectedTask(task);
    setSelectedBuddy(buddy);
    setSubmissionDialogOpen(true);
  };

  const handleAddComment = async () => {
    if (!selectedBuddy?.latestSubmission || !newComment.trim()) {
      return;
    }

    try {
      await addFeedback({
        submissionId: selectedBuddy.latestSubmission.id,
        data: {
          message: newComment,
          feedbackType: 'comment',
        },
      }).unwrap();

      toast({
        title: 'Comment added',
        description: 'Your comment has been posted.',
      });
      setNewComment('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment.',
        variant: 'destructive',
      });
    }
  };

  const handleApprove = async () => {
    if (!selectedBuddy?.latestSubmission) return;

    try {
      await approveSubmission({
        id: selectedBuddy.latestSubmission.id,
      }).unwrap();

      toast({
        title: 'Submission approved',
        description: 'The submission has been approved.',
      });
      setSubmissionDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve submission.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: { className: 'bg-green-500 text-white', label: 'Completed' },
      approved: { className: 'bg-green-500 text-white', label: 'Approved' },
      submitted: { className: 'bg-blue-500 text-white', label: 'Submitted' },
      under_review: { className: 'bg-blue-500 text-white', label: 'Under Review' },
      needs_revision: { className: 'bg-yellow-500 text-white', label: 'Needs Revision' },
      in_progress: { className: 'bg-orange-500 text-white', label: 'In Progress' },
      not_started: { variant: 'outline', label: 'Not Started' },
    };

    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge {...config}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!submissionsData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="py-16 text-center">
              <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No data found</h3>
              <p className="text-muted-foreground mb-6">
                Unable to load submission data for this curriculum.
              </p>
              <Link href="/curriculum-management">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Curriculum Management
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/curriculum-management">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Curriculum Submissions</h1>
            <p className="text-muted-foreground mt-1">{curriculum?.name}</p>
          </div>
        </div>

        {/* Week Tabs */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="bg-gray-100 dark:bg-slate-800/50 rounded-xl p-1 inline-flex gap-1 flex-wrap">
              {weeks.map((weekData) => {
                const completionRate =
                  weekData.tasks.reduce((sum, t) => sum + t.completedCount, 0) /
                  Math.max(
                    weekData.tasks.reduce((sum, t) => sum + t.totalBuddies, 0),
                    1
                  );

                return (
                  <button
                    key={weekData.week.weekNumber}
                    onClick={() => setActiveWeek(weekData.week.weekNumber)}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeWeek === weekData.week.weekNumber
                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      Week {weekData.week.weekNumber}
                      {completionRate === 1 && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Week Details */}
        {currentWeek && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentWeek.week.title}</CardTitle>
                {currentWeek.week.description && (
                  <CardDescription>{currentWeek.week.description}</CardDescription>
                )}
              </CardHeader>
            </Card>

            {/* Tasks */}
            {currentWeek.tasks.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No tasks in this week</p>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {currentWeek.tasks.map((task, idx) => {
                  const completionPercentage = task.totalBuddies
                    ? Math.round((task.completedCount / task.totalBuddies) * 100)
                    : 0;

                  return (
                    <AccordionItem key={task.taskTemplate.id} value={`task-${idx}`} asChild>
                      <Card>
                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex-1 text-left">
                              <h3 className="font-semibold text-lg mb-2">
                                {task.taskTemplate.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>
                                    {task.totalBuddies} buddies assigned
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  <span>
                                    {task.submittedCount} submitted
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>
                                    {task.completedCount} completed
                                  </span>
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <Progress value={completionPercentage} className="h-2 flex-1" />
                                  <span className="text-sm font-medium">
                                    {completionPercentage}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <div className="space-y-3 mt-4">
                            {task.buddySubmissions.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                No submissions yet
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {task.buddySubmissions.map((buddySub) => (
                                  <Card
                                    key={buddySub.buddy?.id || buddySub.assignment.id}
                                    className="hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => handleViewSubmission(task, buddySub)}
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-start gap-3">
                                        <Avatar className="h-10 w-10">
                                          <AvatarFallback>
                                            {buddySub.buddy?.name
                                              .split(' ')
                                              .map((n) => n[0])
                                              .join('')
                                              .toUpperCase() || 'B'}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium truncate">
                                            {buddySub.buddy?.name || 'Unknown'}
                                          </p>
                                          <p className="text-xs text-muted-foreground truncate">
                                            {buddySub.buddy?.email}
                                          </p>
                                          <div className="mt-2 space-y-1">
                                            {getStatusBadge(buddySub.assignment.status)}
                                            {buddySub.submissions.length > 0 && (
                                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                <FileText className="h-3 w-3" />
                                                {buddySub.submissions.length} submission
                                                {buddySub.submissions.length !== 1 ? 's' : ''}
                                                {buddySub.latestSubmission?.feedbackCount > 0 && (
                                                  <>
                                                    <MessageSquare className="h-3 w-3 ml-1" />
                                                    {buddySub.latestSubmission.feedbackCount}
                                                  </>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </div>
        )}
      </div>

      {/* Submission Details Dialog */}
      <SubmissionDetailsDialog
        open={submissionDialogOpen}
        onOpenChange={setSubmissionDialogOpen}
        task={selectedTask}
        buddySubmission={selectedBuddy}
        newComment={newComment}
        setNewComment={setNewComment}
        onAddComment={handleAddComment}
        onApprove={handleApprove}
        getStatusBadge={getStatusBadge}
      />
    </div>
  );
}

// Submission Details Dialog Component
function SubmissionDetailsDialog({
  open,
  onOpenChange,
  task,
  buddySubmission,
  newComment,
  setNewComment,
  onAddComment,
  onApprove,
  getStatusBadge,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskWithSubmissions | null;
  buddySubmission: BuddySubmission | null;
  newComment: string;
  setNewComment: (value: string) => void;
  onAddComment: () => void;
  onApprove: () => void;
  getStatusBadge: (status: string) => JSX.Element;
}) {
  const latestSubmission = buddySubmission?.latestSubmission;
  const { data: feedback = [] } = useGetSubmissionFeedbackQuery(latestSubmission?.id || '', {
    skip: !latestSubmission,
  });

  if (!task || !buddySubmission || !latestSubmission) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task.taskTemplate.title}</DialogTitle>
          <DialogDescription>
            Submission by {buddySubmission.buddy?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submission Info */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {buddySubmission.buddy?.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase() || 'B'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{buddySubmission.buddy?.name}</p>
                    <p className="text-sm text-muted-foreground">{buddySubmission.buddy?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>v{latestSubmission.version}</Badge>
                  {getStatusBadge(latestSubmission.reviewStatus)}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm whitespace-pre-wrap">{latestSubmission.description}</p>
              </div>

              {latestSubmission.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {latestSubmission.notes}
                  </p>
                </div>
              )}

              {/* Resources */}
              {latestSubmission.resources && latestSubmission.resources.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Submitted Resources</h4>
                  <div className="space-y-2">
                    {latestSubmission.resources.map((resource: any, idx: number) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {resource.label || resource.type || 'Resource'}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Submitted {formatDistanceToNow(new Date(latestSubmission.submittedAt), { addSuffix: true })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discussion Thread */}
          {feedback.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Discussion ({feedback.length})</h4>
              <div className="space-y-3">
                {feedback.map((fb: any) => (
                  <div key={fb.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {fb.authorRole === 'buddy' ? 'B' : fb.authorRole === 'mentor' ? 'M' : 'MG'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium capitalize">{fb.authorRole}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(fb.createdAt), { addSuffix: true })}
                        </span>
                        {fb.feedbackType !== 'comment' && (
                          <Badge variant="outline" className="text-xs">
                            {fb.feedbackType.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{fb.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Comment */}
          <div className="space-y-3">
            <h4 className="font-medium">Add Comment</h4>
            <Textarea
              placeholder="Write your feedback..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {latestSubmission.reviewStatus !== 'approved' && (
                  <Button onClick={onApprove} variant="default">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                )}
              </div>
              <Button onClick={onAddComment} disabled={!newComment.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
