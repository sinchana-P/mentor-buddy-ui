/**
 * Task Template Editor
 * Rich markdown editor for creating/editing task templates
 */

import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import {
  useCreateTaskTemplateMutation,
  useUpdateTaskTemplateMutation,
  useGetTaskTemplateByIdQuery,
} from '@/api/curriculum/curriculumApi';
import type {
  CreateTaskTemplateDTO,
  UpdateTaskTemplateDTO,
  TaskDifficulty,
  TaskTemplate,
} from '@/types/curriculum';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Plus, X, Save } from 'lucide-react';

interface TaskTemplateEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekId: string;
  curriculumId: string;
  taskId?: string;
}

export default function TaskTemplateEditor({
  open,
  onOpenChange,
  weekId,
  curriculumId,
  taskId,
}: TaskTemplateEditorProps) {
  const { toast } = useToast();
  const isEditing = !!taskId;

  // API
  const { data: existingTask } = useGetTaskTemplateByIdQuery(taskId || '', { skip: !taskId });
  const [createTask, { isLoading: creating }] = useCreateTaskTemplateMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskTemplateMutation();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    difficulty: 'medium' as TaskDifficulty,
    estimatedHours: 4,
  });

  const [expectedResourceTypes, setExpectedResourceTypes] = useState<
    Array<{ type: string; label: string; required: boolean }>
  >([]);
  const [newResourceType, setNewResourceType] = useState({ type: '', label: '', required: false });

  const [learningResources, setLearningResources] = useState<
    Array<{ title: string; url: string; type: string }>
  >([]);
  const [newLearningResource, setNewLearningResource] = useState({ title: '', url: '', type: 'article' });

  // Populate form when editing
  useEffect(() => {
    if (existingTask) {
      setFormData({
        title: existingTask.title,
        description: existingTask.description,
        requirements: existingTask.requirements,
        difficulty: existingTask.difficulty,
        estimatedHours: existingTask.estimatedHours,
      });
      setExpectedResourceTypes(existingTask.expectedResourceTypes || []);
      setLearningResources(existingTask.resources || []);
    }
  }, [existingTask]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        title: '',
        description: '',
        requirements: '',
        difficulty: 'medium',
        estimatedHours: 4,
      });
      setExpectedResourceTypes([]);
      setLearningResources([]);
    }
  }, [open]);

  const handleAddResourceType = () => {
    if (newResourceType.type && newResourceType.label) {
      setExpectedResourceTypes([...expectedResourceTypes, newResourceType]);
      setNewResourceType({ type: '', label: '', required: false });
    }
  };

  const handleRemoveResourceType = (index: number) => {
    setExpectedResourceTypes(expectedResourceTypes.filter((_, i) => i !== index));
  };

  const handleAddLearningResource = () => {
    if (newLearningResource.title && newLearningResource.url) {
      setLearningResources([...learningResources, newLearningResource]);
      setNewLearningResource({ title: '', url: '', type: 'article' });
    }
  };

  const handleRemoveLearningResource = (index: number) => {
    setLearningResources(learningResources.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const taskData = {
        ...formData,
        expectedResourceTypes,
        resources: learningResources,
      };

      if (isEditing && taskId) {
        await updateTask({
          id: taskId,
          data: taskData as UpdateTaskTemplateDTO,
        }).unwrap();
        toast({
          title: 'Task updated',
          description: 'Task template has been updated successfully.',
        });
      } else {
        await createTask({
          ...taskData,
          curriculumWeekId: weekId,
        } as CreateTaskTemplateDTO).unwrap();
        toast({
          title: 'Task created',
          description: 'New task template has been added to the week.',
        });
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save task template.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task Template' : 'Create Task Template'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Build Landing Page"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) =>
                    setFormData({ ...formData, difficulty: value as TaskDifficulty })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="1"
                  value={formData.estimatedHours}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
            </div>
          </div>

          {/* Description - Markdown Editor */}
          <div className="space-y-2">
            <Label>Description (Markdown Supported) *</Label>
            <div data-color-mode="dark">
              <MDEditor
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val || '' })}
                height={300}
                preview="live"
                visibleDragbar={false}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use markdown to format your task description. Supports headings, lists, code blocks, links, and more.
            </p>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="List specific requirements buddies must meet..."
              rows={4}
            />
          </div>

          {/* Expected Resource Types */}
          <div className="space-y-3">
            <Label>Expected Submission Resources</Label>
            <p className="text-sm text-muted-foreground">
              Specify what types of resources buddies should submit (e.g., GitHub repo, live URL, PDF)
            </p>

            <div className="space-y-2">
              {expectedResourceTypes.map((resourceType, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <Badge variant="outline" className="min-w-[100px]">
                    {resourceType.type}
                  </Badge>
                  <span className="flex-1">{resourceType.label}</span>
                  {resourceType.required && <Badge variant="secondary">Required</Badge>}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveResourceType(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Type (e.g., github)"
                value={newResourceType.type}
                onChange={(e) =>
                  setNewResourceType({ ...newResourceType, type: e.target.value })
                }
              />
              <Input
                placeholder="Label (e.g., GitHub Repository)"
                value={newResourceType.label}
                onChange={(e) =>
                  setNewResourceType({ ...newResourceType, label: e.target.value })
                }
              />
              <div className="flex items-center gap-2 px-3">
                <Checkbox
                  checked={newResourceType.required}
                  onCheckedChange={(checked) =>
                    setNewResourceType({ ...newResourceType, required: checked as boolean })
                  }
                />
                <span className="text-sm">Required</span>
              </div>
              <Button type="button" onClick={handleAddResourceType} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Learning Resources */}
          <div className="space-y-3">
            <Label>Learning Resources</Label>
            <p className="text-sm text-muted-foreground">
              Add helpful resources buddies can refer to while working on this task
            </p>

            <div className="space-y-2">
              {learningResources.map((resource, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <Badge variant="outline">{resource.type}</Badge>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{resource.title}</div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      {resource.url}
                    </a>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLearningResource(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Resource title"
                value={newLearningResource.title}
                onChange={(e) =>
                  setNewLearningResource({ ...newLearningResource, title: e.target.value })
                }
              />
              <Input
                placeholder="URL"
                value={newLearningResource.url}
                onChange={(e) =>
                  setNewLearningResource({ ...newLearningResource, url: e.target.value })
                }
              />
              <Select
                value={newLearningResource.type}
                onValueChange={(value) =>
                  setNewLearningResource({ ...newLearningResource, type: value })
                }
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="docs">Docs</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddLearningResource} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || updating}>
              <Save className="h-4 w-4 mr-2" />
              {creating || updating ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
