import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useSelector } from 'react-redux';
import { useGetMentorReviewQueueQuery } from '@/api/submissionApi';
import { useGetBuddiesQuery } from '@/api/buddiesApi';
import { useGetMentorsQuery } from '@/api/mentorsApi';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle, MessageSquare, Search, Users, FileCheck, TrendingUp } from 'lucide-react';

export default function MentorDashboard() {
  const user = useSelector((state: any) => state.auth.user);
  const [mentorProfile, setMentorProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('urgent');

  // Fetch all mentors to find current user's mentor profile
  const { data: allMentors = [] } = useGetMentorsQuery({});

  useEffect(() => {
    if (allMentors && user?.id) {
      // Find mentor profile by userId
      const profile = allMentors.find((mentor: any) => mentor.userId === user.id);
      setMentorProfile(profile);
    }
  }, [allMentors, user?.id]);

  const mentorId = mentorProfile?.id;

  const { data: queue = [], isLoading: loadingQueue } = useGetMentorReviewQueueQuery(
    { mentorId: mentorId || '' },
    { skip: !mentorId }
  );

  const { data: allBuddies = [], isLoading: loadingBuddies } = useGetBuddiesQuery();

  // Filter buddies assigned to this mentor
  const myBuddies = allBuddies.filter((buddy: any) => buddy.assignedMentorId === mentorId);

  const filteredBuddies = searchQuery
    ? myBuddies.filter((buddy: any) =>
        (buddy.user?.name || buddy.user?.email || '')?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : myBuddies;

  // Calculate stats
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

  // Calculate average buddy progress
  const avgProgress = myBuddies.length > 0
    ? Math.round(myBuddies.reduce((sum: number, buddy: any) => sum + (buddy.progress || 0), 0) / myBuddies.length)
    : 0;

  if (!mentorId) {
    return (
      <Layout>
        <div className="w-full px-6 py-6">
          <Card>
            <CardContent className="text-center py-10">
              <p className="text-muted-foreground">You need a mentor profile to access this dashboard.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full px-6 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.name || 'Mentor-Ok'}!</h1>
          <p className="text-muted-foreground">Here's a summary of your buddies and their progress.</p>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Buddies */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Buddies</p>
                  <p className="text-4xl font-bold text-foreground">{myBuddies.length}</p>
                  <p className="text-sm text-green-600 mt-2">+2 this month</p>
                </div>
                <div className="h-14 w-14 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submissions to Review */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Submissions to Review</p>
                  <p className="text-4xl font-bold text-foreground">{queue.length}</p>
                  <p className="text-sm text-green-600 mt-2">+3 today</p>
                </div>
                <div className="h-14 w-14 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <FileCheck className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Buddy Progress */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Average Buddy Progress</p>
                  <p className="text-4xl font-bold text-foreground">{avgProgress}%</p>
                  <p className="text-sm text-red-600 mt-2">-2% this week</p>
                </div>
                <div className="h-14 w-14 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Review Queue and My Buddies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Review Queue - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Review Queue</CardTitle>
                <CardDescription>Submissions from your buddies that require your attention.</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingQueue ? (
                  <p className="text-muted-foreground">Loading submissions...</p>
                ) : queue.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                      <FileCheck className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">All Caught Up!</h3>
                    <p className="text-muted-foreground mb-6">
                      You have no pending submissions to review. Great job!
                    </p>
                    <Link href="/mentor/review-queue">
                      <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                        View History
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {queue.slice(0, 5).map((item: any) => {
                      const daysSince = Math.floor(
                        (new Date().getTime() - new Date(item.submission.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      const isUrgent = daysSince > 2;

                      return (
                        <Card key={item.submission.id} className="overflow-hidden border-l-4 border-0 shadow-sm" style={{
                          borderLeftColor: isUrgent ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'
                        }}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  {isUrgent && (
                                    <Badge className="bg-red-500">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      URGENT
                                    </Badge>
                                  )}
                                  <span className="text-sm font-medium text-foreground">
                                    {item.buddyDetails?.name || 'Unknown Buddy'}
                                  </span>
                                  {item.weekInfo && (
                                    <Badge variant="outline" className="text-xs">
                                      Week {item.weekInfo.weekNumber}
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">
                                  {item.taskTemplate?.title || 'Task'}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                                  {item.submission.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{item.taskTemplate?.difficulty || 'Medium'}</span>
                                  <span>•</span>
                                  <span>
                                    Submitted {daysSince === 0 ? 'today' : `${daysSince} day${daysSince > 1 ? 's' : ''} ago`}
                                  </span>
                                </div>
                              </div>
                              <Link href={`/mentor/review/${item.submission.id}`}>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Review
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {queue.length > 5 && (
                      <div className="text-center pt-4">
                        <Link href="/mentor/review-queue">
                          <Button variant="outline">
                            View All {queue.length} Submissions
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* My Buddies - Takes 1 column */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">My Buddies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Find a buddy..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="space-y-4">
                  {loadingBuddies ? (
                    <p className="text-sm text-muted-foreground">Loading buddies...</p>
                  ) : filteredBuddies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No buddies found</p>
                  ) : (
                    filteredBuddies.map((buddy: any) => (
                      <Link key={buddy.id} href={`/buddies/${buddy.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-white">
                              {buddy.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'B'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{buddy.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{buddy.user?.domainRole || 'Not assigned'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">{buddy.progress || 0}%</p>
                            <p className="text-xs text-muted-foreground">Progress</p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
