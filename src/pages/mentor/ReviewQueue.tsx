import { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { useSelector } from 'react-redux';
import { useGetMentorsQuery } from '@/api/mentorsApi';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Clock,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  Calendar,
  Search,
  Filter,
  BookOpen,
  Users
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetMentorAssignedBuddiesQuery, useGetMentorReviewQueueQuery } from '@/api/submissionApi';

// Define types locally to avoid ESM import issues
interface SubmissionResource {
  id: string;
  url: string;
  label: string;
}

interface BuddyDetails {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  status: string;
}

interface WeekInfo {
  weekNumber: number;
  weekTitle: string;
  weekDescription?: string;
}

interface TaskTemplate {
  title?: string;
  difficulty?: string;
  estimatedHours?: number;
}

interface ReviewQueueItem {
  submission: {
    id: string;
    taskAssignmentId: string;
    buddyId: string;
    version: number;
    description: string;
    notes?: string;
    reviewStatus: string;
    submittedAt: string;
  };
  assignment: Record<string, unknown>;
  taskTemplate: TaskTemplate;
  resources: SubmissionResource[];
  buddyDetails: BuddyDetails;
  weekInfo: WeekInfo;
}

interface MentorProfile {
  id: string;
  userId: string;
}

interface AuthState {
  auth: {
    user: {
      id: string;
    } | null;
  };
}

