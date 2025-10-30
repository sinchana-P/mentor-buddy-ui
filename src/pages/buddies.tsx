import { useState, useEffect } from 'react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Search, UserPlus, Filter, GraduationCap, Sparkles, Users, Star, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
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

// RTK Query imports following your reference pattern
import {
  useGetBuddiesQuery,
  useCreateBuddyMutation,
  useDeleteBuddyMutation,
  useGetMentorsQuery,
} from '@/api';
import { useGetTopicsQuery } from '@/api/topicsApi';

// Import EditBuddyModal
import EditBuddyModal from '@/components/EditBuddyModal';
import type { BuddyRO } from '@/api/dto';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/utils/permissions';


// Use the shared Buddy type from ../types
const buddyFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  domainRole: z.enum(['frontend', 'backend', 'devops', 'qa', 'hr']),
  assignedMentorId: z.string().min(1, 'Please select a mentor')
});

// Topics by domain role
const DOMAIN_TOPICS: Record<string, string[]> = {
  frontend: ['React Fundamentals', 'TypeScript Basics', 'CSS Styling', 'JavaScript ES6+', 'State Management', 'HTML Fundamentals', 'React Components'],
  backend: ['Node.js Basics', 'Express Framework', 'Database Design', 'API Development', 'Authentication', 'Server Deployment'],
  fullstack: ['Frontend Basics', 'Backend Basics', 'Full Stack Architecture', 'API Integration', 'Database Management', 'Deployment'],
  devops: ['CI/CD Pipelines', 'Docker', 'Kubernetes', 'Cloud Platforms', 'Infrastructure as Code', 'Monitoring'],
  qa: ['Test Planning', 'Manual Testing', 'Automation Testing', 'Bug Tracking', 'Test Cases', 'Quality Metrics'],
  hr: ['Recruitment', 'Onboarding', 'Employee Relations', 'Performance Management', 'HR Policies', 'Training']
};

