import React, { useState } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useGetWeekTasksQuery,
  useCreateTaskTemplateMutation,
  useUpdateTaskTemplateMutation,
  useDeleteTaskTemplateMutation,
} from '@/api/curriculumManagementApi';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, GripVertical, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Import markdown editor (needs @uiw/react-md-editor package)
// For now, using textarea - will upgrade when package is installed
const MDEditor = ({ value, onChange, preview }: any) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="text-sm font-medium mb-2 block text-foreground">Edit</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[400px] p-4 border border-input rounded-md font-mono text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="# Task Description

Write your task description here using Markdown...

## Requirements
- Requirement 1
- Requirement 2

```javascript
// Code examples
```
"
      />
    </div>
    <div>
      <label className="text-sm font-medium mb-2 block text-foreground">Preview</label>
      <div className="w-full min-h-[400px] p-4 border border-input rounded-md prose prose-sm dark:prose-invert max-w-none overflow-auto bg-muted/50">
        <div dangerouslySetInnerHTML={{ __html: value.replace(/\n/g, '<br/>') }} />
      </div>
    </div>
  </div>
);

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  estimatedHours: z.number().min(1).max(100).optional(),
  expectedResourceTypes: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function TaskManagement() {
  const [, params] = useRoute('/curriculum-management/:curriculumId/week/:weekId/tasks');
  const [, setLocation] = useLocation();
  const { curriculumId, weekId } = params || {};

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  const { data: tasks = [], isLoading } = useGetWeekTasksQuery(weekId || '', { skip: !weekId });
  const [createTask, { isLoading: creating }] = useCreateTaskTemplateMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskTemplateMutation();
  const [deleteTask] = useDeleteTaskTemplateMutation();

  const { toast } = useToast();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      difficulty: 'medium',
      estimatedHours: 6,
      expectedResourceTypes: '',
    },
  });

  const openTaskDialog = (task?: any) => {
    if (task) {
      setEditingTask(task);
      form.reset({
        title: task.title,
        description: task.description,
        requirements: task.requirements || '',
        difficulty: task.difficulty,
        estimatedHours: task.estimatedHours || 6,
        expectedResourceTypes: task.expectedResourceTypes
          ? JSON.stringify(task.expectedResourceTypes, null, 2)
          : '',
      });
    } else {
      setEditingTask(null);
      form.reset({
        title: '',
        description: '',
        requirements: '',
        difficulty: 'medium',
        estimatedHours: 6,
        expectedResourceTypes: '',
      });
    }
    setTaskDialogOpen(true);
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      let expectedResourceTypes = [];
      if (data.expectedResourceTypes) {
        try {
          expectedResourceTypes = JSON.parse(data.expectedResourceTypes);
        } catch {
          expectedResourceTypes = data.expectedResourceTypes
            .split('\n')
            .filter(Boolean)
            .map((type) => ({ type: type.trim(), label: type.trim(), required: true }));
        }
      }

      const payload = {
        ...data,
        expectedResourceTypes,
        displayOrder: editingTask ? editingTask.displayOrder : tasks.length + 1,
      };

      if (editingTask) {
        await updateTask({ id: editingTask.id, data: payload }).unwrap();
        toast({ title: 'Success', description: 'Task updated successfully' });
      } else {
        if (!weekId) {
          toast({ title: 'Error', description: 'Week ID is missing', variant: 'destructive' });
          return;
        }
        await createTask({ weekId, data: payload }).unwrap();
        toast({ title: 'Success', description: 'Task created successfully' });
      }

      setTaskDialogOpen(false);
      setEditingTask(null);
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save task',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId).unwrap();
      toast({ title: 'Success', description: 'Task deleted successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge className="bg-green-500">Easy</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'hard':
        return <Badge className="bg-red-500">Hard</Badge>;
      default:
        return <Badge>{difficulty}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/curriculum-management/${curriculumId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Curriculum
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
              <p className="text-muted-foreground mt-1">Create and organize weekly tasks</p>
            </div>
          </div>

          <Button onClick={() => openTaskDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground py-8">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <Card className="py-16">
            <CardContent className="text-center">
              <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No tasks added yet</h3>
              <p className="text-muted-foreground mb-6">Start building your week by adding tasks for buddies to complete</p>
              <Button onClick={() => openTaskDialog()} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Add First Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task: any, index: number) => (
              <Card key={task.id} className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg text-foreground">
                          Task {index + 1}: {task.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {task.estimatedHours}h • {task.difficulty}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDifficultyBadge(task.difficulty)}
                      <Button variant="ghost" size="sm" onClick={() => openTaskDialog(task)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                  </div>
                  {task.expectedResourceTypes && task.expectedResourceTypes.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-foreground mb-2">Expected Resources:</p>
                      <div className="flex flex-wrap gap-2">
                        {task.expectedResourceTypes.map((rt: any, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {rt.label} {rt.required && '*'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Task Dialog */}
        <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
              <DialogDescription>
                {editingTask ? 'Update task details' : 'Create a new task for this week'}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Build Landing Page" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatedHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Markdown)</FormLabel>
                      <FormControl>
                        <MDEditor value={field.value} onChange={field.onChange} preview="live" />
                      </FormControl>
                      <FormDescription>
                        Use Markdown to format the task description. Supports headings, lists, code blocks, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedResourceTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Resource Types (JSON or one per line)</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className="w-full min-h-[100px] p-2 border border-input rounded-md font-mono text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder={'github\nhosted_url\npdf\n\nOR\n\n[{"type":"github","label":"Source Code","required":true}]'}
                        />
                      </FormControl>
                      <FormDescription>
                        Define what buddies should submit (GitHub repo, live URL, PDF, etc.)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setTaskDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating || updating}>
                    {creating || updating ? 'Saving...' : editingTask ? 'Update Task' : 'Add Task'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
