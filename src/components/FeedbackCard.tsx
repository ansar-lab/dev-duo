import { Star } from 'lucide-react';

interface FeedbackCardProps {
  client_name_sanitized: string;
  feedback: string;
  rating: number;
  project_title?: string;
  created_at: string;
}

export const FeedbackCard = ({ 
  client_name_sanitized, 
  feedback, 
  rating, 
  project_title,
  created_at
}: FeedbackCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={`${
          index < rating 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="project-card bg-card p-6 group transform-3d hover:ring-2 ring-[hsl(285_100%_55%_/_0.35)] transition-all h-full">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors flex items-center justify-center">
          <span className="text-primary font-semibold text-lg group-hover:text-primary-glow transition-colors">
            {client_name_sanitized.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold group-hover:text-primary-glow transition-colors">{client_name_sanitized}</h4>
            {/* Date hidden as requested */}
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="flex group-hover:scale-105 transition-transform">{renderStars(rating)}</div>
            <span className="text-sm text-muted-foreground">({rating}/5)</span>
          </div>
          
          {project_title && (
            <p className="text-sm text-accent mb-2 group-hover:text-primary-glow transition-colors">Project: {project_title}</p>
          )}
          
          <p className="text-muted-foreground group-hover:text-foreground transition-colors">{feedback}</p>
        </div>
      </div>
    </div>
  );
};