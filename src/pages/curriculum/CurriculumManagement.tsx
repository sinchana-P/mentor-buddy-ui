/**
 * Curriculum Management Dashboard
 * For Managers & Mentors to manage curriculum templates
 */

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  useGetCurriculumsQuery,
  useDeleteCurriculumMutation,
  useDuplicateCurriculumMutation,
  usePublishCurriculumMutation,
  useUnpublishCurriculumMutation,
} from '@/api/curriculum/curriculumApi';
import type { Curriculum, CurriculumFilters, DomainRole, CurriculumStatus } from '@/types/curriculum';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  BookOpen,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  Archive,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  Clock,
  ClipboardList,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CurriculumManagement() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Filters
  const [filters, setFilters] = useState<CurriculumFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // API
  const { data: curriculums = [], isLoading } = useGetCurriculumsQuery(filters);
  const [deleteCurriculum] = useDeleteCurriculumMutation();
  const [duplicateCurriculum] = useDuplicateCurriculumMutation();
  const [publishCurriculum] = usePublishCurriculumMutation();
  const [unpublishCurriculum] = useUnpublishCurriculumMutation();

  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; curriculum?: Curriculum }>({
    open: false,
  });

  // Filter curriculums by search term
  const filteredCurriculums = curriculums.filter((curriculum) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      curriculum.name.toLowerCase().includes(search) ||
      curriculum.description.toLowerCase().includes(search) ||
      curriculum.domainRole.toLowerCase().includes(search)
    );
  });

  const handleDelete = async () => {
    if (!deleteDialog.curriculum) return;

    try {
      await deleteCurriculum(deleteDialog.curriculum.id).unwrap();
      toast({
        title: 'Curriculum deleted',
        description: 'The curriculum has been successfully deleted.',
      });
      setDeleteDialog({ open: false });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete curriculum. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async (curriculum: Curriculum) => {
    try {
      await duplicateCurriculum(curriculum.id).unwrap();
      toast({
        title: 'Curriculum duplicated',
        description: `Created a copy of "${curriculum.name}".`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate curriculum.',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublish = async (curriculum: Curriculum) => {
    try {
      if (curriculum.status === 'published') {
        await unpublishCurriculum(curriculum.id).unwrap();
        toast({
          title: 'Curriculum unpublished',
          description: 'The curriculum is now in draft mode.',
        });
      } else {
        await publishCurriculum(curriculum.id).unwrap();
        toast({
          title: 'Curriculum published',
          description: 'The curriculum is now live and will be auto-assigned to new buddies.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update curriculum status.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: CurriculumStatus) => {
    const variants = {
      draft: 'secondary',
      published: 'default',
      archived: 'outline',
    } as const;

    const icons = {
      draft: <FileText className="h-3 w-3 mr-1" />,
      published: <CheckCircle2 className="h-3 w-3 mr-1" />,
      archived: <Archive className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getDomainColor = (domain: DomainRole) => {
    const colors: Record<DomainRole, string> = {
      frontend: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      backend: 'bg-green-500/10 text-green-500 border-green-500/20',
      fullstack: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      devops: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      qa: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      hr: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    };
    return colors[domain] || colors.frontend;
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Curriculum Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage reusable curriculum templates for your buddies
          </p>
        </div>
        <Button onClick={() => navigate('/curriculum/new')} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Create Curriculum
        </Button>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search curriculums by name, domain, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.domainRole || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  domainRole: value === 'all' ? undefined : (value as DomainRole),
                })
              }
            >
              <SelectTrigger className="w-full md:w-[200px]">
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
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  status: value === 'all' ? undefined : (value as CurriculumStatus),
                })
              }
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Curriculum List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-4">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCurriculums.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No curriculums found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filters.domainRole || filters.status
                ? 'Try adjusting your filters'
                : 'Get started by creating your first curriculum'}
            </p>
            {!searchTerm && !filters.domainRole && !filters.status && (
              <Button onClick={() => navigate('/curriculum/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Curriculum
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCurriculums.map((curriculum) => (
            <Card
              key={curriculum.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                      {curriculum.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`border ${getDomainColor(curriculum.domainRole)}`}>
                        {curriculum.domainRole}
                      </Badge>
                      {getStatusBadge(curriculum.status)}
                      <span className="text-xs text-muted-foreground">v{curriculum.version}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/curriculum/${curriculum.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/curriculum/${curriculum.id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/curriculum/${curriculum.id}/submissions`)}>
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Submissions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(curriculum)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleTogglePublish(curriculum)}>
                        {curriculum.status === 'published' ? (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteDialog({ open: true, curriculum })}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {curriculum.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{curriculum.totalWeeks} weeks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{curriculum.weeks?.length || 0} tasks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>0 buddies</span>
                  </div>
                </div>
                <div className="pt-3 border-t text-xs text-muted-foreground">
                  Last modified {formatDistanceToNow(new Date(curriculum.updatedAt), { addSuffix: true })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Curriculum?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.curriculum?.name}"? This action cannot
              be undone and will affect all buddies enrolled in this curriculum.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
