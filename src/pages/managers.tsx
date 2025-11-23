import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Search, Shield, Filter, Users, LayoutGrid, Table2, Edit, Trash2, Crown, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from '@/api/usersApi';
import { useLocation } from 'wouter';
import type { UserRO } from '@/api/dto';

const managerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  domainRole: z.enum(['frontend', 'backend', 'fullstack', 'devops', 'qa', 'hr']),
});

const editManagerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  domainRole: z.enum(['frontend', 'backend', 'fullstack', 'devops', 'qa', 'hr']),
});

type ManagerFormData = z.infer<typeof managerFormSchema>;
type EditManagerFormData = z.infer<typeof editManagerFormSchema>;

export default function ManagersPage() {
  const [filters, setFilters] = useState({ search: '', domain: 'all' });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<UserRO | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect non-managers
  useEffect(() => {
    if (user && user.role !== 'manager') {
      toast({
        title: 'Access Denied',
        description: 'Only managers can access this page.',
        variant: 'destructive',
      });
      setLocation('/dashboard');
    }
  }, [user, setLocation, toast]);

  // Fetch managers only
  const { data: allUsers = [], isLoading, refetch } = useGetUsersQuery({
    role: 'manager',
    search: filters.search || undefined,
  });

  // Filter to only show managers
  const managers = allUsers.filter((u) => u.role === 'manager');

  // Apply domain filter
  const filteredManagers = filters.domain === 'all'
    ? managers
    : managers.filter(m => m.domainRole === filters.domain);

  const [createUserTrigger] = useCreateUserMutation();
  const [updateUserTrigger] = useUpdateUserMutation();
  const [deleteUserTrigger] = useDeleteUserMutation();

  const createForm = useForm<ManagerFormData>({
    resolver: zodResolver(managerFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      domainRole: 'fullstack',
    },
  });

  const editForm = useForm<EditManagerFormData>({
    resolver: zodResolver(editManagerFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      domainRole: 'fullstack',
    },
  });

  const handleCreateManager = async (data: ManagerFormData) => {
    try {
      await createUserTrigger({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'manager',
        domainRole: data.domainRole,
      }).unwrap();

      toast({
        title: 'Success',
        description: `${data.name} has been added as a manager.`,
      });

      setIsCreateDialogOpen(false);
      createForm.reset();
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to create manager',
        variant: 'destructive',
      });
    }
  };

  const handleEditManager = async (data: EditManagerFormData) => {
    if (!selectedManager) return;

    try {
      await updateUserTrigger({
        id: selectedManager.id,
        data: {
          name: data.name,
          email: data.email,
          domainRole: data.domainRole,
        },
      }).unwrap();

      toast({
        title: 'Success',
        description: `${data.name}'s information has been updated.`,
      });

      setIsEditDialogOpen(false);
      setSelectedManager(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to update manager',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteManager = async () => {
    if (!selectedManager) return;

    try {
      await deleteUserTrigger(selectedManager.id).unwrap();

      toast({
        title: 'Success',
        description: `${selectedManager.name} has been removed.`,
      });

      setIsDeleteDialogOpen(false);
      setSelectedManager(null);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.data?.message || 'Failed to delete manager',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (manager: UserRO) => {
    setSelectedManager(manager);
    editForm.reset({
      name: manager.name,
      email: manager.email,
      domainRole: manager.domainRole as any,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (manager: UserRO) => {
    setSelectedManager(manager);
    setIsDeleteDialogOpen(true);
  };

  const getDomainBadgeColor = (domain: string) => {
    const colors: Record<string, string> = {
      frontend: 'bg-blue-500/10 text-blue-400',
      backend: 'bg-green-500/10 text-green-400',
      fullstack: 'bg-purple-500/10 text-purple-400',
      devops: 'bg-orange-500/10 text-orange-400',
      qa: 'bg-yellow-500/10 text-yellow-400',
      hr: 'bg-pink-500/10 text-pink-400',
    };
    return colors[domain] || 'bg-gray-500/10 text-gray-400';
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.domain]);

  if (user?.role !== 'manager') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Pagination
  const totalPages = Math.ceil(filteredManagers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedManagers = filteredManagers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="content-responsive py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
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
                    <Shield className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Managers</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Sparkles className="w-4 h-4 text-foreground" />
                      <p className="text-muted-foreground">Administrator account management</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="flex items-center gap-4">
                <div className="text-center px-4 py-2 premium-card rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{managers.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center px-4 py-2 premium-card rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{managers.length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => refetch()}
                className="btn-outline hover-lift flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Refresh ({managers.length})
              </button>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <button className="btn-gradient hover-lift flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Manager
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card border border-white/10 p-6 rounded-xl">
                  <DialogHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <DialogTitle className="text-xl font-bold text-premium">Add New Manager</DialogTitle>
                    </div>
                  </DialogHeader>
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(handleCreateManager)} className="space-y-4">
                      <FormField
                        control={createForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-label">Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
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
                        control={createForm.control}
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
                        control={createForm.control}
                        name="domainRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="form-label">Domain Expertise</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select domain" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="frontend">Frontend</SelectItem>
                                <SelectItem value="backend">Backend</SelectItem>
                                <SelectItem value="fullstack">Fullstack</SelectItem>
                                <SelectItem value="devops">DevOps</SelectItem>
                                <SelectItem value="qa">QA</SelectItem>
                                <SelectItem value="hr">HR</SelectItem>
                              </SelectContent>
                            </Select>
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
                          disabled={!createForm.formState.isValid}
                        >
                          {!createForm.formState.isValid ? 'Fill Required Fields' : 'Create Manager'}
                        </button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {/* Filters */}
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
                  placeholder="Search managers by name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <Select value={filters.domain} onValueChange={(value) => setFilters({ ...filters, domain: value })}>
                <SelectTrigger className="w-[180px] input-premium">
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  <SelectItem value="frontend">Frontend</SelectItem>
                  <SelectItem value="backend">Backend</SelectItem>
                  <SelectItem value="fullstack">Fullstack</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="qa">QA</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Managers List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 gradient-success rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-premium">All Managers</h2>
              <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white">{filteredManagers.length} Total</span>
                </div>

                {/* View Toggle */}
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

            {viewMode === 'table' ? (
              <div className="premium-card overflow-hidden">
                {paginatedManagers.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-4 px-6 text-sm font-semibold text-white/70 uppercase tracking-wider">Name</th>
                            <th className="text-left py-4 px-6 text-sm font-semibold text-white/70 uppercase tracking-wider">Email</th>
                            <th className="text-left py-4 px-6 text-sm font-semibold text-white/70 uppercase tracking-wider">Domain</th>
                            <th className="text-left py-4 px-6 text-sm font-semibold text-white/70 uppercase tracking-wider">Status</th>
                            <th className="text-right py-4 px-6 text-sm font-semibold text-white/70 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedManagers.map((manager, index) => (
                            <motion.tr
                              key={manager.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-semibold text-white">
                                      {manager.name?.split(' ').map((n: string) => n[0]).join('') || 'M'}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">{manager.name || 'Unknown'}</p>
                                    <p className="text-xs text-white/60">Manager</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <p className="text-sm text-white/80">{manager.email}</p>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getDomainBadgeColor(manager.domainRole || 'fullstack')}`}>
                                  {manager.domainRole || 'N/A'}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                                  Active
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openEditDialog(manager)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                    title="Edit Manager"
                                  >
                                    <Edit className="w-4 h-4 text-blue-400" />
                                  </button>
                                  <button
                                    onClick={() => openDeleteDialog(manager)}
                                    disabled={manager.id === user?.id}
                                    className={`p-2 rounded-lg transition-colors ${
                                      manager.id === user?.id
                                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                        : 'bg-white/5 hover:bg-red-500/20'
                                    }`}
                                    title={manager.id === user?.id ? "Cannot delete yourself" : "Delete Manager"}
                                  >
                                    <Trash2 className={`w-4 h-4 ${manager.id === user?.id ? 'text-white/30' : 'text-red-400'}`} />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {filteredManagers.length > itemsPerPage && (
                      <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-white/60">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredManagers.length)} of {filteredManagers.length}
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
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white/10 text-white hover:bg-white/20'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              currentPage === totalPages
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
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-premium mb-2">No managers found</h3>
                    <p className="text-foreground-secondary mb-6">Add a new manager to get started</p>
                    <button
                      className="btn-gradient"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Manager
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Card View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedManagers.length > 0 ? paginatedManagers.map((manager, index) => (
                  <motion.div
                    key={manager.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      type: "spring",
                      bounce: 0.3
                    }}
                    className="hover-lift"
                  >
                    <div className="premium-card h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-lg font-semibold text-white">
                              {manager.name?.split(' ').map((n: string) => n[0]).join('') || 'M'}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{manager.name}</h3>
                            <p className="text-sm text-white/60">{manager.email}</p>
                          </div>
                        </div>
                        <Shield className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getDomainBadgeColor(manager.domainRole || 'fullstack')}`}>
                          {manager.domainRole || 'N/A'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                          Active
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditDialog(manager)}
                          className="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium text-white/80 hover:text-white flex items-center justify-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteDialog(manager)}
                          disabled={manager.id === user?.id}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            manager.id === user?.id
                              ? 'bg-white/5 text-white/30 cursor-not-allowed'
                              : 'bg-white/5 hover:bg-red-500/20 text-red-400'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="col-span-full">
                    <div className="premium-card text-center py-16">
                      <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-premium mb-2">No managers found</h3>
                      <p className="text-foreground-secondary mb-6">Add a new manager to get started</p>
                      <button
                        className="btn-gradient"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Manager
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-card border border-white/10 p-6 rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Edit className="w-4 h-4 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-premium">Edit Manager</DialogTitle>
            </div>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditManager)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="domainRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label">Domain Expertise</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="frontend">Frontend</SelectItem>
                        <SelectItem value="backend">Backend</SelectItem>
                        <SelectItem value="fullstack">Fullstack</SelectItem>
                        <SelectItem value="devops">DevOps</SelectItem>
                        <SelectItem value="qa">QA</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-gradient">
                  Save Changes
                </button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border border-white/10 p-6 rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-400" />
              </div>
              <DialogTitle className="text-xl font-bold text-premium">Delete Manager</DialogTitle>
            </div>
          </DialogHeader>
          <p className="text-white/70 mb-6">
            Are you sure you want to delete <strong className="text-white">{selectedManager?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              className="px-6 py-2.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 text-white/80 hover:text-white"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 transition-colors text-white font-medium"
              onClick={handleDeleteManager}
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
