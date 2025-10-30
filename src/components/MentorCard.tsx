import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Edit, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import MessageModal from './MessageModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateMentorMutation, useDeleteMentorMutation } from '@/api/mentorsApi';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { MentorRO } from '@/api/dto';

interface MentorCardProps {
  mentor: MentorRO;
  canEdit?: boolean;
  canDelete?: boolean;
}

const mentorFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  domainRole: z.enum(['frontend', 'backend', 'devops', 'qa', 'hr']),
  expertise: z.string().min(10, 'Please describe expertise (minimum 10 characters)'),
  experience: z.string().min(10, 'Please describe experience (minimum 10 characters)'),
  isActive: z.boolean().optional(),
});

export default function MentorCard({ mentor, canEdit = true, canDelete = true }: MentorCardProps) {
  const [, setLocation] = useLocation();
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const mentorForm = useForm({
    resolver: zodResolver(mentorFormSchema),
    defaultValues: {
      name: mentor.user?.name || '',
      domainRole: (mentor.user?.domainRole || 'frontend') as 'frontend' | 'backend' | 'devops' | 'qa' | 'hr',
      expertise: mentor.expertise || '',
      experience: mentor.experience || '',
      isActive: mentor.isActive ?? true,
    },
  });

  // Sync form values when mentor data changes or modal opens
  useEffect(() => {
    if (isEditOpen) {
      mentorForm.reset({
        name: mentor.user?.name || '',
        domainRole: (mentor.user?.domainRole || 'frontend') as 'frontend' | 'backend' | 'devops' | 'qa' | 'hr',
        expertise: mentor.expertise || '',
        experience: mentor.experience || '',
        isActive: mentor.isActive ?? true,
      });
    }
  }, [isEditOpen, mentor, mentorForm]);

  const [updateMentor, { isLoading: isUpdating }] = useUpdateMentorMutation();
  const [deleteMentor, { isLoading: isDeleting }] = useDeleteMentorMutation();

  const handleUpdateMentor = async (data: z.infer<typeof mentorFormSchema>) => {
    try {
      if (!mentor.id) {
        throw new Error('Mentor ID is missing');
      }
      await updateMentor({ id: mentor.id, mentorData: data }).unwrap();
      setIsEditOpen(false);
      toast({ title: 'Mentor updated', description: 'Mentor details updated.' });
    } catch (error: unknown) {
      console.error('Failed to update mentor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update mentor';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const handleDeleteMentor = async () => {
    try {
      await deleteMentor(mentor.id).unwrap();
      setIsDeleteOpen(false);
      toast({ title: 'Mentor deleted', description: 'Mentor has been removed.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete mentor', variant: 'destructive' });
    }
  };

  const handleClick = () => {
    setLocation(`/mentors/${mentor.id}`);
  };

  const getDomainColor = (domain: string) => {
    const colors = {
      frontend: 'bg-card text-foreground',
      backend: 'bg-card text-foreground',
      devops: 'bg-card text-foreground',
      qa: 'bg-card text-foreground',
      hr: 'bg-card text-foreground',
    };
    return colors[domain as keyof typeof colors] || 'bg-card text-foreground';
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }} 
      transition={{ duration: 0.2 }}
      className="h-full" // Ensure full height for flex parent
    >
      <div
        className="premium-card cursor-pointer h-full flex flex-col group relative" // Added group and relative
        onClick={(e) => {
          // Don't navigate if clicking on action buttons or if modal is open
          if (isEditOpen || isDeleteOpen || isMessageModalOpen) {
            e.stopPropagation();
            return;
          }
          handleClick();
        }}
        style={{ minHeight: '320px', maxHeight: '320px' }} // Fixed card dimensions
      >
        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 mx-auto mb-3 ring-1 ring-border bg-card rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">
              {mentor.user?.name ? mentor.user.name.split(' ').map(n => n[0]).join('') : 'M'}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold mb-1 text-foreground truncate">{mentor.user?.name || 'Unknown Mentor'}</h3>
          <p className="text-muted-foreground text-xs mb-2 truncate" title={mentor.expertise}>{mentor.expertise}</p>
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-border ${getDomainColor(mentor.user?.domainRole || '')}`}>
            {mentor.user?.domainRole || 'Unknown'}
          </div>
        </div>

        {/* Stats Section - Flexible */}
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-white">{mentor.stats?.buddiesCount || 0}</p>
              <p className="text-white/50 text-xs">Buddies</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-400">{mentor.stats?.completedTasks || 0}</p>
              <p className="text-white/50 text-xs">Tasks</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">{mentor.responseRate}%</p>
              <p className="text-white/50 text-xs">Response</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-white/40 to-white/60 rounded-full transition-all duration-500"
                style={{ width: `${mentor.responseRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Actions Section - Inside card header */}
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsMessageModalOpen(true);
            }}
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
          
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <button
                className={`p-1.5 rounded-md transition-colors ${
                  canEdit
                    ? 'bg-white/10 hover:bg-white/20 text-white/60 hover:text-white cursor-pointer'
                    : 'bg-white/5 text-white/30 cursor-not-allowed opacity-50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!canEdit) {
                    toast({
                      title: 'Permission Denied',
                      description: 'You do not have permission to edit mentors',
                      variant: 'destructive'
                    });
                  }
                }}
                disabled={!canEdit}
                title={canEdit ? 'Edit mentor' : 'You cannot edit mentors'}
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[600px]"
              // onPointerDownOutside={(e) => {
              //   e.preventDefault();
              //   e.stopPropagation();
              // }}
              // onInteractOutside={(e) => {
              //   e.preventDefault();
              //   e.stopPropagation();
              // }}
            >
              <DialogHeader>
                <DialogTitle>Edit Mentor Profile</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Update the mentor's information and preferences.
                </p>
              </DialogHeader>
              <Form {...mentorForm}>
                <form onSubmit={mentorForm.handleSubmit(handleUpdateMentor)} className="space-y-4 mt-4">
                  <FormField
                    control={mentorForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter full name" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={mentorForm.control}
                    name="domainRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domain Role</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select domain role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="frontend">Frontend</SelectItem>
                            <SelectItem value="backend">Backend</SelectItem>
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
                    control={mentorForm.control}
                    name="expertise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expertise</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe technical expertise and skills..."
                            rows={3}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={mentorForm.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe work experience and background..."
                            rows={3}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={mentorForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value === 'active')}
                          value={field.value ? 'active' : 'inactive'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      className="px-6 py-2.5 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setIsEditOpen(false)}
                      disabled={isUpdating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isUpdating}
                    >
                      {isUpdating && <span className="mr-2">⏳</span>}
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger asChild>
              <button
                className={`p-1.5 rounded-md transition-colors ${
                  canDelete
                    ? 'bg-white/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 cursor-pointer'
                    : 'bg-white/5 text-white/30 cursor-not-allowed opacity-50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!canDelete) {
                    toast({
                      title: 'Permission Denied',
                      description: 'You do not have permission to delete mentors',
                      variant: 'destructive'
                    });
                  }
                }}
                disabled={!canDelete}
                title={canDelete ? 'Delete mentor' : 'You cannot delete mentors'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-card border border-white/10 p-6 rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Delete Mentor</DialogTitle>
              </DialogHeader>
              <p className="text-white/80 py-4">
                Are you sure you want to delete <span className="font-semibold text-white">{mentor.user?.name}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                  onClick={() => setIsDeleteOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-300 hover:text-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDeleteMentor}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        recipient={{
          id: mentor.id,
          name: mentor.user?.name || 'Unknown Mentor',
          avatarUrl: mentor.user?.avatarUrl,
          role: 'mentor',
          domainRole: mentor.user?.domainRole || 'unknown'
        }}
      />
    </motion.div>
  );
}
