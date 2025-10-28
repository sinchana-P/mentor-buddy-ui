import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
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
  const [showDomainRoleWarning, setShowDomainRoleWarning] = useState(false);
  const [originalDomainRole, setOriginalDomainRole] = useState('');

  // Fetch mentors for the dropdown
  const { data: mentors = [] } = useGetMentorsQuery({});

  // Sync form data when buddy changes or modal opens
  useEffect(() => {
    if (isOpen && buddy) {
      const currentDomainRole = buddy.user?.domainRole || buddy.domainRole || 'frontend';
      setFormData({
        name: buddy.user?.name || buddy.name || '',
        email: buddy.user?.email || buddy.email || '',
        domainRole: currentDomainRole,
        status: buddy.status || 'active',
        assignedMentorId: buddy.mentorId || '',
      });
      setOriginalDomainRole(currentDomainRole);
    }
  }, [isOpen, buddy]);

  const [updateBuddy, { isLoading: isUpdating }] = useUpdateBuddyMutation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if domain role is changing
    if (formData.domainRole !== originalDomainRole) {
      setShowDomainRoleWarning(true);
      return;
    }

    // If no domain role change, proceed with update
    await performUpdate();
  };

  const performUpdate = async () => {
    try {
      // Prepare data - assignedMentorId is now required, so we just pass it directly
      const updateData: any = { ...formData };

      await updateBuddy({
        id: buddy.id,
        data: updateData
      }).unwrap();

      toast({
        title: 'Success',
        description: formData.domainRole !== originalDomainRole
          ? 'Domain role changed! All previous progress has been reset and new topics assigned.'
          : 'Buddy profile updated successfully! Changes will appear immediately.'
      });
      setShowDomainRoleWarning(false);
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

  // Form validation - check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.name.trim().length >= 2 &&
      formData.email.trim().length > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.domainRole &&
      formData.status &&
      formData.assignedMentorId &&
      formData.assignedMentorId.trim() !== ''
    );
  };

  return (
    <>
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
            <Label htmlFor="name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter full name (min 2 characters)"
              required
              className={formData.name.trim().length < 2 && formData.name.trim().length > 0 ? 'border-red-500' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter valid email address"
              required
              className={formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'border-red-500' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domainRole">
              Domain Role <span className="text-red-500">*</span>
            </Label>
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
            <Label htmlFor="status">
              Status <span className="text-red-500">*</span>
            </Label>
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
            <Label htmlFor="mentor">
              Assigned Mentor <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.assignedMentorId}
              onValueChange={(value) => handleInputChange('assignedMentorId', value)}
            >
              <SelectTrigger className={!formData.assignedMentorId || formData.assignedMentorId.trim() === '' ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select mentor (required)" />
              </SelectTrigger>
              <SelectContent>
                {mentors.map((mentor: any) => (
                  <SelectItem key={mentor.id} value={mentor.id}>
                    {mentor.user?.name || mentor.name || 'Unknown Mentor'} - {mentor.user?.domainRole || mentor.domainRole}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating || !isFormValid()}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isFormValid() ? 'Fill Required Fields' : 'Save Changes'}
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Domain Role Change Warning Dialog */}
      <AlertDialog open={showDomainRoleWarning} onOpenChange={setShowDomainRoleWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Warning: Domain Role Change
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-semibold">
                You are about to change the buddy's domain role from <span className="text-blue-600">{originalDomainRole}</span> to <span className="text-blue-600">{formData.domainRole}</span>.
              </p>
              <p className="text-red-600 font-medium">
                ⚠️ This action will:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Delete ALL existing progress and topics for this buddy</li>
                <li>Reset their learning progress to 0%</li>
                <li>Assign new topics based on the new domain role</li>
                <li>This action cannot be undone</li>
              </ul>
              <p className="text-gray-600 text-sm mt-3">
                Are you sure you want to proceed?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDomainRoleWarning(false)}>
              Cancel - Keep Current Role
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={performUpdate}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Change Domain Role & Reset Progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
