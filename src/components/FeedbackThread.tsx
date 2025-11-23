import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAddFeedbackMutation, useGetSubmissionFeedbackQuery } from '@/api/submissionApi';
import type { Feedback } from '@/api/submissionApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Reply, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FeedbackThreadProps {
  submissionId: string;
  readOnly?: boolean;
}

export default function FeedbackThread({ submissionId, readOnly = false }: FeedbackThreadProps) {
  const user = useSelector((state: any) => state.auth.user);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const { toast } = useToast();

  const { data: feedbackList = [], isLoading, refetch } = useGetSubmissionFeedbackQuery(submissionId);
  const [addFeedback, { isLoading: adding }] = useAddFeedbackMutation();

  // Organize feedback into threads
  const organizeThreads = (feedback: Feedback[]) => {
    const topLevel: Feedback[] = [];
    const replies: Record<string, Feedback[]> = {};

    feedback.forEach((fb) => {
      if (fb.parentFeedbackId) {
        if (!replies[fb.parentFeedbackId]) {
          replies[fb.parentFeedbackId] = [];
        }
        replies[fb.parentFeedbackId].push(fb);
      } else {
        topLevel.push(fb);
      }
    });

    return { topLevel, replies };
  };

  const { topLevel, replies } = organizeThreads(feedbackList);

  const handleSubmit = async (parentId?: string) => {
    const message = parentId ? replyMessage : newMessage;
    if (!message.trim()) return;

    try {
      await addFeedback({
        submissionId,
        data: {
          message: message.trim(),
          feedbackType: parentId ? 'reply' : 'comment',
          parentFeedbackId: parentId,
        },
      }).unwrap();

      toast({ title: 'Success', description: 'Comment added' });
      if (parentId) {
        setReplyMessage('');
        setReplyingTo(null);
      } else {
        setNewMessage('');
      }
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    }
  };

  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'approval':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'revision_request':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
  };

  const getFeedbackTypeBadge = (type: string) => {
    const config: Record<string, { className: string; label: string }> = {
      comment: { className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', label: 'Comment' },
      question: { className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', label: 'Question' },
      approval: { className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', label: 'Approved' },
      revision_request: { className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', label: 'Revision Requested' },
      reply: { className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', label: 'Reply' },
    };
    const c = config[type] || config.comment;
    return <Badge className={cn('text-xs', c.className)}>{c.label}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { className: string; label: string }> = {
      mentor: { className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', label: 'Mentor' },
      buddy: { className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300', label: 'Buddy' },
      manager: { className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300', label: 'Manager' },
    };
    const c = config[role] || config.buddy;
    return <Badge className={cn('text-xs', c.className)}>{c.label}</Badge>;
  };

  const renderFeedbackItem = (fb: Feedback, isReply: boolean = false) => (
    <div
      key={fb.id}
      className={cn(
        'p-4 rounded-lg',
        isReply ? 'ml-8 bg-muted/30 border-l-2 border-muted' : 'bg-card border'
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {fb.authorRole === 'mentor' ? 'M' : fb.authorRole === 'manager' ? 'A' : 'B'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {getRoleBadge(fb.authorRole)}
            {!isReply && getFeedbackTypeBadge(fb.feedbackType)}
            <span className="text-xs text-muted-foreground">
              {new Date(fb.createdAt).toLocaleString()}
            </span>
          </div>

          <p className="text-sm whitespace-pre-wrap">{fb.message}</p>

          {!readOnly && !isReply && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => setReplyingTo(replyingTo === fb.id ? null : fb.id)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
        </div>
      </div>

      {/* Reply form */}
      {replyingTo === fb.id && (
        <div className="mt-3 ml-11">
          <Textarea
            placeholder="Write a reply..."
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              onClick={() => handleSubmit(fb.id)}
              disabled={adding || !replyMessage.trim()}
            >
              <Send className="h-3 w-3 mr-1" />
              Reply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setReplyingTo(null);
                setReplyMessage('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Nested replies */}
      {replies[fb.id] && replies[fb.id].length > 0 && (
        <div className="mt-3 space-y-2">
          {replies[fb.id].map((reply) => renderFeedbackItem(reply, true))}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Comments header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-semibold">Discussion</h3>
        <span className="text-sm text-muted-foreground">({feedbackList.length} comments)</span>
      </div>

      {/* New comment form */}
      {!readOnly && (
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment or ask a question..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={() => handleSubmit()}
                  disabled={adding || !newMessage.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments list */}
      {topLevel.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No comments yet</p>
          {!readOnly && <p className="text-sm">Be the first to start the discussion!</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {topLevel.map((fb) => renderFeedbackItem(fb))}
        </div>
      )}
    </div>
  );
}
