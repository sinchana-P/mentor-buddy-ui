import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRoute } from 'wouter';
import {
  useGetCurriculumByIdQuery,
  useGetCurriculumWeeksQuery,
  useGetWeekTasksQuery,
} from '@/api/curriculumManagementApi';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Calendar, Clock, CheckCircle, BookOpen, Target, Edit, ListTodo } from 'lucide-react';
import { Link } from 'wouter';

// Component to fetch task count for a week (renders nothing, just reports count)
function WeekTaskCounter({ weekId, onCountLoaded }: { weekId: string; onCountLoaded: (weekId: string, count: number) => void }) {
  const { data: tasks = [], isLoading } = useGetWeekTasksQuery(weekId);
  const reportedRef = useRef(false);

  useEffect(() => {
    if (!isLoading && !reportedRef.current) {
      reportedRef.current = true;
      onCountLoaded(weekId, tasks.length);
    }
  }, [weekId, tasks.length, isLoading, onCountLoaded]);

  return null; // This component doesn't render anything
}

// Component to display tasks for a week in view mode
function WeekTasksView({ weekId }: { weekId: string }) {
  const { data: tasks = [], isLoading } = useGetWeekTasksQuery(weekId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading tasks...</p>;
  }

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-2">
        No tasks in this week.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task: any, idx: number) => (
        <div key={task.id} className="border border-border rounded-lg p-4 bg-card hover:bg-muted/30 transition-colors">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              )}
              <div className="flex items-center flex-wrap gap-2 mt-3">
                {task.difficulty && (
                  <Badge
                    variant={task.difficulty === 'easy' ? 'secondary' : task.difficulty === 'hard' ? 'destructive' : 'default'}
                  >
                    {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                  </Badge>
                )}
                {task.estimatedHours && (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {task.estimatedHours} hours
                  </Badge>
                )}
              </div>
              {task.requirements && (
                <div className="mt-3 p-3 bg-muted/50 rounded-md">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Requirements:</p>
                  <p className="text-sm text-foreground">{task.requirements}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CurriculumView() {
  const [, params] = useRoute('/curriculum-management/:id/view');
  const curriculumId = params?.id;
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
  const [expandedWeeks, setExpandedWeeks] = useState<string[]>([]);

  const { data: curriculum, isLoading: loadingCurriculum } = useGetCurriculumByIdQuery(curriculumId || '', {
    skip: !curriculumId,
  });

  const { data: weeks = [], isLoading: loadingWeeks } = useGetCurriculumWeeksQuery(curriculumId || '', {
    skip: !curriculumId,
  });

  // Expand first week by default when weeks load
  useEffect(() => {
    if (weeks.length > 0 && expandedWeeks.length === 0) {
      setExpandedWeeks([weeks[0].id]);
    }
  }, [weeks]);

  const handleTasksLoaded = useCallback((weekId: string, count: number) => {
    setTaskCounts(prev => {
      if (prev[weekId] === count) return prev;
      return { ...prev, [weekId]: count };
    });
  }, []);

  const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);

  if (loadingCurriculum) {
    return (
      <Layout>
        <div className="w-full px-6 py-6">
          <p className="text-muted-foreground">Loading curriculum...</p>
        </div>
      </Layout>
    );
  }

  if (!curriculum) {
    return (
      <Layout>
        <div className="w-full px-6 py-6">
          <p className="text-destructive">Curriculum not found</p>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Published</Badge>;
      case 'draft':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="w-full px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/curriculum-management">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{curriculum.name}</h1>
                {getStatusBadge(curriculum.status)}
              </div>
              <p className="text-muted-foreground mt-1">{curriculum.description}</p>
            </div>
          </div>

          <Link href={`/curriculum-management/${curriculumId}`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Curriculum
            </Button>
          </Link>
        </div>

        {/* Curriculum Stats - Now 5 cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{curriculum.totalWeeks}</p>
                  <p className="text-sm text-muted-foreground">Weeks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{weeks.length}</p>
                  <p className="text-sm text-muted-foreground">Weeks Created</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <ListTodo className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground capitalize">{curriculum.domainRole}</p>
                  <p className="text-sm text-muted-foreground">Domain</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Target className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">v{curriculum.version}</p>
                  <p className="text-sm text-muted-foreground">Version</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tags */}
        {curriculum.tags && curriculum.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {curriculum.tags.map((tag: string, idx: number) => (
                <Badge key={idx} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Weeks and Tasks */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Curriculum Content</h2>

          {loadingWeeks ? (
            <p className="text-muted-foreground">Loading weeks...</p>
          ) : weeks.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No weeks added yet</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Hidden counters to fetch task counts for all weeks */}
              {weeks.map((week: any) => (
                <WeekTaskCounter
                  key={`counter-${week.id}`}
                  weekId={week.id}
                  onCountLoaded={handleTasksLoaded}
                />
              ))}

              <Accordion
                type="multiple"
                value={expandedWeeks}
                onValueChange={setExpandedWeeks}
                className="space-y-4"
              >
                {weeks.map((week: any) => (
                <AccordionItem
                  key={week.id}
                  value={week.id}
                  className="border rounded-lg overflow-hidden bg-card"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30 [&[data-state=open]]:bg-muted/30">
                    <div className="flex items-center gap-4 text-left">
                      <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                        {week.weekNumber}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Week {week.weekNumber}: {week.title}
                        </h3>
                        {week.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">{week.description}</p>
                        )}
                      </div>
                      {taskCounts[week.id] !== undefined && (
                        <Badge variant="secondary" className="ml-auto mr-4">
                          {taskCounts[week.id]} tasks
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    {/* Learning Objectives */}
                    {week.learningObjectives && week.learningObjectives.length > 0 && (
                      <div className="mb-6 mt-2">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          Learning Objectives
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
                          {week.learningObjectives.map((obj: string, idx: number) => (
                            <li key={idx}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tasks */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Tasks
                      </h4>
                      <WeekTasksView weekId={week.id} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
              </Accordion>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
