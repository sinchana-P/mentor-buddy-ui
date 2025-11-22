import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import MentorCard from '@/components/MentorCard';
import { Plus, Search, UserCheck, Filter, Star, Sparkles, Crown, Users, LayoutGrid, Table2, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
// RTK Query hooks following your reference pattern
import { useGetMentorsQuery, useCreateMentorMutation, useUpdateMentorMutation, useDeleteMentorMutation } from '@/api/mentorsApi';
import { useLocation } from 'wouter';
import { usePermissions } from '@/hooks/usePermissions';

const mentorFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  domainRole: z.enum(['frontend', 'backend', 'devops', 'qa', 'hr']),
  expertise: z.string().min(10, 'Please describe expertise (minimum 10 characters)'),
  experience: z.string().min(10, 'Please describe experience (minimum 10 characters)'),
});

export default function MentorsPage() {
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    search: '',
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table'); // Default to table view
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Items per page for table view
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Get permissions
  const { canCreateMentor, canEditMentor, canDeleteMentor } = usePermissions();

  // Following your reference pattern: useSelector to read from store (commented out unused vars)
  // const mentorsFromStore = useSelector((state: RootState) => state.mentors.mentors);
  // const selectedMentor = useSelector((state: RootState) => state.mentors.selectedMentor);
  // const storeFilters = useSelector((state: RootState) => state.mentors.filters);
  // const storeLoading = useSelector((state: RootState) => state.mentors.loading);
  const storeError = useSelector((state: RootState) => state.mentors.error);

  // RTK Query hooks following your reference pattern
  const { data: mentors = [], isLoading, error, refetch } = useGetMentorsQuery({
    domain: filters.role !== 'all' ? filters.role : undefined,
    search: filters.search || undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
  });
  
  // Following your pattern: const [createTrigger] = useCreateMutation()
  const [createMentorTrigger] = useCreateMentorMutation();
  const [updateMentorTrigger] = useUpdateMentorMutation();
  const [deleteMentorTrigger] = useDeleteMentorMutation();

  const mentorForm = useForm<z.infer<typeof mentorFormSchema>>({
    resolver: zodResolver(mentorFormSchema),
    mode: 'onChange', // Validate on change for instant feedback
    defaultValues: {
      name: '',
      email: '',
      domainRole: 'frontend',
      expertise: '',
      experience: '',
    }
  });

  // Handle RTK Query errors and store state
  useEffect(() => {
    if (error && 'data' in error) {
      toast({
        title: 'Error loading mentors',
        description: (error.data as { message?: string })?.message || 'Failed to load mentors',
        variant: 'destructive',
      });
    }
    
    // Use store error if available
    if (storeError) {
      toast({
        title: 'Store Error',
        description: storeError,
        variant: 'destructive',
      });
    }
  }, [error, storeError, toast]);

  const handleCreateMentor = async (data: z.infer<typeof mentorFormSchema>) => {
    try {
      console.log('Creating mentor with data:', data);
      
      // Following your reference pattern: await createTrigger(payload).unwrap()
      const response = await createMentorTrigger(data).unwrap();
      
      console.log('Mentor created successfully:', response);
      setIsCreateDialogOpen(false);
      mentorForm.reset();
      toast({
        title: "Success",
        description: "Mentor created successfully! RTK Query auto-updated cache.",
      });
    } catch (error: unknown) {
      console.error('Failed to create mentor:', error);
      const errorMessage = 
        (error as { data?: { message?: string }, message?: string })?.data?.message || 
        (error as { message?: string })?.message || 
        "Failed to create mentor";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const onSubmit = (data: z.infer<typeof mentorFormSchema>) => {
    handleCreateMentor(data);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.role, filters.status]);

  const handleDeleteMentor = async (mentorId: string) => {
    if (!canDeleteMentor) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete mentors",
        variant: "destructive",
      });
      return;
    }

    if (confirm('Are you sure you want to delete this mentor? This action cannot be undone.')) {
      try {
        await deleteMentorTrigger(mentorId).unwrap();
        toast({
          title: "Success",
          description: "Mentor deleted successfully",
        });
      } catch (error: unknown) {
        toast({
          title: "Error",
          description: (error as { data?: { message?: string } })?.data?.message || "Failed to delete mentor",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 page-container">
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
          className="premium-card"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center ring-1 ring-border">
                  <Crown className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Mentors</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Sparkles className="w-4 h-4 text-foreground" />
                    <p className="text-muted-foreground">Premium mentor management system</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats Summary */}
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 premium-card rounded-lg">
                <p className="text-2xl font-bold text-foreground">{mentors.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center px-4 py-2 premium-card rounded-lg">
                <p className="text-2xl font-bold text-foreground">{mentors.filter(m => m.isActive).length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                console.log('Refreshing mentors with RTK Query...');
                refetch();
              }}
              className="btn-outline hover-lift flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Refresh ({mentors.length})
            </button>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <button
                  className={`btn-gradient hover-lift flex items-center gap-2 ${!canCreateMentor ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!canCreateMentor}
                  title={!canCreateMentor ? 'You do not have permission to create mentors' : 'Add new mentor'}
                >
                  <Plus className="w-4 h-4" />
                  Add Mentor
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card border border-white/10 p-6 rounded-xl">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                  <DialogTitle className="text-xl font-bold text-premium">Add New Mentor</DialogTitle>
                </div>
              </DialogHeader>
              <Form {...mentorForm}>
                <form onSubmit={mentorForm.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={mentorForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter mentor's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={mentorForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={mentorForm.control}
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
                    control={mentorForm.control}
                    name="domainRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Domain Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select domain" />
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
                        <FormLabel className="form-label">Expertise</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe technical expertise and skills..."
                            {...field}
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
                        <FormLabel className="form-label">Experience</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe work experience and background..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                      disabled={!mentorForm.formState.isValid}
                    >
                      {!mentorForm.formState.isValid ? 'Fill Required Fields' : 'Create Mentor'}
                    </button>
                  </div>
                </form>
              </Form>
            </DialogContent>
            </Dialog>
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
            <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center ring-1 ring-border">
              <Filter className="w-4 h-4 text-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Filter & Search</h2>
          </div>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                className="input-premium pl-10 w-full"
                placeholder="Search mentors by name, expertise, or domain..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
              <SelectTrigger className="w-[180px] input-premium">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="qa">QA</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-[180px] input-premium">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Premium Mentors Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 gradient-success rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-premium">Available Mentors</h2>
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">{mentors?.length || 0} Total</span>
              </div>

              {/* View Toggle Buttons */}
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'table'
                      ? 'bg-white/20 text-white'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/10'
                  }`}
                  title="Table View"
                >
                  <Table2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'card'
                      ? 'bg-white/20 text-white'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/10'
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Conditional Rendering: Table View or Card View */}
          {viewMode === 'table' ? (
            // TABLE VIEW
            <div className="premium-card overflow-hidden">
              {mentors && mentors.length > 0 ? (
                <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-white/70 uppercase tracking-wider">Name</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-white/70 uppercase tracking-wider">Domain</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-white/70 uppercase tracking-wider">Experience</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-white/70 uppercase tracking-wider">Status</th>
                        <th className="text-right py-4 px-6 text-sm font-semibold text-white/70 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Pagination logic for table view
                        const totalPages = Math.ceil(mentors.length / itemsPerPage);
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedMentors = mentors.slice(startIndex, endIndex);

                        return paginatedMentors.map((mentor, index) => (
                        <motion.tr
                          key={mentor.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          {/* Name Column with Avatar */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-white">
                                  {mentor.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'M'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-white">{mentor.user?.name || 'Unknown'}</p>
                                <p className="text-xs text-white/60">{mentor.user?.email || ''}</p>
                              </div>
                            </div>
                          </td>

                          {/* Domain Column */}
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 capitalize">
                              {mentor.user?.domainRole || 'Not assigned'}
                            </span>
                          </td>

                          {/* Experience Column */}
                          <td className="py-4 px-6">
                            <p className="text-sm text-white/80 line-clamp-2 max-w-xs">
                              {mentor.experience || 'No experience listed'}
                            </p>
                          </td>

                          {/* Status Column */}
                          <td className="py-4 px-6">
                            {mentor.isActive ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                                Inactive
                              </span>
                            )}
                          </td>

                          {/* Actions Column */}
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setLocation(`/mentors/${mentor.id}`)}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 text-white/70" />
                              </button>
                              {canEditMentor && (
                                <button
                                  onClick={() => setLocation(`/mentors/${mentor.id}/edit`)}
                                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                  title="Edit Mentor"
                                >
                                  <Edit className="w-4 h-4 text-blue-400" />
                                </button>
                              )}
                              {canDeleteMentor && (
                                <button
                                  onClick={() => handleDeleteMentor(mentor.id)}
                                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
                                  title="Delete Mentor"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))})()}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {mentors.length > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-white/60">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, mentors.length)} of {mentors.length} mentors
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/60">Show:</span>
                        <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                          setItemsPerPage(Number(value));
                          setCurrentPage(1);
                        }}>
                          <SelectTrigger className="w-[70px] h-8 bg-white/5 border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          currentPage === 1
                            ? 'bg-white/5 text-white/30 cursor-not-allowed'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.ceil(mentors.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(mentors.length / itemsPerPage), p + 1))}
                        disabled={currentPage === Math.ceil(mentors.length / itemsPerPage)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          currentPage === Math.ceil(mentors.length / itemsPerPage)
                            ? 'bg-white/5 text-white/30 cursor-not-allowed'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-premium mb-2">No mentors found</h3>
                  <p className="text-foreground-secondary mb-6">No mentors match your current search criteria</p>
                  <button
                    className="btn-gradient"
                    onClick={() => setFilters({ role: 'all', status: 'all', search: '' })}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            // CARD VIEW
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mentors && mentors.length > 0 ? mentors.map((mentor, index: number) => (
                <motion.div
                  key={mentor.id}
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
                  <MentorCard
                    mentor={mentor}
                    canEdit={canEditMentor}
                    canDelete={canDeleteMentor}
                  />
                </motion.div>
              )) : (
                <div className="col-span-full">
                  <div className="premium-card text-center py-16">
                    <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-premium mb-2">No mentors found</h3>
                    <p className="text-foreground-secondary mb-6">No mentors match your current search criteria</p>
                    <button
                      className="btn-gradient"
                      onClick={() => setFilters({ role: 'all', status: 'all', search: '' })}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
