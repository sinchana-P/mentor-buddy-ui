import { useState } from 'react';
import { Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetCurriculumsQuery, useCreateCurriculumMutation } from '@/api/curriculum/curriculumApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { GraduationCap, Plus, FileText, Edit, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  domainRole: z.enum(['frontend', 'backend', 'fullstack', 'devops', 'qa', 'hr']),
  totalWeeks: z.number().min(1, { message: 'Must have at least 1 week' }).max(52, { message: 'Maximum 52 weeks' }),
});

export default function CurriculumPage() {
  const [filters, setFilters] = useState({
    domain: 'all',
    search: '',
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const { data: curriculum = [], isLoading, isError } = useGetCurriculumsQuery({
    domainRole: filters.domain !== 'all' ? filters.domain as any : undefined,
    search: filters.search || undefined,
  });
  
  const [createCurriculum, { isLoading: isCreating }] = useCreateCurriculumMutation();
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      domainRole: 'frontend' as const,
      totalWeeks: 5,
    },
  });
  
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await createCurriculum(data).unwrap();
      
      toast({
        title: 'Success',
        description: 'Curriculum item created successfully',
      });
      
      form.reset();
      setIsAddDialogOpen(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create curriculum item',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
      <div className="min-h-screen w-full">
        {/* Standardized Page Header */}
        <PageHeader
          icon={GraduationCap}
          title="Curriculum Management"
          description="Manage curriculum items and learning paths"
          stats={[
            { label: 'Total', value: curriculum.length },
            { label: 'Domains', value: new Set(curriculum.map(c => c.domainRole)).size },
          ]}
          actions={
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Curriculum
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Curriculum</DialogTitle>
                <DialogDescription>
                  Create a new curriculum item for mentors and buddies.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter curriculum name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter a brief description" 
                            {...field} 
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="domainRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domain</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="totalWeeks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Weeks</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="5"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create Curriculum'}
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
          onSearchChange={(value) => handleFilterChange('search', value)}
          searchPlaceholder="Search curriculum..."
          filters={
            <Select value={filters.domain} onValueChange={(value) => handleFilterChange('domain', value)}>
              <SelectTrigger className="w-[140px]">
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
          }
        />

        {/* Main Content */}
        <div className="p-6">
          {isError ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">Error loading curriculum</h3>
              <p className="text-sm text-muted-foreground">Please try again later</p>
            </div>
          ) : curriculum.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">No curriculum items found</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first curriculum item to get started</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Curriculum
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {curriculum.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:border-primary/50 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{item.name}</CardTitle>
                        <CardDescription className="mt-1 capitalize">
                          {item.domainRole} · {item.totalWeeks} weeks
                        </CardDescription>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  </CardContent>
                  <CardFooter className="border-t pt-3 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <Link href={`/curriculum/${item.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}