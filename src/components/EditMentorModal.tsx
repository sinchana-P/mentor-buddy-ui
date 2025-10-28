import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useUpdateMentorMutation } from '@/api/mentorsApi';
import type { MentorRO } from '@/api/dto';

interface EditMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: MentorRO;
}

export default function EditMentorModal({ isOpen, onClose, mentor }: EditMentorModalProps) {
  const [formData, setFormData] = useState({
    name: mentor?.user?.name || '',
    expertise: mentor?.expertise || '',
    experience: mentor?.experience || '',
    domainRole: mentor?.user?.domainRole || 'frontend',
    isActive: mentor?.isActive ?? true,
  });

  // Sync form data when mentor changes or modal opens
  useEffect(() => {
    if (isOpen && mentor) {
      setFormData({
        name: mentor.user?.name || '',
        expertise: mentor.expertise || '',
        experience: mentor.experience || '',
        domainRole: mentor.user?.domainRole || 'frontend',
        isActive: mentor.isActive ?? true,
      });
    }
  }, [isOpen, mentor]);

  const [updateMentor, { isLoading: isUpdating }] = useUpdateMentorMutation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMentor({
        id: mentor.id,
        mentorData: formData
      }).unwrap();

      toast({
        title: 'Success',
        description: 'Mentor profile updated successfully! Changes will appear immediately.'
      });
      onClose();
    } catch (error: unknown) {
      console.error('Failed to update mentor:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Failed to update mentor';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Mentor Profile</DialogTitle>
          <DialogDescription>
            Update the mentor's information and preferences.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domainRole">Domain Role</Label>
            <Select value={formData.domainRole} onValueChange={(value) => handleInputChange('domainRole', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select domain role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="qa">QA</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise">Expertise</Label>
            <Textarea
              id="expertise"
              value={formData.expertise}
              onChange={(e) => handleInputChange('expertise', e.target.value)}
              placeholder="Describe technical expertise and skills..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              placeholder="Describe work experience and background..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.isActive ? 'active' : 'inactive'} onValueChange={(value) => handleInputChange('isActive', value === 'active')}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isUpdating}
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 