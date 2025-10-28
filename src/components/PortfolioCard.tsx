import { Calendar, Edit, ExternalLink, FileText, Github, Globe, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import type { PortfolioRO } from '@/api/dto';

interface PortfolioCardProps {
  portfolio: PortfolioRO;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export default function PortfolioCard({ portfolio, onEdit, onDelete, canEdit = false }: PortfolioCardProps) {
  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'github':
        return <Github className="h-4 w-4" />;
      case 'live':
        return <Globe className="h-4 w-4" />;
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const handleResourceClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!portfolio.resourceUrl) return;

    // Check if it's a base64 data URL
    if (portfolio.resourceUrl.startsWith('data:')) {
      // Create a blob from the base64 data
      const link = document.createElement('a');
      link.href = portfolio.resourceUrl;
      link.download = portfolio.resourceName || 'resource';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Regular URL - open in new tab
      window.open(portfolio.resourceUrl, '_blank');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{portfolio.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{portfolio.description}</p>
          </div>
          {canEdit && (
            <div className="flex gap-2 ml-4">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Technologies */}
        {portfolio.technologies && portfolio.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {portfolio.technologies.map((tech, index) => (
              <Badge key={index} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        )}

        {/* Links */}
        {portfolio.links && portfolio.links.length > 0 && (
          <div className="space-y-2">
            {portfolio.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {getLinkIcon(link.type)}
                <span>{link.label}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        )}

        {/* Resource */}
        {portfolio.resourceUrl && (
          <div className="pt-3 border-t">
            <button
              onClick={handleResourceClick}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 w-full text-left"
            >
              <FileText className="h-4 w-4" />
              <span>{portfolio.resourceName || 'Resource File'}</span>
              {portfolio.resourceType && (
                <Badge variant="outline" className="text-xs">
                  {portfolio.resourceType}
                </Badge>
              )}
              <ExternalLink className="h-3 w-3 ml-auto" />
            </button>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>
            {portfolio.completedAt
              ? new Date(portfolio.completedAt).toLocaleDateString()
              : 'No completion date'}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
