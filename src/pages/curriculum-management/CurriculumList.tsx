import React, { useState } from 'react';
import { Link } from 'wouter';
import { useGetAllCurriculumsQuery, useDeleteCurriculumMutation, usePublishCurriculumMutation } from '@/api/curriculumManagementApi';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, FileText, Edit, Trash2, CheckCircle, Clock, Archive, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
    } catch (error) {
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
    } catch (error) {
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
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Published</Badge>;
      case 'draft':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      case 'archived':
        return <Badge variant="outline"><Archive className="h-3 w-3 mr-1" />Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="w-full px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Curriculum Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage learning curriculums</p>
          </div>

          <Link href="/curriculum-management/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Curriculum
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search curriculums..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Select value={filters.domainRole} onValueChange={(value) => handleFilterChange('domainRole', value)}>
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[180px]">
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
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading curriculums...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <p className="text-destructive">Error loading curriculums. Please try again.</p>
          </div>
        ) : filteredCurriculums.length === 0 ? (
          <Card className="py-16">
            <CardContent className="text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {filters.search || filters.domainRole !== 'all' || filters.status !== 'all'
                  ? 'No curriculums found'
                  : 'No curriculums yet'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {filters.search || filters.domainRole !== 'all' || filters.status !== 'all'
                  ? 'Try adjusting your filters to see more results'
                  : 'Create your first curriculum to get started with building learning paths'}
              </p>
              {!filters.search && filters.domainRole === 'all' && filters.status === 'all' && (
                <Link href="/curriculum-management/create">
                  <Button size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Curriculum
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCurriculums.map((curriculum: any) => (
              <Card key={curriculum.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-foreground truncate">
                        {curriculum.name}
                      </CardTitle>
                      <CardDescription className="mt-1.5 text-sm">
                        {curriculum.domainRole.charAt(0).toUpperCase() + curriculum.domainRole.slice(1)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(curriculum.status)}
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                    {curriculum.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="font-medium">{curriculum.totalWeeks} weeks</span>
                    <span className="font-mono text-xs">v{curriculum.version}</span>
                  </div>

                  {curriculum.tags && curriculum.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {curriculum.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                      {curriculum.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          +{curriculum.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="bg-muted/30 border-t pt-4 pb-4 flex flex-col gap-3">
                  <span className="text-xs text-muted-foreground w-full">
                    Updated: {new Date(curriculum.updatedAt).toLocaleDateString()}
                  </span>

                  <div className="flex gap-2 w-full">
                    <Link href={`/curriculum-management/${curriculum.id}/view`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>

                    <Link href={`/curriculum-management/${curriculum.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>

                    {curriculum.status === 'draft' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handlePublish(curriculum.id)}
                        disabled={isPublishing}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
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
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Curriculum</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete "{curriculum.name}"? This action cannot be undone and will remove all associated weeks and tasks.
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
    </Layout>
  );
}
