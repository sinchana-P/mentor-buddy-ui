import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useGetSubmissionQuery,
  useApproveSubmissionMutation,
  useRequestRevisionMutation,
  useRejectSubmissionMutation,
} from '@/api/submissionApi';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, ExternalLink, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import FeedbackThread from '@/components/FeedbackThread';

const approvalSchema = z.object({
  grade: z.string().optional(),
});

const revisionSchema = z.object({
  message: z.string().min(10, 'Please provide detailed feedback'),
});

type ApprovalFormData = z.infer<typeof approvalSchema>;
type RevisionFormData = z.infer<typeof revisionSchema>;

export default function SubmissionReview() {
  const [, params] = useRoute('/mentor/review/:submissionId');
  const submissionId = params?.submissionId;

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const { data: submission, isLoading, isError } = useGetSubmissionQuery(submissionId || '', {
    skip: !submissionId,
  });

  const [approveSubmission, { isLoading: approving }] = useApproveSubmissionMutation();
  const [requestRevision, { isLoading: requesting }] = useRequestRevisionMutation();
  const [rejectSubmission, { isLoading: rejecting }] = useRejectSubmissionMutation();

  const { toast } = useToast();

  const approvalForm = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
    defaultValues: { grade: '' },
  });

  const revisionForm = useForm<RevisionFormData>({
    resolver: zodResolver(revisionSchema),
    defaultValues: { message: '' },
  });

  const onApprove = async (data: ApprovalFormData) => {
    try {
      await approveSubmission({ id: submissionId!, grade: data.grade }).unwrap();
      toast({ title: 'Success', description: 'Submission approved!' });
      setApproveDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve submission', variant: 'destructive' });
    }
  };

  const onRequestRevision = async (data: RevisionFormData) => {
    try {
      await requestRevision({ id: submissionId!, message: data.message }).unwrap();
      toast({ title: 'Success', description: 'Revision requested' });
      setRevisionDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to request revision', variant: 'destructive' });
    }
  };

  const onReject = async (data: RevisionFormData) => {
    try {
      await rejectSubmission({ id: submissionId!, message: data.message }).unwrap();
      toast({ title: 'Success', description: 'Submission rejected' });
      setRejectDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reject submission', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="w-full px-6 py-6">
          <p>Loading submission...</p>
        </div>
      </Layout>
    );
  }

  if (isError || !submission) {
    return (
      <Layout>
        <div className="w-full px-6 py-6">
          <Card>
            <CardContent className="text-center py-10">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Submission Not Found</h3>
              <p className="text-gray-600">The submission you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link href="/mentor/review-queue">
              <Button variant="ghost" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Queue
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Review Submission</h1>
              <p className="text-gray-600">Version {submission.version}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {submission.reviewStatus === 'pending' || submission.reviewStatus === 'under_review' ? (
              <>
                <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approve Submission</DialogTitle>
                      <DialogDescription>
                        This will mark the task as completed for the buddy.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...approvalForm}>
                      <form onSubmit={approvalForm.handleSubmit(onApprove)} className="space-y-4">
                        <FormField
                          control={approvalForm.control}
                          name="grade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Grade (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Pass, A, 85%" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setApproveDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={approving}>
                            {approving ? 'Approving...' : 'Approve'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Request Revision
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Revision</DialogTitle>
                      <DialogDescription>
                        Provide feedback on what needs to be improved.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...revisionForm}>
                      <form onSubmit={revisionForm.handleSubmit(onRequestRevision)} className="space-y-4">
                        <FormField
                          control={revisionForm.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Feedback</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Please provide detailed feedback..."
                                  className="min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setRevisionDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={requesting}>
                            {requesting ? 'Requesting...' : 'Request Revision'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reject Submission</DialogTitle>
                      <DialogDescription>
                        This will reset the task status. Provide a reason for rejection.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...revisionForm}>
                      <form onSubmit={revisionForm.handleSubmit(onReject)} className="space-y-4">
                        <FormField
                          control={revisionForm.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reason for Rejection</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Explain why this is being rejected..."
                                  className="min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" variant="destructive" disabled={rejecting}>
                            {rejecting ? 'Rejecting...' : 'Reject'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <Badge
                className={
                  submission.reviewStatus === 'approved'
                    ? 'bg-green-500'
                    : submission.reviewStatus === 'needs_revision'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }
              >
                {submission.reviewStatus}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
                <CardDescription>
                  Submitted {new Date(submission.submittedAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{submission.description}</p>
                </div>

                {submission.notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{submission.notes}</p>
                  </div>
                )}

                {submission.resources && submission.resources.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Submitted Resources</h4>
                    <div className="space-y-2">
                      {submission.resources.map((resource: any) => (
                        <div key={resource.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{resource.label}</p>
                            <Badge variant="outline" className="mt-1 text-xs">{resource.type}</Badge>
                          </div>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline flex items-center gap-1"
                          >
                            Open <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Discussion Thread */}
            <Card>
              <CardHeader>
                <CardTitle>Discussion</CardTitle>
                <CardDescription>
                  Comment on the submission and communicate with the buddy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeedbackThread submissionId={submissionId!} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Submission Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Status</p>
                  <Badge className="mt-1">{submission.reviewStatus}</Badge>
                </div>
                <div>
                  <p className="text-gray-500">Version</p>
                  <p className="font-medium">{submission.version}</p>
                </div>
                {submission.reviewedBy && (
                  <div>
                    <p className="text-gray-500">Reviewed By</p>
                    <p className="font-medium">Mentor</p>
                  </div>
                )}
                {submission.reviewedAt && (
                  <div>
                    <p className="text-gray-500">Reviewed At</p>
                    <p className="font-medium">{new Date(submission.reviewedAt).toLocaleString()}</p>
                  </div>
                )}
                {submission.grade && (
                  <div>
                    <p className="text-gray-500">Grade</p>
                    <p className="font-medium">{submission.grade}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