export default function ReviewQueue() {
  const user = useSelector((state: AuthState) => state.auth.user);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'under_review'>('all');
  const [filterBuddyId, setFilterBuddyId] = useState<string>('all');
  const [filterWeek, setFilterWeek] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupByBuddy, setGroupByBuddy] = useState(false);

  // Fetch all mentors to find current user's mentor profile
  const { data: allMentors = [], isLoading: loadingMentors } = useGetMentorsQuery({});

  useEffect(() => {
    if (allMentors && user?.id) {
      const profile = allMentors.find((mentor: MentorProfile) => mentor.userId === user.id);
      setMentorProfile(profile || null);
    }
  }, [allMentors, user?.id]);

  const mentorId = mentorProfile?.id;

  // Fetch assigned buddies for filter dropdown
  const { data: assignedBuddies = [] } = useGetMentorAssignedBuddiesQuery(mentorId || '', {
    skip: !mentorId,
  });

  // Fetch review queue with filters
  const { data: queue = [], isLoading: loadingQueue } = useGetMentorReviewQueueQuery(
    {
      mentorId: mentorId || '',
      filters: {
        buddyId: filterBuddyId !== 'all' ? filterBuddyId : undefined,
        weekNumber: filterWeek !== 'all' ? parseInt(filterWeek) : undefined,
        status: filterStatus !== 'all' ? filterStatus : 'all',
      }
    },
    { skip: !mentorId }
  );

  // Get unique weeks from the queue for filter dropdown
  const uniqueWeeks = useMemo(() => {
    const weeks = new Set<number>();
    (queue as ReviewQueueItem[]).forEach((item: ReviewQueueItem) => {
      if (item.weekInfo?.weekNumber) {
        weeks.add(item.weekInfo.weekNumber);
      }
    });
    return Array.from(weeks).sort((a, b) => a - b);
  }, [queue]);

  // Filter by search query
  const filteredQueue = useMemo(() => {
    const typedQueue = queue as ReviewQueueItem[];
    if (!searchQuery.trim()) return typedQueue;
    const query = searchQuery.toLowerCase();
    return typedQueue.filter((item: ReviewQueueItem) =>
      item.taskTemplate?.title?.toLowerCase().includes(query) ||
      item.buddyDetails?.name?.toLowerCase().includes(query) ||
      item.weekInfo?.weekTitle?.toLowerCase().includes(query) ||
      item.submission?.description?.toLowerCase().includes(query)
    );
  }, [queue, searchQuery]);

  // Group submissions by buddy
  const groupedByBuddy = useMemo(() => {
    if (!groupByBuddy) return null;
    const groups: Record<string, { buddy: BuddyDetails; submissions: ReviewQueueItem[] }> = {};

    filteredQueue.forEach((item: ReviewQueueItem) => {
      const buddyId = item.buddyDetails?.id || 'unknown';
      if (!groups[buddyId]) {
        groups[buddyId] = {
          buddy: item.buddyDetails,
          submissions: [],
        };
      }
      groups[buddyId].submissions.push(item);
    });

    return Object.values(groups);
  }, [filteredQueue, groupByBuddy]);

  // Calculate stats
  const urgentSubmissions = filteredQueue.filter((item: ReviewQueueItem) => {
    const daysSinceSubmission = Math.floor(
      (new Date().getTime() - new Date(item.submission.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceSubmission > 2;
  });

  const recentSubmissions = filteredQueue.filter((item: ReviewQueueItem) => {
    const daysSinceSubmission = Math.floor(
      (new Date().getTime() - new Date(item.submission.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceSubmission <= 2;
  });

  // Show loading while fetching mentor profile
  if (loadingMentors) {
    return (
      <Layout>
        <div className="w-full px-6 py-6">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!mentorId) {
    return (
      <Layout>
        <div className="w-full px-6 py-6">
          <Card>
            <CardContent className="text-center py-10">
              <p className="text-gray-600">You need a mentor profile to access the review queue.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (loadingQueue) {
    return (
      <Layout>
        <div className="w-full px-6 py-6">
          <p>Loading review queue...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Review Queue</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Total Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{filteredQueue.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Urgent (2+ days)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-500">{urgentSubmissions.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Recent (48h)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">{recentSubmissions.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks, buddies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Buddy Filter */}
              <Select value={filterBuddyId} onValueChange={setFilterBuddyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by buddy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buddies</SelectItem>
                  {assignedBuddies.map((buddy) => (
                    <SelectItem key={buddy.id} value={buddy.id}>
                      {buddy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Week Filter */}
              <Select value={filterWeek} onValueChange={setFilterWeek}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Weeks</SelectItem>
                  {uniqueWeeks.map((week) => (
                    <SelectItem key={week} value={week.toString()}>
                      Week {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as 'all' | 'pending' | 'under_review')}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Submissions</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                </SelectContent>
              </Select>

              {/* Group by Buddy Toggle */}
              <Button
                variant={groupByBuddy ? "default" : "outline"}
                onClick={() => setGroupByBuddy(!groupByBuddy)}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                {groupByBuddy ? 'Grouped by Buddy' : 'Group by Buddy'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Grouped View */}
        {groupByBuddy && groupedByBuddy ? (
          <div className="space-y-6">
            {groupedByBuddy.map((group) => (
              <Card key={group.buddy?.id || 'unknown'}>
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={group.buddy?.avatarUrl || undefined} />
                      <AvatarFallback>
                        {group.buddy?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{group.buddy?.name || 'Unknown Buddy'}</CardTitle>
                      <CardDescription>{group.buddy?.email}</CardDescription>
                    </div>
                    <Badge className="ml-auto">{group.submissions.length} submissions</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {group.submissions.map((item) => (
                      <SubmissionCard key={item.submission.id} item={item} compact />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Urgent Section */}
            {urgentSubmissions.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Urgent ({urgentSubmissions.length})
                </h2>
                <div className="space-y-4">
                  {urgentSubmissions.map((item: ReviewQueueItem) => (
                    <SubmissionCard key={item.submission.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Section */}
            {recentSubmissions.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Recent ({recentSubmissions.length})
                </h2>
                <div className="space-y-4">
                  {recentSubmissions.map((item: ReviewQueueItem) => (
                    <SubmissionCard key={item.submission.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {filteredQueue.length === 0 && (
          <Card>
            <CardContent className="text-center py-10">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No pending submissions</h3>
              <p className="text-gray-600">All caught up! Check back later for new submissions.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

function SubmissionCard({ item, compact = false }: { item: ReviewQueueItem; compact?: boolean }) {
  const { submission, taskTemplate, resources, buddyDetails, weekInfo } = item;
  const daysSince = Math.floor(
    (new Date().getTime() - new Date(submission.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const getTimeAgo = () => {
    if (daysSince === 0) return 'today';
    if (daysSince === 1) return 'yesterday';
    return `${daysSince} days ago`;
  };

  return (
    <Card className={compact ? 'border-l-4 border-l-blue-500' : ''}>
      <CardHeader className={compact ? 'pb-2' : ''}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Task Title with Week Badge */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                <BookOpen className="h-3 w-3 mr-1" />
                Week {weekInfo?.weekNumber || '?'}
              </Badge>
              <CardTitle className="text-lg">{taskTemplate?.title || 'Task'}</CardTitle>
              <Badge variant="outline">v{submission.version}</Badge>
              {submission.reviewStatus === 'under_review' && (
                <Badge className="bg-yellow-500">Under Review</Badge>
              )}
            </div>

            {/* Week Title */}
            {weekInfo?.weekTitle && (
              <p className="text-sm text-gray-500 mb-2">{weekInfo.weekTitle}</p>
            )}

            {/* Buddy Info (only show if not in grouped view) */}
            {!compact && (
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={buddyDetails?.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs">
                    {buddyDetails?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{buddyDetails?.name || 'Unknown Buddy'}</span>
                <span className="text-sm text-gray-500">submitted {getTimeAgo()}</span>
              </div>
            )}

            {compact && (
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Submitted {getTimeAgo()}
              </CardDescription>
            )}
          </div>

          {daysSince > 2 && (
            <Badge className="bg-red-500">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Urgent
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className={`space-y-4 ${compact ? 'pt-0' : ''}`}>
        {/* Description */}
        <div>
          <p className="text-sm text-gray-600 line-clamp-2">{submission.description}</p>
        </div>

        {/* Resources */}
        {resources && resources.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Resources ({resources.length})</h4>
            <div className="flex flex-wrap gap-2">
              {resources.map((resource: SubmissionResource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm flex items-center gap-1 text-blue-500 hover:underline bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded"
                >
                  <ExternalLink className="h-3 w-3" />
                  {resource.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {submission.notes && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Notes</h4>
            <p className="text-sm text-gray-600 line-clamp-1">{submission.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Difficulty: {taskTemplate?.difficulty || 'N/A'}</span>
            {taskTemplate?.estimatedHours && <span>{taskTemplate.estimatedHours}h</span>}
          </div>

          <Link href={`/mentor/review/${submission.id}`}>
            <Button size="sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              Review Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