export default function BuddiesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<BuddyRO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [buddyToDelete, setBuddyToDelete] = useState<BuddyRO | null>(null);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const { toast } = useToast();

  // Get permissions
  const { hasPermission, canCreateBuddy, canDeleteBuddy, role, userId } = usePermissions();

  // ✅ RTK Query hooks for API operations (following your exact reference pattern)
  const { 
    data: buddies = [], 
    isLoading 
  } = useGetBuddiesQuery({
    search: search || undefined,
    domain: domainFilter !== 'all' ? domainFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  }, {
    pollingInterval: 60000, // Poll every 60 seconds
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  
  const [createBuddyTrigger, { isLoading: isBuddyCreating }] = useCreateBuddyMutation();
  const [deleteBuddyTrigger, { isLoading: isBuddyDeleting }] = useDeleteBuddyMutation();

  // Fetch mentors for the dropdown
  const { data: mentors = [] } = useGetMentorsQuery({});

  // Initialize form first
  const buddyForm = useForm<z.infer<typeof buddyFormSchema>>({
    resolver: zodResolver(buddyFormSchema),
    mode: 'onChange', // Validate on change for instant feedback
    defaultValues: {
      name: '',
      email: '',
      domainRole: 'frontend',
      assignedMentorId: ''
    }
  });

  // Fetch topics for the selected domain role
  const selectedDomain = buddyForm.watch('domainRole');
  const { data: availableTopics = [] } = useGetTopicsQuery(
    { domainRole: selectedDomain },
    { skip: !selectedDomain }
  );

  // Auto-select all topics when domain changes or topics load
  React.useEffect(() => {
    if (availableTopics.length > 0) {
      const allTopicIds = availableTopics.map(t => t.id);
      setSelectedTopicIds(allTopicIds);
    }
  }, [availableTopics]);

  // ✅ Following your exact handleSubmit pattern
  const handleCreateBuddy = async (data: z.infer<typeof buddyFormSchema>) => {
    try {
      // Pass selected topic IDs and assignedMentorId to backend
      await createBuddyTrigger({
        name: data.name,
        email: data.email,
        domainRole: data.domainRole,
        password: data.password,
        assignedMentorId: data.assignedMentorId, // Pass assigned mentor ID
        topicIds: selectedTopicIds // Pass selected topic IDs
      }).unwrap();

      // RTK Query auto-updates cache, no manual dispatch needed

      setIsCreateDialogOpen(false);
      buddyForm.reset();
      setSelectedTopicIds([]); // Reset topics

      toast({
        title: 'Success',
        description: 'Created buddy successfully'
      });
    } catch (err) {
      console.error(`Error in creating buddy: ${err}`);
      toast({
        title: 'Error',
        description: 'Failed to create buddy',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteBuddy = async () => {
    if (!buddyToDelete) return;

    try {
      await deleteBuddyTrigger(buddyToDelete.id).unwrap();

      toast({
        title: 'Success',
        description: 'Buddy deleted successfully'
      });

      setIsDeleteDialogOpen(false);
      setBuddyToDelete(null);
    } catch (err) {
      console.error(`Error deleting buddy: ${err}`);
      toast({
        title: 'Error',
        description: 'Failed to delete buddy',
        variant: 'destructive'
      });
    }
  };

  // Check if user can edit a specific buddy
  const canEditBuddy = (buddy: BuddyRO) => {
    // Manager can edit all buddies
    if (hasPermission(PERMISSIONS.CAN_EDIT_BUDDY_ALL)) return true;

    // Mentor can only edit buddies assigned to them (and only domain role field)
    if (role === 'mentor' && hasPermission(PERMISSIONS.CAN_EDIT_BUDDY_ROLE)) {
      // Check if this buddy is assigned to the current mentor
      // We need to match mentor's userId with buddy's assignedMentor's userId
      return buddy.mentorId === userId || buddy.mentor?.userId === userId;
    }

    // Buddy can only edit their own profile (only name field)
    if (role === 'buddy' && hasPermission(PERMISSIONS.CAN_EDIT_BUDDY_NAME)) {
      return buddy.userId === userId || buddy.user?.id === userId;
    }

    return false;
  };

  // Check if user can delete a specific buddy
  const canDeleteSpecificBuddy = (buddy: BuddyRO) => {
    // Only managers can delete buddies
    return canDeleteBuddy;
  };

  const openEditModal = (buddy: BuddyRO, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canEditBuddy(buddy)) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to edit this buddy',
        variant: 'destructive'
      });
      return;
    }
    setSelectedBuddy(buddy);
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (buddy: BuddyRO, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canDeleteSpecificBuddy(buddy)) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to delete this buddy',
        variant: 'destructive'
      });
      return;
    }
    setBuddyToDelete(buddy);
    setIsDeleteDialogOpen(true);
  };

  // RTK Query handles filtering server-side, so we use buddies directly

  // Color utility functions - inline usage to avoid unused variable warnings

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="premium-card animate-pulse">
          <div className="space-y-6">
            <div className="h-8 loading-shimmer rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 premium-card loading-shimmer"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="premium-card glass-card"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-success rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gradient">Buddies</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Sparkles className="w-4 h-4 text-green-400" />
                    <p className="text-foreground-secondary">Track buddy progress and development</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Summary */}
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 glass-card rounded-lg">
                <p className="text-2xl font-bold text-gradient">{buddies.length}</p>
                <p className="text-xs text-foreground-muted">Total</p>
              </div>
              <div className="text-center px-4 py-2 glass-card rounded-lg">
                <p className="text-2xl font-bold text-gradient">{buddies.filter(b => b.status === 'active').length}</p>
                <p className="text-xs text-foreground-muted">Active</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Premium Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="premium-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-premium">Filter & Search</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
              <input
                className="input-premium pl-10 w-full"
                placeholder="Search buddies by name, email, or mentor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] input-premium">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="exited">Exited</SelectItem>
                </SelectContent>
              </Select>

              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-[140px] input-premium">
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="qa">QA</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    className={`btn-gradient hover-lift flex items-center gap-2 ${!canCreateBuddy ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!canCreateBuddy}
                    title={!canCreateBuddy ? 'You do not have permission to create buddies' : 'Add new buddy'}
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Buddy
                  </button>
                </DialogTrigger>
              
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Buddy</DialogTitle>
                  <DialogDescription>Create a new buddy profile for mentorship tracking.</DialogDescription>
                </DialogHeader>

                <Form {...buddyForm}>
                  <form onSubmit={buddyForm.handleSubmit(handleCreateBuddy)} className="space-y-4">
                    <FormField
                      control={buddyForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter buddy's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={buddyForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="buddy@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={buddyForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter password (min 8 characters)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={buddyForm.control}
                      name="domainRole"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Domain</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select domain expertise" />
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
                      control={buddyForm.control}
                      name="assignedMentorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Assigned Mentor</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a mentor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mentors.map((mentor: any) => (
                                <SelectItem key={mentor.id} value={mentor.id}>
                                  {mentor.user?.name || mentor.name || 'Unknown Mentor'} - {mentor.user?.domainRole || mentor.domainRole}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Topics Selection */}
                    <div className="space-y-2">
                      <FormLabel className="form-label">Learning Topics (Optional)</FormLabel>
                      <p className="text-xs text-white/50 mb-2">
                        Select topics for this buddy's learning path. All topics start unchecked and can be tracked in the Progress tab.
                      </p>
                      <div className="max-h-48 overflow-y-auto space-y-2 border border-white/10 rounded-lg p-3 bg-white/5">
                        {availableTopics.length > 0 ? (
                          availableTopics.map((topic) => (
                            <div key={topic.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`topic-${topic.id}`}
                                className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                checked={selectedTopicIds.includes(topic.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTopicIds([...selectedTopicIds, topic.id]);
                                  } else {
                                    setSelectedTopicIds(selectedTopicIds.filter(id => id !== topic.id));
                                  }
                                }}
                              />
                              <label htmlFor={`topic-${topic.id}`} className="text-sm text-white/80 cursor-pointer flex-1">
                                {topic.name}
                              </label>
                              <span className="text-xs text-white/40">{topic.category}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-white/50 text-center py-4">
                            Loading topics for {selectedDomain}...
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-white/40">
                          {selectedTopicIds.length} of {availableTopics.length} topics selected
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedTopicIds.length === availableTopics.length) {
                              setSelectedTopicIds([]);
                            } else {
                              setSelectedTopicIds(availableTopics.map(t => t.id));
                            }
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          {selectedTopicIds.length === availableTopics.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6">
                      <button
                        type="button"
                        className="px-6 py-2.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-gradient"
                        disabled={isBuddyCreating || !buddyForm.formState.isValid}
                      >
                        {isBuddyCreating ? 'Creating...' : !buddyForm.formState.isValid ? 'Fill Required Fields' : 'Create Buddy'}
                      </button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </motion.div>

        {/* Premium Buddies Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 gradient-success rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-premium">Buddy Progress</h2>
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">{buddies.length} Found</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {buddies.map((buddy, index) => (
              <motion.div
                key={buddy.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  bounce: 0.3
                }}
                className="hover-lift h-full"
              >
                <div
                  className="premium-card cursor-pointer group relative h-full flex flex-col"
                  style={{ minHeight: '260px', maxHeight: '260px' }}
                  onClick={() => window.location.href = `/buddies/${buddy.id}`}
                >
                  {/* Action buttons - Top right, appear on hover */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <button
                      className={`p-1.5 rounded-md transition-colors ${
                        canEditBuddy(buddy)
                          ? 'bg-white/10 hover:bg-white/20 text-white/60 hover:text-white cursor-pointer'
                          : 'bg-white/5 text-white/30 cursor-not-allowed opacity-50'
                      }`}
                      onClick={(e) => openEditModal(buddy, e)}
                      disabled={!canEditBuddy(buddy)}
                      title={canEditBuddy(buddy) ? 'Edit buddy' : 'You cannot edit this buddy'}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className={`p-1.5 rounded-md transition-colors ${
                        canDeleteSpecificBuddy(buddy)
                          ? 'bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-300 cursor-pointer'
                          : 'bg-white/5 text-white/30 cursor-not-allowed opacity-50'
                      }`}
                      onClick={(e) => openDeleteDialog(buddy, e)}
                      disabled={!canDeleteSpecificBuddy(buddy)}
                      title={canDeleteSpecificBuddy(buddy) ? 'Delete buddy' : 'You cannot delete this buddy'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-12 w-12 ring-2 ring-white/10">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gradient-to-br from-white/20 to-white/10 text-white font-semibold text-sm">
                              {(buddy.user?.name || buddy.name)?.split(' ').map((n: string) => n[0]).join('') || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                            buddy.status === 'active' ? 'bg-green-500' : 
                            buddy.status === 'inactive' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-white text-base truncate">{buddy.user?.name || buddy.name || 'Unknown'}</h3>
                          <p className="text-xs text-white/60 truncate">{buddy.user?.email || buddy.email}</p>
                        </div>
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                        buddy.status === 'active' ? 'bg-green-500/20 text-green-300' :
                        buddy.status === 'inactive' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {buddy.status}
                      </div>
                    </div>

                    {/* Content - Compact */}
                    <div className="flex-1 space-y-1.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-xs">Domain:</span>
                        <div className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                          buddy.domainRole === 'frontend' ? 'bg-white/10 text-blue-300' :
                          buddy.domainRole === 'backend' ? 'bg-white/10 text-purple-300' :
                          buddy.domainRole === 'devops' ? 'bg-white/10 text-orange-300' :
                          buddy.domainRole === 'qa' ? 'bg-white/10 text-pink-300' :
                          'bg-white/10 text-teal-300'
                        }`}>
                          {buddy.domainRole}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-xs">Mentor:</span>
                        <span className="font-medium text-white text-xs truncate max-w-20" title={buddy.mentor?.user?.name || buddy.mentorName || 'Not assigned'}>
                          {buddy.mentor?.user?.name || buddy.mentorName || 'Not assigned'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-xs">Progress:</span>
                        <span className="font-medium text-white text-xs">
                          {buddy.progress}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar - Compact bottom */}
                    {buddy.progress > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-white/60">Overall Progress</span>
                          <span className="text-xs text-white/80 font-medium">
                            {buddy.progress}%
                          </span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-400/60 to-green-300/80 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${buddy.progress}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {buddies.length === 0 && (
          <div className="premium-card text-center py-16">
            <div className="w-16 h-16 gradient-success rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-premium mb-2">No buddies found</h3>
            <p className="text-foreground-secondary mb-6">
              {search || statusFilter !== 'all' || domainFilter !== 'all' 
                ? 'No buddies match your current search criteria' 
                : 'Get started by adding your first buddy to the mentorship program'}
            </p>
            {(search || statusFilter !== 'all' || domainFilter !== 'all') ? (
              <button 
                className="btn-gradient"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setDomainFilter('all');
                }}
              >
                Clear Filters
              </button>
            ) : (
              <button 
                className="btn-gradient"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First Buddy
              </button>
            )}
          </div>
        )}

        {/* Edit Buddy Modal */}
        {selectedBuddy && (
          <EditBuddyModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedBuddy(null);
            }}
            buddy={selectedBuddy}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <AlertDialogTitle>Delete Buddy</AlertDialogTitle>
              </div>
              <AlertDialogDescription>
                Are you sure you want to delete <span className="font-semibold text-foreground">{buddyToDelete?.user?.name || buddyToDelete?.name}</span>?
                This action cannot be undone and will permanently remove the buddy and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteBuddy}
                className="bg-red-500 hover:bg-red-600 text-white"
                disabled={isBuddyDeleting}
              >
                {isBuddyDeleting ? 'Deleting...' : 'Delete Buddy'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </div>
  );
}