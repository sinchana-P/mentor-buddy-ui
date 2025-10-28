import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useGetBuddiesQuery, useAssignBuddyToMentorMutation } from '@/api/apiSlice';
import { useToast } from '@/hooks/use-toast';
import type { BuddyRO } from '@/api/dto';

interface AssignBuddyModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorId: string;
  mentorName: string;
}

export default function AssignBuddyModal({ isOpen, onClose, mentorId, mentorName }: AssignBuddyModalProps) {
  const [selectedBuddyId, setSelectedBuddyId] = useState('');
  const { toast } = useToast();

  // Fetch available buddies (not assigned to any mentor)
  const { data: buddies = [], isLoading } = useGetBuddiesQuery({});
  const availableBuddies: BuddyRO[] = buddies.filter((b: BuddyRO) => !b.mentorId);

  const [assignBuddyToMentor, { isLoading: isAssigning }] = useAssignBuddyToMentorMutation();

  const handleAssign = async () => {
    if (!selectedBuddyId) return;
    
    try {
      await assignBuddyToMentor({
        buddyId: selectedBuddyId,
        mentorId
      }).unwrap();

      toast({
        title: 'Success',
        description: 'Buddy assigned to mentor successfully!'
      });
      onClose();
      setSelectedBuddyId('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign buddy. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Buddy to Mentor</DialogTitle>
          <DialogDescription>
            Select a buddy to assign to {mentorName}. Only unassigned active buddies are shown.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="buddy">Select Buddy</Label>
            <Select value={selectedBuddyId} onValueChange={setSelectedBuddyId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a buddy..." />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading buddies...
                    </div>
                  </SelectItem>
                ) : availableBuddies.length === 0 ? (
                  <SelectItem value="" disabled>
                    No available buddies
                  </SelectItem>
                ) : (
                  availableBuddies.map((buddy: BuddyRO) => (
                    <SelectItem key={buddy.id} value={buddy.id}>
                      {buddy.user?.name || 'Unknown Buddy'} ({buddy.user?.domainRole || 'Unknown'})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedBuddyId || isAssigning}
          >
            {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Buddy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 