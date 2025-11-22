import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useSelector } from 'react-redux';
import { useGetMentorReviewQueueQuery } from '@/api/submissionApi';
import { useGetMentorsQuery } from '@/api/mentorsApi';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, ExternalLink, MessageSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ReviewQueue() {
  const user = useSelector((state: any) => state.auth.user);
  const [mentorProfile, setMentorProfile] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch all mentors to find current user's mentor profile
  const { data: allMentors = [], isLoading: loadingMentors } = useGetMentorsQuery({});

  useEffect(() => {
    if (allMentors && user?.id) {
      // Find mentor profile by userId
      const profile = allMentors.find((mentor: any) => mentor.userId === user.id);
      setMentorProfile(profile);
    }
  }, [allMentors, user?.id]);

  const mentorId = mentorProfile?.id;

  const { data: queue = [], isLoading: loadingQueue, isError } = useGetMentorReviewQueueQuery(mentorId || '', {
    skip: !mentorId,
  });

  // Show loading while fetching mentor profile
  if (loadingMentors) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!mentorId) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
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
        <div className="container mx-auto py-6">
          <p>Loading review queue...</p>
        </div>
      </Layout>
    );
  }

  const urgentSubmissions = queue.filter((item: any) => {
    const daysSinceSubmission = Math.floor(
      (new Date().getTime() - new Date(item.submission.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceSubmission > 2;
  });

  const recentSubmissions = queue.filter((item: any) => {
    const daysSinceSubmission = Math.floor(
      (new Date().getTime() - new Date(item.submission.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceSubmission <= 2;
  });

  const filteredQueue = filterStatus === 'all' ? queue : queue.filter((item: any) => item.submission.reviewStatus === filterStatus);

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Review Queue</h1>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Submissions</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Total Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{queue.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Urgent (2 days)</CardTitle>
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

        {/* Urgent Section */}
        {urgentSubmissions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Urgent ({urgentSubmissions.length})
            </h2>
            <div className="space-y-4">
              {urgentSubmissions.map((item: any) => (
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
              {recentSubmissions.map((item: any) => (
                <SubmissionCard key={item.submission.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {queue.length === 0 && (
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

function SubmissionCard({ item }: { item: any }) {
  const { submission, assignment, taskTemplate, resources } = item;
  const daysSince = Math.floor(
    (new Date().getTime() - new Date(submission.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{taskTemplate?.title || 'Task'}</CardTitle>
              <Badge variant="outline">v{submission.version}</Badge>
            </div>
            <CardDescription>
              Submitted {daysSince === 0 ? 'today' : `${daysSince} day${daysSince > 1 ? 's' : ''} ago`} by{' '}
              {/* In real app, fetch buddy name */}
              Buddy
            </CardDescription>
          </div>
          {daysSince > 2 && (
            <Badge className="bg-red-500">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Urgent
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 line-clamp-2">{submission.description}</p>
        </div>

        {resources && resources.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Resources</h4>
            <div className="flex flex-wrap gap-2">
              {resources.map((resource: any) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm flex items-center gap-1 text-blue-500 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {resource.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {submission.notes && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Notes</h4>
            <p className="text-sm text-gray-600 line-clamp-1">{submission.notes}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Difficulty: {taskTemplate?.difficulty}</span>
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
