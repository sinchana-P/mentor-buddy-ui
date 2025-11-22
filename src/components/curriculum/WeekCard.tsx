/**
 * WeekCard Component
 * Draggable card for managing weeks and their tasks
 */

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  useGetWeekTasksQuery,
  useDeleteWeekMutation,
  useUpdateWeekMutation,
} from '@/api/curriculum/curriculumApi';
import type { CurriculumWeek } from '@/types/curriculum';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
  GripVertical,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
} from 'lucide-react';
import TaskTemplateItem from './TaskTemplateItem';
import TaskTemplateEditor from './TaskTemplateEditor';
import WeekEditor from './WeekEditor';

interface WeekCardProps {
  week: CurriculumWeek;
  curriculumId: string;
}

export default function WeekCard({ week, curriculumId }: WeekCardProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editWeekOpen, setEditWeekOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Drag and drop
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: week.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // API
  const { data: tasks = [], isLoading: loadingTasks } = useGetWeekTasksQuery(week.id);
  const [deleteWeek] = useDeleteWeekMutation();

  const handleDelete = async () => {
    try {
      await deleteWeek(week.id).unwrap();
      toast({
        title: 'Week deleted',
        description: 'The week has been successfully removed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete week.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div ref={setNodeRef} style={style}>
        <Card className={`${isDragging ? 'shadow-xl' : ''}`}>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex items-start gap-3 p-4">
              {/* Drag Handle */}
              <button
                className="cursor-grab active:cursor-grabbing mt-1 text-muted-foreground hover:text-foreground"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-5 w-5" />
              </button>

              {/* Week Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">Week {week.weekNumber}</Badge>
                      <h3 className="font-semibold text-lg">{week.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {week.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditWeekOpen(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Week
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAddTaskOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Task
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteDialogOpen(true)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Week
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible Tasks List */}
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-3">
                {/* Learning Objectives */}
                {week.learningObjectives && week.learningObjectives.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <h4 className="text-sm font-medium mb-2">Learning Objectives:</h4>
                    <ul className="text-sm space-y-1">
                      {week.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tasks */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Tasks</h4>
                    <Button size="sm" variant="outline" onClick={() => setAddTaskOpen(true)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Task
                    </Button>
                  </div>

                  {loadingTasks ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                      No tasks yet. Click "Add Task" to create one.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <TaskTemplateItem key={task.id} task={task} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Resources */}
                {week.resources && week.resources.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <h4 className="text-sm font-medium mb-2">Week Resources:</h4>
                    <div className="space-y-2">
                      {week.resources.map((resource, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <FileText className="h-4 w-4 text-primary mt-0.5" />
                          <div className="flex-1">
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {resource.title}
                            </a>
                            {resource.duration && (
                              <span className="text-muted-foreground ml-2">
                                ({resource.duration})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      {/* Dialogs */}
      <WeekEditor
        open={editWeekOpen}
        onOpenChange={setEditWeekOpen}
        week={week}
        curriculumId={curriculumId}
      />

      <TaskTemplateEditor
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
        weekId={week.id}
        curriculumId={curriculumId}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Week?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Week {week.weekNumber}: "{week.title}"? This will
              also delete all tasks in this week. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
