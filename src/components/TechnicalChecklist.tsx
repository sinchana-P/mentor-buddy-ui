import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { authenticatedFetch } from '@/lib/api-utils';

interface Topic {
  id: string;
  name: string;
  checked: boolean;
}

interface TechnicalChecklistProps {
  buddyId: string;
  progress: {
    topics: Topic[];
    percentage: number;
  };
}

export default function TechnicalChecklist({ buddyId, progress }: TechnicalChecklistProps) {
  const { toast } = useToast();
  const [, setIsUpdating] = useState(false);

  const updateProgress = async ({ topicId, checked }: { topicId: string; checked: boolean }) => {
    setIsUpdating(true);
    try {
      const response = await authenticatedFetch(`/api/buddies/${buddyId}/progress/${topicId}`, {
        method: 'PATCH',
        body: JSON.stringify({ topicId, checked }),
      });

      if (response.ok) {
        toast({
          title: "Progress Updated",
          description: "Technical progress has been updated successfully.",
        });
      } else {
        throw new Error('Failed to update progress');
      }
    } catch {
      toast({
        title: "Update Failed",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTopicToggle = (topicId: string, checked: boolean) => {
    updateProgress({ topicId, checked });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {progress.topics?.map((topic) => (
            <div key={topic.id} className="flex items-center space-x-3">
              <Checkbox
                id={topic.id}
                checked={topic.checked}
                onCheckedChange={(checked) => handleTopicToggle(topic.id, checked as boolean)}
                disabled={false}
              />
              <label
                htmlFor={topic.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {topic.name}
              </label>
            </div>
          )) || (
            <div className="text-center py-4 text-muted-foreground">
              <p>No topics available</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span className="font-semibold">{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
