import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Shield, Edit, Trash2, Eye, LayoutGrid, Table2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useGetUsersQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from '@/api/usersApi';
import { useLocation } from 'wouter';
import type { UserRO } from '@/api/dto';

const managerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  domainRole: z.enum(['frontend', 'backend', 'fullstack', 'devops', 'qa', 'hr']),
});

type ManagerFormData = z.infer<typeof managerFormSchema>;

export default function ManagersPage() {
  const [filters, setFilters] = useState({ search: '' });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<UserRO | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
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

  const [createUserTrigger] = useCreateUserMutation();
  const [updateUserTrigger] = useUpdateUserMutation();
  const [deleteUserTrigger] = useDeleteUserMutation();

  const createForm = useForm<ManagerFormData>({
    resolver: zodResolver(managerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      domainRole: 'fullstack',
    },
  });

  const editForm = useForm<ManagerFormData>({
    resolver: zodResolver(managerFormSchema.omit({ password: true })),
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
        title: 'Manager Created',
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

  const handleEditManager = async (data: ManagerFormData) => {
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
        title: 'Manager Updated',
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
        title: 'Manager Deleted',
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
      frontend: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      backend: 'bg-green-500/20 text-green-300 border-green-500/30',
      fullstack: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      devops: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      qa: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      hr: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    };
    return colors[domain] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  if (user?.role !== 'manager') {
    return null;
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="content-responsive py-4 sm:py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-400" />
              Managers
            </h1>
            <p className="text-white/60 mt-1">Manage administrator accounts</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Manager
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Manager</DialogTitle>
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
                          <Input type="email" placeholder="Enter email" {...field} />
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
                          <Input type="password" placeholder="Create password (min 8 chars)" {...field} />
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
                            <SelectItem value="frontend">Frontend Development</SelectItem>
                            <SelectItem value="backend">Backend Development</SelectItem>
                            <SelectItem value="fullstack">Fullstack Development</SelectItem>
                            <SelectItem value="devops">DevOps</SelectItem>
                            <SelectItem value="qa">Quality Assurance</SelectItem>
                            <SelectItem value="hr">Human Resources</SelectItem>
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
                    <Button type="submit" className="gradient-primary">
                      Create Manager
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        >
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search managers..."
              className="pl-10 bg-white/5 border-white/10"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <Table2 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : managers.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <Shield className="w-16 h-16 text-white/20 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No managers found</h3>
              <p className="text-white/60">Add a new manager to get started.</p>
            </CardContent>
          </Card>
        ) : viewMode === 'table' ? (
          <Card className="bg-white/5 border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/60">Name</TableHead>
                  <TableHead className="text-white/60">Email</TableHead>
                  <TableHead className="text-white/60">Domain</TableHead>
                  <TableHead className="text-white/60">Status</TableHead>
                  <TableHead className="text-white/60 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map((manager) => (
                  <TableRow key={manager.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={manager.avatarUrl || undefined} />
                          <AvatarFallback className="bg-purple-500/20 text-purple-300">
                            {manager.name?.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-white">{manager.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white/70">{manager.email}</TableCell>
                    <TableCell>
                      <Badge className={getDomainBadgeColor(manager.domainRole || 'fullstack')}>
                        {manager.domainRole || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(manager)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(manager)}
                          className="text-red-400 hover:text-red-300"
                          disabled={manager.id === user?.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {managers.map((manager) => (
              <motion.div
                key={manager.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={manager.avatarUrl || undefined} />
                          <AvatarFallback className="bg-purple-500/20 text-purple-300">
                            {manager.name?.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-white">{manager.name}</h3>
                          <p className="text-sm text-white/60">{manager.email}</p>
                        </div>
                      </div>
                      <Shield className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={getDomainBadgeColor(manager.domainRole || 'fullstack')}>
                        {manager.domainRole || 'N/A'}
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
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
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => openDeleteDialog(manager)}
                        disabled={manager.id === user?.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Manager</DialogTitle>
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
                          <SelectItem value="frontend">Frontend Development</SelectItem>
                          <SelectItem value="backend">Backend Development</SelectItem>
                          <SelectItem value="fullstack">Fullstack Development</SelectItem>
                          <SelectItem value="devops">DevOps</SelectItem>
                          <SelectItem value="qa">Quality Assurance</SelectItem>
                          <SelectItem value="hr">Human Resources</SelectItem>
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
                  <Button type="submit" className="gradient-primary">
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Manager</DialogTitle>
            </DialogHeader>
            <p className="text-white/70">
              Are you sure you want to delete <strong>{selectedManager?.name}</strong>? This action cannot be undone.
            </p>
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
    </div>
  );
}
