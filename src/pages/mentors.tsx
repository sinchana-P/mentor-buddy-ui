import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import MentorCard from '@/components/MentorCard';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import { Plus, UserCheck, LayoutGrid, Table2, Eye, Edit, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
// RTK Query hooks following your reference pattern
import { useGetMentorsQuery, useCreateMentorMutation, useDeleteMentorMutation } from '@/api/mentorsApi';
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

  // Get permissions and user role
  const { canCreateMentor, canEditMentor, canDeleteMentor } = usePermissions();
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role;
  const canViewDetails = userRole === 'manager' || userRole === 'mentor';

  // Following your reference pattern: useSelector to read from store (commented out unused vars)
  // const mentorsFromStore = useSelector((state: RootState) => state.mentors.mentors);
  // const selectedMentor = useSelector((state: RootState) => state.mentors.selectedMentor);
  // const storeFilters = useSelector((state: RootState) => state.mentors.filters);
  // const storeLoading = useSelector((state: RootState) => state.mentors.loading);
  const storeError = useSelector((state: RootState) => state.mentors.error);

  // RTK Query hooks following your reference pattern
  const { data: mentors = [], isLoading, error } = useGetMentorsQuery({
    domain: filters.role !== 'all' ? filters.role : undefined,
    search: filters.search || undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
  });

  // Following your pattern: const [createTrigger] = useCreateMutation()
  const [createMentorTrigger] = useCreateMentorMutation();
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
    <div className="min-h-screen w-full">
      {/* Standardized Page Header */}
      <PageHeader
        icon={Users}
        title="Mentors"
        description="Manage mentors and track their performance"
        stats={[
          { label: 'Total', value: mentors.length },
          { label: 'Active', value: mentors.filter(m => m.isActive).length },
        ]}
        actions={
          canCreateMentor && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Mentor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
          )
        }
      />

      {/* Standardized Filter Bar */}
      <FilterBar
        searchValue={filters.search}
        onSearchChange={(value) => handleFilterChange('search', value)}
        searchPlaceholder="Search mentors by name, expertise, or domain..."
        filters={
          <>
            <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
              <SelectTrigger className="w-[140px]">
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
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
        actions={
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8"
            >
              <Table2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="h-8"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="p-6">

          {/* Conditional Rendering: Table View or Card View */}
          {viewMode === 'table' ? (
            // TABLE VIEW
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              {mentors && mentors.length > 0 ? (
                <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Domain</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Experience</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Pagination logic for table view
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const paginatedMentors = mentors.slice(startIndex, endIndex);

                        return paginatedMentors.map((mentor) => (
                        <tr
                          key={mentor.id}
                          className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => setLocation(`/mentors/${mentor.id}`)}
                        >
                          {/* Name Column with Avatar */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-primary">
                                  {mentor.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'M'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{mentor.user?.name || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">{mentor.user?.email || ''}</p>
                              </div>
                            </div>
                          </td>

                          {/* Domain Column */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 capitalize border border-blue-500/20">
                              {mentor.user?.domainRole || 'Not assigned'}
                            </span>
                          </td>

                          {/* Experience Column */}
                          <td className="py-3 px-4">
                            <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                              {mentor.experience || 'No experience listed'}
                            </p>
                          </td>

                          {/* Status Column */}
                          <td className="py-3 px-4">
                            {mentor.isActive ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20">
                                Inactive
                              </span>
                            )}
                          </td>

                          {/* Actions Column */}
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-1">
                              {canViewDetails && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLocation(`/mentors/${mentor.id}`);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              {canEditMentor && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLocation(`/mentors/${mentor.id}/edit`);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              {canDeleteMentor && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMentor(mentor.id);
                                  }}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))})()}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {mentors.length > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, mentors.length)} of {mentors.length} mentors
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Show:</span>
                        <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                          setItemsPerPage(Number(value));
                          setCurrentPage(1);
                        }}>
                          <SelectTrigger className="w-[70px] h-8">
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.ceil(mentors.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(mentors.length / itemsPerPage), p + 1))}
                        disabled={currentPage === Math.ceil(mentors.length / itemsPerPage)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-2">No mentors found</h3>
                  <p className="text-sm text-muted-foreground mb-4">No mentors match your current search criteria</p>
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ role: 'all', status: 'all', search: '' })}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // CARD VIEW
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentors && mentors.length > 0 ? mentors.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  canEdit={canEditMentor}
                  canDelete={canDeleteMentor}
                  canViewDetails={canViewDetails}
                />
              )) : (
                <div className="col-span-full">
                  <div className="bg-card border border-border rounded-lg text-center py-12">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">No mentors found</h3>
                    <p className="text-sm text-muted-foreground mb-4">No mentors match your current search criteria</p>
                    <Button
                      variant="outline"
                      onClick={() => setFilters({ role: 'all', status: 'all', search: '' })}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
