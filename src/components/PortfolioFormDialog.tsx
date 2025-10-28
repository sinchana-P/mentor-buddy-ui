import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Upload, FileText, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import type { PortfolioRO, PortfolioLink } from '@/api/dto';

// Schema for portfolio validation
const portfolioLinkSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  url: z.string().url('Must be a valid URL'),
  type: z.enum(['github', 'live', 'other']),
});

const portfolioSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  technologies: z.array(z.string()).optional().default([]),
  links: z.array(portfolioLinkSchema).max(3, 'Maximum 3 links allowed').default([]),
  resourceUrl: z.string().optional().refine(
    (val) => !val || val === '' || val.startsWith('data:') || z.string().url().safeParse(val).success,
    { message: 'Must be a valid URL or file' }
  ),
  resourceType: z.string().optional(),
  resourceName: z.string().optional(),
  completedAt: z.string().optional(),
});

export type PortfolioFormData = z.infer<typeof portfolioSchema>;

interface PortfolioFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PortfolioFormData) => Promise<void>;
  portfolio?: PortfolioRO | null;
  isLoading?: boolean;
}

export default function PortfolioFormDialog({
  isOpen,
  onClose,
  onSubmit,
  portfolio,
  isLoading = false,
}: PortfolioFormDialogProps) {
  const [techInput, setTechInput] = useState('');
  const [currentLink, setCurrentLink] = useState<Partial<PortfolioLink>>({
    label: '',
    url: '',
    type: 'other',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title: '',
      description: '',
      technologies: [],
      links: [],
      resourceUrl: '',
      resourceType: '',
      resourceName: '',
      completedAt: '',
    },
  });

  // Load portfolio data when editing
  useEffect(() => {
    if (portfolio) {
      form.reset({
        title: portfolio.title,
        description: portfolio.description,
        technologies: portfolio.technologies || [],
        links: portfolio.links || [],
        resourceUrl: portfolio.resourceUrl || '',
        resourceType: portfolio.resourceType || '',
        resourceName: portfolio.resourceName || '',
        completedAt: portfolio.completedAt || '',
      });
    } else {
      form.reset({
        title: '',
        description: '',
        technologies: [],
        links: [],
        resourceUrl: '',
        resourceType: '',
        resourceName: '',
        completedAt: '',
      });
    }
  }, [portfolio, form, isOpen]);

  const handleSubmit = async (data: PortfolioFormData) => {
    try {
      setIsUploading(true);

      // If there's a file to upload, convert it to base64
      if (uploadedFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String);
          };
          reader.onerror = reject;
        });

        reader.readAsDataURL(uploadedFile);
        const base64Data = await base64Promise;

        // Store the base64 data in resourceUrl
        data.resourceUrl = base64Data;
      }

      await onSubmit(data);

      // Reset form and file
      form.reset();
      setUploadedFile(null);
      onClose();
    } catch (error) {
      console.error('Error submitting portfolio:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const addTechnology = () => {
    if (techInput.trim()) {
      const current = form.getValues('technologies') || [];
      form.setValue('technologies', [...current, techInput.trim()]);
      setTechInput('');
    }
  };

  const removeTechnology = (index: number) => {
    const current = form.getValues('technologies') || [];
    form.setValue(
      'technologies',
      current.filter((_, i) => i !== index)
    );
  };

  const addLink = () => {
    if (currentLink.label && currentLink.url && currentLink.type) {
      const current = form.getValues('links') || [];
      if (current.length >= 3) {
        form.setError('links', { message: 'Maximum 3 links allowed' });
        return;
      }
      form.setValue('links', [...current, currentLink as PortfolioLink]);
      form.clearErrors('links');
      setCurrentLink({ label: '', url: '', type: 'other' });
    }
  };

  const removeLink = (index: number) => {
    const current = form.getValues('links') || [];
    form.setValue(
      'links',
      current.filter((_, i) => i !== index)
    );
    form.clearErrors('links');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{portfolio ? 'Edit Portfolio Entry' : 'Add Portfolio Entry'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Project title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your project..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Technologies */}
            <div className="space-y-2">
              <FormLabel>Technologies</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., React, TypeScript, Node.js"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTechnology();
                    }
                  }}
                />
                <Button type="button" onClick={addTechnology} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(form.watch('technologies') || []).map((tech, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tech}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTechnology(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Links (max 3) */}
            <div className="space-y-2">
              <FormLabel>Links (Max 3)</FormLabel>
              <p className="text-sm text-gray-500">Add up to 3 links to your project (GitHub repo, live demo, etc.)</p>
              <div className="space-y-2 border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                <div className="grid grid-cols-[1fr_2fr_auto_auto] gap-2">
                  <Input
                    placeholder="e.g., GitHub Repo"
                    value={currentLink.label}
                    onChange={(e) => setCurrentLink({ ...currentLink, label: e.target.value })}
                  />
                  <Input
                    placeholder="https://github.com/username/repo"
                    value={currentLink.url}
                    onChange={(e) => setCurrentLink({ ...currentLink, url: e.target.value })}
                  />
                  <Select
                    value={currentLink.type}
                    onValueChange={(value: 'github' | 'live' | 'other') =>
                      setCurrentLink({ ...currentLink, type: value })
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="github">GitHub</SelectItem>
                      <SelectItem value="live">Live Demo</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={addLink}
                    size="sm"
                    disabled={(form.watch('links') || []).length >= 3 || !currentLink.label || !currentLink.url}
                    title={!currentLink.label || !currentLink.url ? 'Fill in label and URL' : ''}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {currentLink.url && !z.string().url().safeParse(currentLink.url).success && currentLink.url.length > 0 && (
                  <p className="text-sm text-red-500">Please enter a valid URL (starting with http:// or https://)</p>
                )}
              </div>

              {/* Display added links */}
              <div className="space-y-2 mt-2">
                {(form.watch('links') || []).map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-lg bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{link.type}</Badge>
                      <span className="font-medium">{link.label}</span>
                      <span className="text-sm text-gray-500 truncate max-w-[300px]">
                        {link.url}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLink(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              {form.formState.errors.links && (
                <p className="text-sm text-red-500">{form.formState.errors.links.message}</p>
              )}
            </div>

            {/* Resource Upload (optional) */}
            <div className="space-y-2 border-t pt-4">
              <FormLabel className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Resource File (Optional)
              </FormLabel>
              <p className="text-sm text-gray-500">
                Upload a PDF, document, or other resource file (max 10MB)
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Check file size (max 10MB)
                        if (file.size > 10 * 1024 * 1024) {
                          alert('File size must be less than 10MB');
                          return;
                        }
                        setUploadedFile(file);
                        form.setValue('resourceName', file.name);
                        form.setValue('resourceType', file.type || file.name.split('.').pop() || 'Unknown');
                        // We'll upload the file when form is submitted
                      }
                    }}
                    className="flex-1"
                    disabled={isUploading}
                  />
                </div>

                {uploadedFile && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.size / 1024).toFixed(2)} KB • {uploadedFile.type || 'Unknown type'}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUploadedFile(null);
                        form.setValue('resourceUrl', '');
                        form.setValue('resourceType', '');
                        form.setValue('resourceName', '');
                      }}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {isUploading && (
                  <p className="text-sm text-blue-500">Uploading file...</p>
                )}
              </div>
            </div>

            {/* Completed Date */}
            <FormField
              control={form.control}
              name="completedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completion Date (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : portfolio ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
