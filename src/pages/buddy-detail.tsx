import { useState } from 'react';
import { useParams } from 'wouter';
import { useSelector } from 'react-redux';
import {
  useGetBuddiesQuery,
  useGetTasksQuery,
  useGetBuddyTopicsQuery,
  useUpdateBuddyTopicMutation,
  useGetBuddyPortfolioQuery,
  useUpdateTaskMutation,
} from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, CheckCircle, Clock, GitBranch, Globe, Edit, Plus, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { BuddyRO, TaskRO } from '@/api/dto';
import type { RootState } from '@/store';
import EditBuddyModal from '@/components/EditBuddyModal';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  buddyId: z.string().min(1, 'Please select a buddy'),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function BuddyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('tasks');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const { toast } = useToast();

  // Get current user from Redux to check roles
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const isMentor = currentUser?.role === 'mentor' || currentUser?.role === 'manager';

  console.log('[BuddyDetail] Current user:', currentUser);
  console.log('[BuddyDetail] isMentor:', isMentor);

  // Fetch buddy data
  const { data: buddies = [], isLoading } = useGetBuddiesQuery({});
  const buddy = buddies.find((b: BuddyRO) => b.id === id);

  // Fetch tasks
  const { data: allTasks = [] } = useGetTasksQuery({ buddyId: id });
  const buddyTasks = Array.isArray(allTasks) ? allTasks.filter((task: TaskRO) => task.buddyId === id) : [];

  // ✅ Fetch REAL buddy topics from API (new system)
  const { data: progressData, isLoading: isLoadingProgress, refetch: refetchProgress } = useGetBuddyTopicsQuery(id || '', {
    skip: !id,
  });

  // ✅ Progress update mutation (new system)
  const [updateProgress, { isLoading: isUpdatingProgress }] = useUpdateBuddyTopicMutation();

  // Task mutations
  const [updateTaskTrigger, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();

  // Task edit form
  const editTaskForm = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      buddyId: '',
      dueDate: '',
    },
  });

  // ✅ Fetch REAL Portfolio data from API
  const { data: portfolioData, isLoading: isLoadingPortfolio } = useGetBuddyPortfolioQuery(id || '', {
    skip: !id,
  });

  // ✅ Handle Progress Update (Mentor-only) - Using new buddy topics system
  const handleProgressUpdate = async (topicId: string, checked: boolean) => {
    if (!isMentor) {
      toast({
        title: 'Permission Denied',
        description: 'Only mentors can update progress',
        variant: 'destructive'
      });
      return;
    }

    try {
      await updateProgress({
        topicId,
        checked
      }).unwrap();

      toast({
        title: 'Success',
        description: 'Progress updated successfully!'
      });

      // Force refetch to update UI immediately
      refetchProgress();
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update progress. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Handle editing a task
  const handleEditTask = (task: TaskRO) => {
    setEditingTaskId(task.id);
    editTaskForm.reset({
      title: task.title,
      description: task.description,
      buddyId: task.buddyId,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
    });
  };

  // Handle edit form submission
  const onEditTaskSubmit = async (data: TaskFormData) => {
    if (editingTaskId) {
      try {
        await updateTaskTrigger({
          id: editingTaskId,
          ...data,
        }).unwrap();
        setEditingTaskId(null);
        editTaskForm.reset();
        toast({
          title: 'Success',
          description: 'Task updated successfully!'
        });
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to update task. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  // Handle updating task status
  const handleStatusChange = async (taskId: string, currentTask: TaskRO, newStatus: string) => {
    try {
      await updateTaskTrigger({
        id: taskId,
        data: {
          status: newStatus,
        }
      }).unwrap();
      toast({
        title: 'Success',
        description: 'Task status updated successfully!'
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update task status. Please try again.',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
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
      <div className="min-h-screen bg-background">
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buddy not found</h1>
          <Link href="/buddies">
            <Button className="mt-4">Back to Buddies</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate progress percentage from real data (buddy topics system)
  const topics = progressData?.topics || [];
  const progressPercentage = progressData?.percentage || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="mb-6">
          <Link href="/buddies">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Buddies
            </Button>
          </Link>

          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={buddy.user?.avatarUrl} />
              <AvatarFallback className="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200 text-2xl">
                {buddy.user?.name?.split(' ').map(n => n[0]).join('') || 'B'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{buddy.user?.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{buddy.user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${buddy.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  buddy.status === 'inactive' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                  {buddy.status}
                </Badge>
                <Badge variant="outline">{buddy.domainRole}</Badge>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          {/* TASKS TAB - Already working */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="grid gap-4">
              {buddyTasks.map((task: TaskRO) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Select
                          value={task.status || 'pending'}
                          onValueChange={(newStatus) => handleStatusChange(task.id, task, newStatus)}
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditTask(task)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{task.description}</p>

                    {task.dueDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}

                    {task.submissionCount > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Submissions:</h4>
                        <div key="submissions">
                          <p className="text-sm text-muted-foreground">Submissions: {task.submissionCount}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {buddyTasks.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Tasks will appear here when assigned by a mentor</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ✅ PROGRESS TAB - NOW WITH REAL API DATA */}
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Technical Progress</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track learning milestones and skill development
                  {!isMentor && <span className="ml-2 text-yellow-600">(Read-only - Only mentors can update)</span>}
                </p>
              </CardHeader>
              <CardContent>
                {isLoadingProgress ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">Loading progress...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {progressPercentage}%
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>

                    <div className="space-y-3">
                      {topics.map((topic: any) => (
                        <div key={topic.id} className="flex items-center space-x-3">
                          <Checkbox
                            checked={topic.checked}
                            onCheckedChange={(checked) => handleProgressUpdate(topic.id, checked as boolean)}
                            disabled={!isMentor || isUpdatingProgress}
                          />
                          <span className={`flex-1 ${topic.checked ? 'line-through text-gray-500' : ''}`}>
                            {topic.topicName}
                          </span>
                          {topic.checked && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>

                    {topics.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">No progress topics available</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ✅ PORTFOLIO TAB - NOW WITH REAL API DATA */}
          <TabsContent value="portfolio" className="space-y-4">
            {isLoadingPortfolio ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">Loading portfolio...</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {portfolioData && portfolioData.length > 0 ? (
                  portfolioData.map((project: any) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle>{project.title}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {project.completedAt ? `Completed on ${new Date(project.completedAt).toLocaleDateString()}` : 'In Progress'}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>

                        <div className="flex gap-4 mb-4">
                          {project.url && (
                            <a href={project.url} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-2 text-blue-600 hover:underline">
                              <GitBranch className="h-4 w-4" />
                              Code
                            </a>
                          )}
                          {project.deployedUrl && (
                            <a href={project.deployedUrl} target="_blank" rel="noopener noreferrer"
                               className="flex items-center gap-2 text-blue-600 hover:underline">
                              <Globe className="h-4 w-4" />
                              Live Demo
                            </a>
                          )}
                        </div>

                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map((tech: string) => (
                              <Badge key={tech} variant="outline">{tech}</Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Portfolio projects will appear here
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ✅ DETAILS TAB - NOW WITH EDIT BUTTON */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Buddy Information</CardTitle>
                  {isMentor && (
                    <Button onClick={() => setIsEditModalOpen(true)} variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <Input value={buddy.user?.name || ''} readOnly />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <Input value={buddy.user?.email || ''} readOnly />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Domain Role</label>
                  <Input value={buddy.domainRole || ''} readOnly />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <Input value={buddy.status || ''} readOnly />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned Mentor</label>
                  <Input value={buddy?.mentorName || 'Not assigned'} readOnly />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                  <Input value={buddy.joinDate ? new Date(buddy.joinDate).toLocaleDateString() : ''} readOnly />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ✅ Edit Buddy Modal */}
        {buddy && (
          <EditBuddyModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            buddy={buddy}
          />
        )}

        {/* Edit Task Modal */}
        <Dialog open={!!editingTaskId} onOpenChange={() => setEditingTaskId(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <Form {...editTaskForm}>
              <form onSubmit={editTaskForm.handleSubmit(onEditTaskSubmit)} className="space-y-4">
                <FormField
                  control={editTaskForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editTaskForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Enter task description"
                          {...field}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editTaskForm.control}
                  name="buddyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign to Buddy</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a buddy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(buddies) && buddies.map((buddy: BuddyRO) => (
                            <SelectItem key={buddy.id} value={buddy.id}>
                              {buddy.user?.name || buddy.name || 'Unknown Buddy'} ({buddy.user?.domainRole || buddy.domainRole || 'Unknown'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editTaskForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setEditingTaskId(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdatingTask}>
                    {isUpdatingTask ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
