import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useUpdateBuddyMutation, useGetMentorsQuery } from '@/api';
import type { BuddyRO } from '@/api/dto';

interface EditBuddyModalProps {
  isOpen: boolean;
  onClose: () => void;
  buddy: BuddyRO;
}

export default function EditBuddyModal({ isOpen, onClose, buddy }: EditBuddyModalProps) {
  const [formData, setFormData] = useState({
    name: buddy?.user?.name || buddy?.name || '',
    email: buddy?.user?.email || buddy?.email || '',
    domainRole: buddy?.user?.domainRole || buddy?.domainRole || 'frontend',
    status: buddy?.status || 'active',
    assignedMentorId: buddy?.mentorId || '',
  });

  // Fetch mentors for the dropdown
  const { data: mentors = [] } = useGetMentorsQuery({});

  // Sync form data when buddy changes or modal opens
  useEffect(() => {
    if (isOpen && buddy) {
      setFormData({
        name: buddy.user?.name || buddy.name || '',
        email: buddy.user?.email || buddy.email || '',
        domainRole: buddy.user?.domainRole || buddy.domainRole || 'frontend',
        status: buddy.status || 'active',
        assignedMentorId: buddy.mentorId || '',
      });
    }
  }, [isOpen, buddy]);

  const [updateBuddy, { isLoading: isUpdating }] = useUpdateBuddyMutation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateBuddy({
        id: buddy.id,
        data: formData
      }).unwrap();

      toast({
        title: 'Success',
        description: 'Buddy profile updated successfully! Changes will appear immediately.'
      });
      onClose();
    } catch (error: unknown) {
      console.error('Failed to update buddy:', error);
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Failed to update buddy';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Buddy Profile</DialogTitle>
          <DialogDescription>
            Update the buddy's information and preferences.
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email"
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
                <SelectItem value="fullstack">Fullstack</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="qa">QA</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="exited">Exited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mentor">Assigned Mentor</Label>
            <Select value={formData.assignedMentorId || 'unassigned'} onValueChange={(value) => handleInputChange('assignedMentorId', value === 'unassigned' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select mentor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">No Mentor</SelectItem>
                {mentors.map((mentor: any) => (
                  <SelectItem key={mentor.id} value={mentor.id}>
                    {mentor.user?.name || mentor.name || 'Unknown Mentor'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
