import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useGetTaskAssignmentQuery,
  useStartTaskAssignmentMutation,
  useSubmitTaskAssignmentMutation,
  useGetTaskAssignmentSubmissionsQuery,
  useGetSubmissionFeedbackQuery,
} from '@/api/submissionApi';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Play, Send, Plus, Trash2, CheckCircle, Clock, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const submissionSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  notes: z.string().optional(),
  resources: z.array(z.object({
    type: z.string().min(1, 'Type is required'),
    label: z.string().min(1, 'Label is required'),
    url: z.string().url('Must be a valid URL'),
  })).min(1, 'At least one resource is required'),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

export default function TaskDetail() {
  const [, params] = useRoute('/buddy/task/:assignmentId');
  const assignmentId = params?.assignmentId;

  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const { data: taskData, isLoading, isError } = useGetTaskAssignmentQuery(assignmentId || '', {
    skip: !assignmentId,
  });

  const { data: submissions = [] } = useGetTaskAssignmentSubmissionsQuery(assignmentId || '', {
    skip: !assignmentId,
  });

  const [startTask, { isLoading: starting }] = useStartTaskAssignmentMutation();
  const [submitTask, { isLoading: submitting }] = useSubmitTaskAssignmentMutation();

  const { toast } = useToast();

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      description: '',
      notes: '',
      resources: [{ type: 'github', label: 'Source Code', url: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'resources',
  });

  const handleStart = async () => {
    try {
      await startTask(assignmentId!).unwrap();
      toast({ title: 'Success', description: 'Task started!' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start task',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: SubmissionFormData) => {
    try {
      await submitTask({ id: assignmentId!, data }).unwrap();
      toast({ title: 'Success', description: 'Task submitted successfully!' });
      setShowSubmissionForm(false);
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit task',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <p>Loading task details...</p>
        </div>
      </Layout>
    );
  }

  if (isError || !taskData) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="text-center py-10">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Task Not Found</h3>
              <p className="text-gray-600">The task you're looking for doesn't exist or you don't have access to it.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const { assignment, taskTemplate } = taskData;
  const latestSubmission = submissions[0];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      completed: { className: 'bg-green-500', label: 'Completed', icon: CheckCircle },
      submitted: { className: 'bg-blue-500', label: 'Submitted', icon: Send },
      under_review: { className: 'bg-blue-500', label: 'Under Review', icon: Clock },
      needs_revision: { className: 'bg-yellow-500', label: 'Needs Revision', icon: AlertCircle },
      in_progress: { className: 'bg-orange-500', label: 'In Progress', icon: Clock },
      not_started: { variant: 'outline', label: 'Not Started', icon: FileText },
    };

    const config = variants[assignment.status] || variants.not_started;
    const Icon = config.icon;

    return (
      <Badge {...config}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link href="/buddy/dashboard">
              <Button variant="ghost" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{taskTemplate?.title || 'Task Details'}</h1>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(assignment.status)}
                {taskTemplate?.difficulty && (
                  <Badge variant="outline">{taskTemplate.difficulty}</Badge>
                )}
                {taskTemplate?.estimatedHours && (
                  <Badge variant="outline">{taskTemplate.estimatedHours}h</Badge>
                )}
              </div>
            </div>
          </div>

          {assignment.status === 'not_started' && (
            <Button onClick={handleStart} disabled={starting}>
              <Play className="h-4 w-4 mr-2" />
              {starting ? 'Starting...' : 'Start Task'}
            </Button>
          )}

          {(assignment.status === 'in_progress' || assignment.status === 'needs_revision') && (
            <Button onClick={() => setShowSubmissionForm(!showSubmissionForm)}>
              <Send className="h-4 w-4 mr-2" />
              {showSubmissionForm ? 'Cancel Submission' : 'Submit Work'}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="submissions">
                  Submissions {submissions.length > 0 && `(${submissions.length})`}
                </TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Task Description</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: taskTemplate?.description?.replace(/\n/g, '<br/>') || 'No description provided.',
                      }}
                    />

                    {taskTemplate?.requirements && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-2">Requirements</h4>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: taskTemplate.requirements.replace(/\n/g, '<br/>'),
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Submission Form */}
                {showSubmissionForm && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Submit Your Work</CardTitle>
                      <CardDescription>
                        Provide a description and links to your work
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Explain what you built and how..."
                                    className="min-h-[120px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Notes (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Any challenges or questions..."
                                    className="min-h-[80px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <FormLabel>Resources</FormLabel>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ type: 'hosted_url', label: '', url: '' })}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Resource
                              </Button>
                            </div>

                            {fields.map((field, index) => (
                              <Card key={field.id} className="p-4">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-sm">Resource {index + 1}</h4>
                                    {fields.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => remove(index)}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    )}
                                  </div>

                                  <FormField
                                    control={form.control}
                                    name={`resources.${index}.type`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="github">GitHub Repository</SelectItem>
                                            <SelectItem value="hosted_url">Live Website</SelectItem>
                                            <SelectItem value="pdf">PDF Document</SelectItem>
                                            <SelectItem value="postman">Postman Collection</SelectItem>
                                            <SelectItem value="figma">Figma Design</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name={`resources.${index}.label`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Label</FormLabel>
                                        <FormControl>
                                          <Input placeholder="e.g., Source Code, Live Demo" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name={`resources.${index}.url`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>URL</FormLabel>
                                        <FormControl>
                                          <Input placeholder="https://..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </Card>
                            ))}
                          </div>

                          <Button type="submit" disabled={submitting} className="w-full">
                            <Send className="h-4 w-4 mr-2" />
                            {submitting ? 'Submitting...' : 'Submit for Review'}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="submissions" className="mt-4">
                {submissions.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-10">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No submissions yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission: any) => (
                      <Card key={submission.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">Version {submission.version}</CardTitle>
                              <CardDescription>
                                Submitted {new Date(submission.submittedAt).toLocaleString()}
                              </CardDescription>
                            </div>
                            <Badge
                              className={
                                submission.reviewStatus === 'approved'
                                  ? 'bg-green-500'
                                  : submission.reviewStatus === 'needs_revision'
                                  ? 'bg-yellow-500'
                                  : 'bg-blue-500'
                              }
                            >
                              {submission.reviewStatus}
                            </Badge>
                          </div>
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
                              <h4 className="font-semibold mb-2">Resources</h4>
                              <div className="space-y-2">
                                {submission.resources.map((resource: any) => (
                                  <div key={resource.id} className="flex items-center gap-2">
                                    <Badge variant="outline">{resource.type}</Badge>
                                    <span className="text-sm">{resource.label}:</span>
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-500 hover:underline"
                                    >
                                      {resource.url}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {submission.feedback && submission.feedback.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Feedback</h4>
                              <div className="space-y-2">
                                {submission.feedback.map((fb: any) => (
                                  <div key={fb.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                                    <p className="text-sm font-medium mb-1">{fb.authorRole}</p>
                                    <p className="text-sm">{fb.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(fb.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="resources" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {taskTemplate?.resources && taskTemplate.resources.length > 0 ? (
                      <ul className="space-y-2">
                        {taskTemplate.resources.map((resource: any, idx: number) => (
                          <li key={idx}>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {resource.title || resource.url}
                            </a>
                            {resource.type && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {resource.type}
                              </Badge>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No learning resources provided</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Task Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{getStatusBadge(assignment.status)}</p>
                </div>

                {assignment.dueDate && (
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                  </div>
                )}

                {assignment.submissionCount > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Submissions</p>
                    <p className="font-medium">{assignment.submissionCount}</p>
                  </div>
                )}

                {assignment.completedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="font-medium">{new Date(assignment.completedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {taskTemplate?.expectedResourceTypes && taskTemplate.expectedResourceTypes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Expected Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {taskTemplate.expectedResourceTypes.map((rt: any, idx: number) => (
                      <li key={idx} className="text-sm flex items-center gap-2">
                        <Badge variant="outline">{rt.type}</Badge>
                        {rt.label}
                        {rt.required && <span className="text-red-500">*</span>}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
