/**
 * Curriculum Builder
 * Drag-and-drop interface for creating/editing curriculums with weeks and tasks
 */

import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import {
  useGetCurriculumByIdQuery,
  useGetCurriculumWeeksQuery,
  useCreateCurriculumMutation,
  useUpdateCurriculumMutation,
  useCreateWeekMutation,
  useUpdateWeekMutation,
  useDeleteWeekMutation,
  useReorderWeeksMutation,
} from '@/api/curriculum/curriculumApi';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Save,
  Plus,
  Eye,
  CheckCircle2,
  GripVertical,
} from 'lucide-react';
import type { DomainRole, CreateCurriculumDTO } from '@/types/curriculum';
import WeekCard from '@/components/curriculum/WeekCard';

export default function CurriculumBuilder() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/curriculum/:id/edit');
  const { toast } = useToast();

  const isEditing = !!params?.id;
  const curriculumId = params?.id;

  // Form state
  const [formData, setFormData] = useState<CreateCurriculumDTO>({
    name: '',
    description: '',
    domainRole: 'frontend',
    totalWeeks: 10,
    tags: [],
    version: '1.0',
  });

  const [tagInput, setTagInput] = useState('');
  const [weekDialogOpen, setWeekDialogOpen] = useState(false);

  // API
  const { data: curriculum, isLoading: loadingCurriculum } = useGetCurriculumByIdQuery(
    curriculumId || '',
    { skip: !curriculumId }
  );
  const { data: weeks = [], isLoading: loadingWeeks } = useGetCurriculumWeeksQuery(
    curriculumId || '',
    { skip: !curriculumId }
  );
  const [createCurriculum, { isLoading: creating }] = useCreateCurriculumMutation();
  const [updateCurriculum, { isLoading: updating }] = useUpdateCurriculumMutation();
  const [createWeek] = useCreateWeekMutation();
  const [reorderWeeks] = useReorderWeeksMutation();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Local weeks state for drag-and-drop
  const [localWeeks, setLocalWeeks] = useState(weeks);

  useEffect(() => {
    if (weeks.length > 0) {
      setLocalWeeks([...weeks].sort((a, b) => a.displayOrder - b.displayOrder));
    }
  }, [weeks]);

  // Populate form data when editing
  useEffect(() => {
    if (curriculum) {
      setFormData({
        name: curriculum.name,
        description: curriculum.description,
        domainRole: curriculum.domainRole,
        totalWeeks: curriculum.totalWeeks,
        tags: curriculum.tags,
        version: curriculum.version,
      });
    }
  }, [curriculum]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localWeeks.findIndex((w) => w.id === active.id);
      const newIndex = localWeeks.findIndex((w) => w.id === over.id);

      const newWeeks = arrayMove(localWeeks, oldIndex, newIndex);
      setLocalWeeks(newWeeks);

      // Update display order on backend
      try {
        await reorderWeeks({
          items: newWeeks.map((week, index) => ({
            id: week.id,
            displayOrder: index,
          })),
        }).unwrap();

        toast({
          title: 'Weeks reordered',
          description: 'Week order has been updated successfully.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to reorder weeks.',
          variant: 'destructive',
        });
        // Revert on error
        setLocalWeeks(weeks);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && curriculumId) {
        await updateCurriculum({
          id: curriculumId,
          data: formData,
        }).unwrap();
        toast({
          title: 'Curriculum updated',
          description: 'Your changes have been saved successfully.',
        });
      } else {
        const result = await createCurriculum(formData).unwrap();
        toast({
          title: 'Curriculum created',
          description: 'Your curriculum has been created. Add weeks and tasks to complete it.',
        });
        navigate(`/curriculum/${result.id}/edit`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save curriculum. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    });
  };

  const handleAddWeek = async (weekData: { title: string; description: string }) => {
    if (!curriculumId) return;

    try {
      await createWeek({
        curriculumId,
        weekNumber: localWeeks.length + 1,
        title: weekData.title,
        description: weekData.description,
        learningObjectives: [],
        resources: [],
      }).unwrap();

      toast({
        title: 'Week added',
        description: 'New week has been added to the curriculum.',
      });
      setWeekDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add week.',
        variant: 'destructive',
      });
    }
  };

  if (loadingCurriculum) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/curriculum')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {isEditing ? 'Edit Curriculum' : 'Create Curriculum'}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Update your curriculum details' : 'Build a comprehensive learning path'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing && (
              <Button variant="outline" onClick={() => navigate(`/curriculum/${curriculumId}`)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            )}
          </div>
        </div>

        {/* Basic Info Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Curriculum Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Frontend Developer Program"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domainRole">Domain Role *</Label>
                  <Select
                    value={formData.domainRole}
                    onValueChange={(value) =>
                      setFormData({ ...formData, domainRole: value as DomainRole })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frontend">Frontend</SelectItem>
                      <SelectItem value="backend">Backend</SelectItem>
                      <SelectItem value="fullstack">Fullstack</SelectItem>
                      <SelectItem value="devops">DevOps</SelectItem>
                      <SelectItem value="qa">QA</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this curriculum covers..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalWeeks">Total Weeks</Label>
                  <Input
                    id="totalWeeks"
                    type="number"
                    min="1"
                    max="52"
                    value={formData.totalWeeks}
                    onChange={(e) =>
                      setFormData({ ...formData, totalWeeks: parseInt(e.target.value) || 10 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="1.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tags (e.g., React, Node.js)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/curriculum')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || updating}>
                  <Save className="h-4 w-4 mr-2" />
                  {creating || updating ? 'Saving...' : 'Save Curriculum'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Weeks & Tasks Section (only show when editing) */}
        {isEditing && curriculumId && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Weeks & Tasks</CardTitle>
                <Button onClick={() => setWeekDialogOpen(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Week
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingWeeks ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : localWeeks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No weeks added yet. Click "Add Week" to get started.</p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={localWeeks.map((w) => w.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {localWeeks.map((week) => (
                        <WeekCard key={week.id} week={week} curriculumId={curriculumId} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Week Dialog */}
      <AddWeekDialog
        open={weekDialogOpen}
        onOpenChange={setWeekDialogOpen}
        onAdd={handleAddWeek}
      />
    </div>
  );
}

// Add Week Dialog Component
function AddWeekDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: { title: string; description: string }) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ title, description });
    setTitle('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Week</DialogTitle>
          <DialogDescription>Create a new week in your curriculum</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="week-title">Week Title *</Label>
            <Input
              id="week-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., HTML, CSS, JS Basics"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="week-description">Description *</Label>
            <Textarea
              id="week-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what will be covered in this week..."
              rows={3}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Week</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
