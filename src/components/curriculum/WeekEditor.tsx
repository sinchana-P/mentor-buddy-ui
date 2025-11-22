/**
 * Week Editor Dialog
 * Edit week details
 */

import { useState, useEffect } from 'react';
import { useUpdateWeekMutation } from '@/api/curriculum/curriculumApi';
import type { CurriculumWeek } from '@/types/curriculum';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Save, Plus, X } from 'lucide-react';

interface WeekEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  week: CurriculumWeek;
  curriculumId: string;
}

export default function WeekEditor({ open, onOpenChange, week, curriculumId }: WeekEditorProps) {
  const { toast } = useToast();
  const [updateWeek, { isLoading }] = useUpdateWeekMutation();

  const [formData, setFormData] = useState({
    title: week.title,
    description: week.description,
    learningObjectives: week.learningObjectives || [],
  });

  const [newObjective, setNewObjective] = useState('');

  useEffect(() => {
    setFormData({
      title: week.title,
      description: week.description,
      learningObjectives: week.learningObjectives || [],
    });
  }, [week]);

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setFormData({
        ...formData,
        learningObjectives: [...formData.learningObjectives, newObjective.trim()],
      });
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (index: number) => {
    setFormData({
      ...formData,
      learningObjectives: formData.learningObjectives.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateWeek({
        id: week.id,
        data: formData,
      }).unwrap();
      toast({
        title: 'Week updated',
        description: 'Week details have been updated successfully.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update week.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Week {week.weekNumber}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Week Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Learning Objectives</Label>
            <div className="space-y-2">
              {formData.learningObjectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <span className="flex-1 text-sm">{objective}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveObjective(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a learning objective..."
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddObjective();
                  }
                }}
              />
              <Button type="button" onClick={handleAddObjective} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
