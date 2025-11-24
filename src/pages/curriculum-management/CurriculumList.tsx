import { useState } from 'react';
import { Link } from 'wouter';
import { useGetAllCurriculumsQuery, useDeleteCurriculumMutation, usePublishCurriculumMutation } from '@/api/curriculumManagementApi';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GraduationCap, Plus, FileText, Edit, Trash2, CheckCircle, Clock, Archive, Eye, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function CurriculumList() {
  const [filters, setFilters] = useState({
    domainRole: 'all',
    status: 'all',
    search: '',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(null);

  const { data: curriculums = [], isLoading, isError } = useGetAllCurriculumsQuery({
    domainRole: filters.domainRole !== 'all' ? filters.domainRole : undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
  });

  const [deleteCurriculum, { isLoading: isDeleting }] = useDeleteCurriculumMutation();
  const [publishCurriculum, { isLoading: isPublishing }] = usePublishCurriculumMutation();
  const { toast } = useToast();

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDelete = async () => {
    if (!selectedCurriculum) return;

    try {
      await deleteCurriculum(selectedCurriculum).unwrap();
      toast({
        title: 'Success',
        description: 'Curriculum deleted successfully',
      });
      setDeleteDialogOpen(false);
      setSelectedCurriculum(null);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete curriculum',
        variant: 'destructive',
      });
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishCurriculum(id).unwrap();
      toast({
        title: 'Success',
        description: 'Curriculum published successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to publish curriculum',
        variant: 'destructive',
      });
    }
  };

  const filteredCurriculums = curriculums.filter((curr: any) =>
    filters.search
      ? curr.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        curr.description?.toLowerCase().includes(filters.search.toLowerCase())
      : true
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20" variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Published</Badge>;
      case 'draft':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'archived':
        return <Badge variant="outline"><Archive className="h-3 w-3 mr-1" />Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen w-full">
      {/* Standardized Page Header */}
      <PageHeader
        icon={GraduationCap}
        title="Curriculum Management"
        description="Create and manage learning curriculums"
        stats={[
          { label: 'Total', value: curriculums.length },
          { label: 'Published', value: curriculums.filter((c: any) => c.status === 'published').length },
        ]}
        actions={
          <Link href="/curriculum-management/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Curriculum
            </Button>
          </Link>
        }
      />

      {/* Standardized Filter Bar */}
      <FilterBar
        searchValue={filters.search}
        onSearchChange={(value) => handleFilterChange('search', value)}
        searchPlaceholder="Search curriculums..."
        filters={
          <>
            <Select value={filters.domainRole} onValueChange={(value) => handleFilterChange('domainRole', value)}>
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

            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      {/* Main Content */}
      <div className="p-6">
        {isError ? (
          <Card>
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">Error loading curriculums</h3>
              <p className="text-sm text-muted-foreground">Please try again later</p>
            </div>
          </Card>
        ) : filteredCurriculums.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                {filters.search || filters.domainRole !== 'all' || filters.status !== 'all'
                  ? 'No curriculums found'
                  : 'No curriculums yet'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {filters.search || filters.domainRole !== 'all' || filters.status !== 'all'
                  ? 'Try adjusting your filters to see more results'
                  : 'Create your first curriculum to get started'}
              </p>
              {!filters.search && filters.domainRole === 'all' && filters.status === 'all' && (
                <Link href="/curriculum-management/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Curriculum
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCurriculums.map((curriculum: any) => (
              <Card key={curriculum.id} className="overflow-hidden hover:border-primary/50 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-foreground truncate">
                        {curriculum.name}
                      </CardTitle>
                      <CardDescription className="mt-1 text-sm capitalize">
                        {curriculum.domainRole}
                      </CardDescription>
                    </div>
                    {getStatusBadge(curriculum.status)}
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {curriculum.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{curriculum.totalWeeks} weeks</span>
                    <span className="text-xs">v{curriculum.version}</span>
                  </div>

                  {curriculum.tags && curriculum.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {curriculum.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {curriculum.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{curriculum.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="border-t pt-3 flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground w-full">
                    Updated: {new Date(curriculum.updatedAt).toLocaleDateString()}
                  </span>

                  <div className="flex gap-2 w-full flex-wrap">
                    <Link href={`/curriculum-management/${curriculum.id}/view`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </Link>

                    <Link href={`/curriculum/${curriculum.id}/submissions`}>
                      <Button variant="outline" size="sm">
                        <ClipboardList className="h-3 w-3 mr-1" />
                        Submissions
                      </Button>
                    </Link>

                    <Link href={`/curriculum-management/${curriculum.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </Link>

                    {curriculum.status === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => handlePublish(curriculum.id)}
                        disabled={isPublishing}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Publish
                      </Button>
                    )}

                    <Dialog open={deleteDialogOpen && selectedCurriculum === curriculum.id} onOpenChange={(open) => {
                      setDeleteDialogOpen(open);
                      if (!open) setSelectedCurriculum(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCurriculum(curriculum.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Curriculum</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete "{curriculum.name}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {
                            setDeleteDialogOpen(false);
                            setSelectedCurriculum(null);
                          }}>
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
}
