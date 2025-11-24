import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BookOpen,
  Video,
  FileText,
  ExternalLink,
  Download,
  Play,
  Bookmark,
  Share2,
  Clock,
  Plus,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import FilterBar from '@/components/FilterBar';
import LoadingSpinner from '@/components/ui/loading-spinner';
import AddResourceModal from '@/components/AddResourceModal';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'documentation' | 'video' | 'article' | 'tool' | 'course';
  category: string;
  url: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  author?: string;
  rating?: number;
  isBookmarked?: boolean;
}

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isLoading = useSelector((state: RootState) => state.resources.loading);

  useEffect(() => {
    const mockResources: Resource[] = [
      {
        id: '1',
        title: 'React Fundamentals',
        description: 'Complete guide to React basics and core concepts',
        type: 'course',
        category: 'frontend',
        url: 'https://react.dev/learn',
        tags: ['react', 'javascript', 'frontend'],
        difficulty: 'beginner',
        duration: '4 hours',
        author: 'React Team',
        rating: 4.8,
        isBookmarked: false
      },
      {
        id: '2',
        title: 'TypeScript Handbook',
        description: 'Official TypeScript documentation and tutorials',
        type: 'documentation',
        category: 'frontend',
        url: 'https://www.typescriptlang.org/docs/',
        tags: ['typescript', 'javascript', 'frontend'],
        difficulty: 'intermediate',
        author: 'Microsoft',
        rating: 4.9,
        isBookmarked: true
      },
      {
        id: '3',
        title: 'Node.js Best Practices',
        description: 'Comprehensive guide to Node.js development patterns',
        type: 'article',
        category: 'backend',
        url: 'https://github.com/goldbergyoni/nodebestpractices',
        tags: ['nodejs', 'backend', 'javascript'],
        difficulty: 'advanced',
        author: 'Yoni Goldberg',
        rating: 4.7,
        isBookmarked: false
      },
      {
        id: '4',
        title: 'Docker for Beginners',
        description: 'Learn Docker containerization from scratch',
        type: 'video',
        category: 'devops',
        url: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
        tags: ['docker', 'devops', 'containers'],
        difficulty: 'beginner',
        duration: '2 hours',
        author: 'TechWorld with Nana',
        rating: 4.6,
        isBookmarked: false
      },
      {
        id: '5',
        title: 'Testing with Jest',
        description: 'Complete testing guide using Jest framework',
        type: 'course',
        category: 'qa',
        url: 'https://jestjs.io/docs/getting-started',
        tags: ['testing', 'jest', 'javascript'],
        difficulty: 'intermediate',
        duration: '3 hours',
        author: 'Jest Team',
        rating: 4.5,
        isBookmarked: false
      },
      {
        id: '6',
        title: 'Git Workflow Guide',
        description: 'Best practices for Git workflow and collaboration',
        type: 'documentation',
        category: 'devops',
        url: 'https://git-scm.com/book/en/v2',
        tags: ['git', 'version-control', 'collaboration'],
        difficulty: 'intermediate',
        author: 'Git Team',
        rating: 4.8,
        isBookmarked: true
      }
    ];

    setResources(mockResources);
    setFilteredResources(mockResources);
  }, []);

  useEffect(() => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(resource => resource.difficulty === selectedDifficulty);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    setFilteredResources(filtered);
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedType, resources]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'documentation':
        return <FileText className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'article':
        return <BookOpen className="h-4 w-4" />;
      case 'course':
        return <Play className="h-4 w-4" />;
      case 'tool':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getDifficultyBadgeClass = (difficulty: string) => {
    const classes: Record<string, string> = {
      beginner: 'bg-green-500/10 text-green-600 border-green-500/20',
      intermediate: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      advanced: 'bg-red-500/10 text-red-600 border-red-500/20',
    };
    return classes[difficulty] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  };

  const handleBookmark = (resourceId: string) => {
    setResources(prev => prev.map(resource =>
      resource.id === resourceId
        ? { ...resource, isBookmarked: !resource.isBookmarked }
        : resource
    ));
  };

  const handleShare = async (resource: Resource) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url: resource.url,
        });
      } else {
        await navigator.clipboard.writeText(resource.url);
      }
    } catch (error) {
      console.error('Error sharing resource:', error);
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      window.open(resource.url, '_blank');
    } catch (error) {
      console.error('Error downloading resource:', error);
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
        icon={BookOpen}
        title="Resources"
        description="Learning materials, documentation, and tools"
        stats={[
          { label: 'Total', value: resources.length },
          { label: 'Categories', value: new Set(resources.map(r => r.category)).size },
        ]}
        actions={
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
        }
      />

      {/* Standardized Filter Bar */}
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search resources..."
        filters={
          <>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="devops">DevOps</SelectItem>
                <SelectItem value="qa">QA</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="course">Course</SelectItem>
                <SelectItem value="tool">Tool</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      {/* Main Content */}
      <div className="p-6">
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="group hover:border-primary/50 transition-all h-full flex flex-col">
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {getTypeIcon(resource.type)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {resource.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleBookmark(resource.id)}
                      >
                        <Bookmark className={`h-4 w-4 ${resource.isBookmarked ? 'fill-current text-yellow-500' : 'text-muted-foreground'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleShare(resource)}
                      >
                        <Share2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
                    {resource.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-xs capitalize ${getDifficultyBadgeClass(resource.difficulty)}`}>
                        {resource.difficulty}
                      </Badge>
                      {resource.rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <span className="font-medium">{resource.rating}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      )}
                    </div>

                    {resource.duration && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{resource.duration}</span>
                      </div>
                    )}

                    {resource.author && (
                      <p className="text-xs text-muted-foreground">
                        By {resource.author}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    <Button asChild className="flex-1" size="sm">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Open
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(resource)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">No resources found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search criteria or filters
              </p>
            </div>
          </Card>
        )}
      </div>

      <AddResourceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
