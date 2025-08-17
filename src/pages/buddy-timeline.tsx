import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBuddies, useTasks } from '@/hooks/useApi';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TaskTimeline from '@/components/TaskTimeline';
import TechnicalChecklist from '@/components/TechnicalChecklist';
import WorkPortfolio from '@/components/WorkPortfolio';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { ArrowLeft, Plus, Edit } from 'lucide-react';
import { useLocation } from 'wouter';
import type { PortfolioItem, Task } from '@/types';

export default function BuddyTimelinePage() {
  const [, params] = useRoute('/buddies/:id');
  const [, setLocation] = useLocation();
  const buddyId = params?.id;

  const { data: buddies = [], isLoading: buddyLoading } = useBuddies();
  const buddy = buddies.find((b: any) => b.id === buddyId) || null;
  
  const { data: tasks = [], isLoading: tasksLoading } = useTasks({ buddyId });
  
  // TODO: Add individual buddy endpoints for progress and portfolio
  const progress = { topics: [], percentage: 0 };
  const portfolio: any[] = [];

  if (buddyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!buddy) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Buddy not found</p>
          <Button onClick={() => setLocation('/mentors')} className="mt-4">
            Back to Mentors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => setLocation(`/mentors/${buddy.assignedMentorId}`)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Mentor Profile
        </Button>

        {/* Buddy Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center space-x-6 mb-4 lg:mb-0">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={buddy.user?.avatarUrl} alt={buddy.user?.name} />
                  <AvatarFallback className="text-2xl">
                    {buddy.user?.name?.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold mb-2">{buddy.user?.name}</h1>
                  <p className="text-muted-foreground mb-1">Junior {buddy.user?.domainRole} Developer</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Joined: {new Date(buddy.joinDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mentor: <span className="text-primary">{buddy.mentor?.user?.name}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Timeline Section */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Timeline & Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <TaskTimeline tasks={tasks as any || []} buddy={buddy} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Technical Checklist */}
            <TechnicalChecklist 
              buddyId={buddyId!} 
              progress={progress || { topics: [], percentage: 0 }} 
            />

            {/* Work Portfolio */}
            <WorkPortfolio portfolio={portfolio as PortfolioItem[]|| []} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
