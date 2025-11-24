import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Shield, Edit, Trash2, LayoutGrid, Table2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from '@/api/usersApi';
import { useLocation } from 'wouter';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import LoadingSpinner from '@/components/ui/loading-spinner';
import type { UserRO } from '@/api/dto';

interface CreateUserPayload extends Partial<UserRO> {
  password?: string;
}

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
      } as CreateUserPayload).unwrap();

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

  const getDomainBadgeClass = (domain: string) => {
    const classes: Record<string, string> = {
      frontend: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      backend: 'bg-green-500/10 text-green-600 border-green-500/20',
      fullstack: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      devops: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      qa: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      hr: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    };
    return classes[domain] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
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
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Pagination
  const totalPages = Math.ceil(filteredManagers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedManagers = filteredManagers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen w-full">
      {/* Standardized Page Header */}
      <PageHeader
        icon={Shield}
        title="Managers"
        description="Administrator account management"
        stats={[
          { label: 'Total', value: managers.length },
          { label: 'Active', value: managers.length },
        ]}
        actions={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Manager
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Manager</DialogTitle>
                <DialogDescription>
                  Create a new manager account with admin privileges.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(handleCreateManager)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
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
                        <FormLabel>Email</FormLabel>
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Min 8 characters" {...field} />
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
                        <FormLabel>Domain Expertise</FormLabel>
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
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!createForm.formState.isValid}>
                      Create Manager
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Standardized Filter Bar */}
      <FilterBar
        searchValue={filters.search}
        onSearchChange={(value) => setFilters({ ...filters, search: value })}
        searchPlaceholder="Search managers by name or email..."
        filters={
          <Select value={filters.domain} onValueChange={(value) => setFilters({ ...filters, domain: value })}>
            <SelectTrigger className="w-[140px]">
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
        }
        actions={
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('table')}
            >
              <Table2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'card' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="p-6">
        {viewMode === 'table' ? (
          <Card>
            {paginatedManagers.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Domain</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedManagers.map((manager) => (
                        <tr
                          key={manager.id}
                          className="border-b border-border hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-primary">
                                  {manager.name?.split(' ').map((n: string) => n[0]).join('') || 'M'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{manager.name || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">Manager</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-muted-foreground">{manager.email}</p>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={`text-xs capitalize ${getDomainBadgeClass(manager.domainRole || 'fullstack')}`}>
                              {manager.domainRole || 'N/A'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                              Active
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(manager)}
                              >
                                <Edit className="h-4 w-4 text-muted-foreground" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openDeleteDialog(manager)}
                                disabled={manager.id === user?.id}
                              >
                                <Trash2 className={`h-4 w-4 ${manager.id === user?.id ? 'text-muted' : 'text-destructive'}`} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredManagers.length > itemsPerPage && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredManagers.length)} of {filteredManagers.length}
                      </p>
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
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8"
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
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
                  <Shield className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">No managers found</h3>
                <p className="text-sm text-muted-foreground mb-4">Add a new manager to get started</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Manager
                </Button>
              </div>
            )}
          </Card>
        ) : (
          // Card View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedManagers.length > 0 ? paginatedManagers.map((manager) => (
              <Card key={manager.id} className="hover:border-primary/50 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {manager.name?.split(' ').map((n: string) => n[0]).join('') || 'M'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{manager.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{manager.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className={`text-xs capitalize ${getDomainBadgeClass(manager.domainRole || 'fullstack')}`}>
                      {manager.domainRole || 'N/A'}
                    </Badge>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                      Active
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(manager)}
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(manager)}
                      disabled={manager.id === user?.id}
                      className={manager.id === user?.id ? '' : 'text-destructive hover:text-destructive'}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full">
                <Card>
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">No managers found</h3>
                    <p className="text-sm text-muted-foreground mb-4">Add a new manager to get started</p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Manager
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Manager</DialogTitle>
            <DialogDescription>
              Update manager information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditManager)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
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
                    <FormLabel>Email</FormLabel>
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
                    <FormLabel>Domain Expertise</FormLabel>
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Manager</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedManager?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteManager}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
