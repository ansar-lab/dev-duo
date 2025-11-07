import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProjectCard } from '@/components/ProjectCard';
import { Loader2, AlertCircle } from 'lucide-react';
import Background3D from '@/components/Background3D';
import { Helmet } from 'react-helmet-async';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url?: string;
  project_url?: string;
  technologies?: string[];
  created_at: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    fetchProjects();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        () => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Raw project data:', data);
      
      // Ensure all projects have a valid category
      const validProjects = (data || []).map(project => ({
        ...project,
        category: project.category || 'other'
      }));
      
      setProjects(validProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const categories = projects.length > 0 
    ? ['All', ...Array.from(new Set(projects.map(p => p.category)))]
    : ['All', 'Web Development', 'Mobile App', 'Desktop Application', 'AI/ML', 'Blockchain', 'Other'];
  
  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  // Debug logging (removed for production)
  // console.log('Projects loaded:', projects.length);
  // console.log('Categories found:', categories);
  // console.log('Selected category:', selectedCategory);
  // console.log('Filtered projects:', filteredProjects.length);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Error loading projects: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 relative">
      <Background3D intensity="low" />
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in-up">
            Our <span className="text-primary">Projects</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Explore our portfolio of successful projects and see how we've helped 
            businesses transform their digital presence.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="pb-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setIsFiltering(true);
                  setSelectedCategory(category);
                  // Small delay to show filtering animation
                  setTimeout(() => setIsFiltering(false), 200);
                }}
                disabled={isFiltering}
                className={`px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'bg-card text-foreground hover:bg-accent hover:shadow-md border border-border/50'
                }`}
              >
                <span className="relative z-10">{category}</span>
                {isFiltering && selectedCategory === category && (
                  <span className="ml-2 inline-block w-2 h-2 bg-current rounded-full animate-pulse relative z-10"></span>
                )}
                {selectedCategory === category && (
                  <span className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-75"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          {filteredProjects.length > 0 ? (
            <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-300 ${isFiltering ? 'opacity-50' : 'opacity-100'}`}>
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="animate-fade-in-up h-full flex"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProjectCard {...project} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">
                {selectedCategory === 'All' 
                  ? 'No projects found. Check back soon for exciting new work!'
                  : `No projects found in the "${selectedCategory}" category.`
                }
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Projects;