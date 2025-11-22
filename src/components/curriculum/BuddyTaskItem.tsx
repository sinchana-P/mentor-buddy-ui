/**
 * Buddy Task Item
 * Display a task assignment in the buddy's task list
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TaskAssignment } from '@/types/curriculum';
import { CheckCircle2, Clock, AlertCircle, Eye, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';

interface BuddyTaskItemProps {
  assignment: TaskAssignment;
  onClick: () => void;
}

export default function BuddyTaskItem({ assignment, onClick }: BuddyTaskItemProps) {
  const getStatusIcon = () => {
    switch (assignment.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'under_review':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'needs_revision':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <PlayCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      not_started: { color: 'secondary', label: 'Not Started' },
      in_progress: { color: 'default', label: 'In Progress' },
      submitted: { color: 'default', label: 'Submitted' },
      under_review: { color: 'default', label: 'Under Review' },
      needs_revision: { color: 'destructive', label: 'Needs Revision' },
      completed: { color: 'default', label: 'Completed' },
    };

    const config = statusConfig[assignment.status] || statusConfig.not_started;

    return (
      <Badge variant={config.color as 'secondary' | 'default' | 'destructive'}>
        {config.label}
      </Badge>
    );
  };

  const getDifficultyBadge = () => {
    if (!assignment.taskTemplate) return null;

    const colors = {
      easy: 'bg-green-500/10 text-green-500 border-green-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      hard: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    return (
      <Badge
        variant="outline"
        className={colors[assignment.taskTemplate.difficulty]}
      >
        {assignment.taskTemplate.difficulty}
      </Badge>
    );
  };

  const getActionButton = () => {
    switch (assignment.status) {
      case 'not_started':
        return (
          <Button size="sm">
            <PlayCircle className="h-4 w-4 mr-1" />
            Start
          </Button>
        );
      case 'completed':
        return (
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        );
      case 'needs_revision':
        return (
          <Button size="sm" variant="destructive">
            <AlertCircle className="h-4 w-4 mr-1" />
            Revise
          </Button>
        );
      default:
        return (
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4 mr-1" />
            Continue
          </Button>
        );
    }
  };

  return (
    <div
      className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {getStatusIcon()}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h4 className="font-medium">{assignment.taskTemplate?.title}</h4>
          {getDifficultyBadge()}
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
          {assignment.taskTemplate?.estimatedHours && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{assignment.taskTemplate.estimatedHours}h</span>
            </div>
          )}

          {assignment.dueDate && (
            <span>Due: {format(new Date(assignment.dueDate), 'MMM d')}</span>
          )}

          {assignment.submissionCount > 0 && (
            <span>{assignment.submissionCount} submission(s)</span>
          )}

          {assignment.latestSubmission?.feedback && assignment.latestSubmission.feedback.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {assignment.latestSubmission.feedback.length} comment(s)
            </Badge>
          )}
        </div>
      </div>

      {getActionButton()}
    </div>
  );
}
