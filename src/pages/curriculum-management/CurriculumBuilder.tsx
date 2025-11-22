import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useGetCurriculumByIdQuery,
  useCreateCurriculumMutation,
  useUpdateCurriculumMutation,
  useGetCurriculumWeeksQuery,
  useCreateCurriculumWeekMutation,
  useUpdateCurriculumWeekMutation,
  useDeleteCurriculumWeekMutation,
  usePublishCurriculumMutation,
} from '@/api/curriculumManagementApi';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Save, Plus, Edit, Trash2, CheckCircle, GripVertical, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'wouter';

const curriculumSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  domainRole: z.enum(['frontend', 'backend', 'fullstack', 'devops', 'qa', 'hr']),
  totalWeeks: z.number().min(1).max(52),
  version: z.string().default('1.0'),
  tags: z.string().optional(),
});

const weekSchema = z.object({
  weekNumber: z.number().min(1),
  title: z.string().min(3),
  description: z.string().optional(),
  learningObjectives: z.string().optional(),
});

type CurriculumFormData = z.infer<typeof curriculumSchema>;
type WeekFormData = z.infer<typeof weekSchema>;

export default function CurriculumBuilder() {
  const [, params] = useRoute('/curriculum-management/:id');
  const [, setLocation] = useLocation();
  const curriculumId = params?.id !== 'create' ? params?.id : null;
  const isEditMode = Boolean(curriculumId);

  const [weekDialogOpen, setWeekDialogOpen] = useState(false);
  const [editingWeek, setEditingWeek] = useState<any>(null);

  const { data: curriculum, isLoading: loadingCurriculum } = useGetCurriculumByIdQuery(curriculumId || '', {
    skip: !curriculumId,
  });

  const { data: weeks = [], isLoading: loadingWeeks } = useGetCurriculumWeeksQuery(curriculumId || '', {
    skip: !curriculumId,
  });

  const [createCurriculum, { isLoading: creating }] = useCreateCurriculumMutation();
  const [updateCurriculum, { isLoading: updating }] = useUpdateCurriculumMutation();
  const [publishCurriculum, { isLoading: publishing }] = usePublishCurriculumMutation();
  const [createWeek] = useCreateCurriculumWeekMutation();
  const [updateWeek] = useUpdateCurriculumWeekMutation();
  const [deleteWeek] = useDeleteCurriculumWeekMutation();

  const { toast } = useToast();

  const form = useForm<CurriculumFormData>({
    resolver: zodResolver(curriculumSchema),
    defaultValues: {
      name: '',
      description: '',
      domainRole: 'frontend',
      totalWeeks: 10,
      version: '1.0',
      tags: '',
    },
  });

  const weekForm = useForm<WeekFormData>({
    resolver: zodResolver(weekSchema),
    defaultValues: {
      weekNumber: 1,
      title: '',
      description: '',
      learningObjectives: '',
    },
  });

  useEffect(() => {
    if (curriculum) {
      form.reset({
        name: curriculum.name,
        description: curriculum.description || '',
        domainRole: curriculum.domainRole,
        totalWeeks: curriculum.totalWeeks,
        version: curriculum.version,
        tags: curriculum.tags?.join(', ') || '',
      });
    }
  }, [curriculum, form]);

  const onSubmitCurriculum = async (data: CurriculumFormData) => {
    try {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };

      if (isEditMode && curriculumId) {
        await updateCurriculum({ id: curriculumId, data: payload }).unwrap();
        toast({ title: 'Success', description: 'Curriculum updated successfully' });
      } else {
        const result = await createCurriculum(payload).unwrap();
        toast({ title: 'Success', description: 'Curriculum created successfully' });
        setLocation(`/curriculum-management/${result.id}`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save curriculum',
        variant: 'destructive',
      });
    }
  };

  const onSubmitWeek = async (data: WeekFormData) => {
    try {
      const payload = {
        ...data,
        learningObjectives: data.learningObjectives
          ? data.learningObjectives.split('\n').map(l => l.trim()).filter(Boolean)
          : [],
        displayOrder: editingWeek ? editingWeek.displayOrder : weeks.length + 1,
      };

      if (editingWeek) {
        await updateWeek({ id: editingWeek.id, data: payload }).unwrap();
        toast({ title: 'Success', description: 'Week updated successfully' });
      } else {
        if (!curriculumId) {
          toast({ title: 'Error', description: 'Please save curriculum first', variant: 'destructive' });
          return;
        }
        await createWeek({ curriculumId, data: payload }).unwrap();
        toast({ title: 'Success', description: 'Week created successfully' });
      }

      setWeekDialogOpen(false);
      setEditingWeek(null);
      weekForm.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save week',
        variant: 'destructive',
      });
    }
  };

  const handlePublish = async () => {
    if (!curriculumId) return;

    try {
      await publishCurriculum(curriculumId).unwrap();
      toast({ title: 'Success', description: 'Curriculum published successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to publish curriculum',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteWeek = async (weekId: string) => {
    try {
      await deleteWeek(weekId).unwrap();
      toast({ title: 'Success', description: 'Week deleted successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete week',
        variant: 'destructive',
      });
    }
  };

  const openWeekDialog = (week?: any) => {
    if (week) {
      setEditingWeek(week);
      weekForm.reset({
        weekNumber: week.weekNumber,
        title: week.title,
        description: week.description || '',
        learningObjectives: week.learningObjectives?.join('\n') || '',
      });
    } else {
      setEditingWeek(null);
      weekForm.reset({
        weekNumber: weeks.length + 1,
        title: '',
        description: '',
        learningObjectives: '',
      });
    }
    setWeekDialogOpen(true);
  };

  if (loadingCurriculum) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-muted-foreground">Loading curriculum...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/curriculum-management">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEditMode ? 'Edit Curriculum' : 'Create Curriculum'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEditMode ? 'Update curriculum details and structure' : 'Build a new learning curriculum'}
              </p>
            </div>
          </div>

          {isEditMode && curriculum?.status !== 'published' && (
            <Button onClick={handlePublish} disabled={publishing}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {publishing ? 'Publishing...' : 'Publish'}
            </Button>
          )}
        </div>

        {/* Curriculum Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Curriculum Details</CardTitle>
            <CardDescription>Basic information about the curriculum program</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitCurriculum)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Curriculum Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Frontend Developer Program" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the curriculum program..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="domainRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domain</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select domain" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="frontend">Frontend</SelectItem>
                            <SelectItem value="backend">Backend</SelectItem>
                            <SelectItem value="fullstack">Fullstack</SelectItem>
                            <SelectItem value="devops">DevOps</SelectItem>
                            <SelectItem value="qa">QA</SelectItem>
                            <SelectItem value="hr">HR</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalWeeks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Weeks</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="52"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input placeholder="1.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="react, javascript, hooks" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={creating || updating}>
                  <Save className="h-4 w-4 mr-2" />
                  {creating || updating ? 'Saving...' : 'Save Curriculum'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Weeks & Tasks Section */}
        {isEditMode && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Weeks & Tasks</CardTitle>
                  <CardDescription>Manage weeks and tasks for this curriculum</CardDescription>
                </div>
                <Button onClick={() => openWeekDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Week
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingWeeks ? (
                <p className="text-muted-foreground py-8">Loading weeks...</p>
              ) : weeks.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No weeks added yet</h3>
                  <p className="text-muted-foreground mb-6">Start building your curriculum by adding weekly modules</p>
                  <Button onClick={() => openWeekDialog()} size="lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Week
                  </Button>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {weeks.map((week: any) => (
                    <AccordionItem key={week.id} value={week.id}>
                      <div className="flex items-center justify-between py-4 pr-4">
                        <AccordionTrigger className="hover:no-underline flex-1 [&>svg]:ml-auto">
                          <div className="flex items-center gap-3">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                            <div className="text-left">
                              <p className="font-semibold text-foreground">Week {week.weekNumber}: {week.title}</p>
                              {week.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{week.description}</p>
                              )}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openWeekDialog(week);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWeek(week.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <AccordionContent>
                        <div className="pl-8 pr-4 py-4 space-y-4">
                          {week.description && (
                            <div>
                              <h4 className="font-semibold mb-2">Description</h4>
                              <p className="text-sm text-gray-600">{week.description}</p>
                            </div>
                          )}

                          {week.learningObjectives && week.learningObjectives.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2">Learning Objectives</h4>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {week.learningObjectives.map((obj: string, idx: number) => (
                                  <li key={idx}>{obj}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold">Tasks</h4>
                              <Link href={`/curriculum-management/${curriculumId}/week/${week.id}/tasks`}>
                                <Button size="sm" variant="outline">
                                  <Plus className="h-4 w-4 mr-1" />
                                  Manage Tasks
                                </Button>
                              </Link>
                            </div>
                            <p className="text-sm text-gray-500">
                              Click "Manage Tasks" to add and edit tasks for this week
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        )}

        {/* Week Dialog */}
        <Dialog open={weekDialogOpen} onOpenChange={setWeekDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingWeek ? 'Edit Week' : 'Add Week'}</DialogTitle>
              <DialogDescription>
                {editingWeek ? 'Update week information' : 'Create a new week for this curriculum'}
              </DialogDescription>
            </DialogHeader>

            <Form {...weekForm}>
              <form onSubmit={weekForm.handleSubmit(onSubmitWeek)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={weekForm.control}
                    name="weekNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Week Number</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={weekForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Week Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., HTML & CSS Basics" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={weekForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Week overview..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={weekForm.control}
                  name="learningObjectives"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Learning Objectives (one per line, optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Understand HTML5 semantics&#10;Master CSS Flexbox&#10;Build responsive layouts"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setWeekDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingWeek ? 'Update Week' : 'Add Week'}
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
