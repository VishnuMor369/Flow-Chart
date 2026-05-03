import { useParams, Link } from 'react-router-dom';
import InteractiveRoadmap from '@/components/ui/interactive-roadmap';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/ui/header-3';
import HoverFooter from '@/components/ui/hover-footer';
import { getRoadmapById } from '@/data/roadmaps';

export default function RoadmapPage() {
  const { id } = useParams();
  const { nodes: initialNodes, edges: initialEdges } = getRoadmapById(id || 'frontend');
  const roadmapName = id ? id.replace('-', ' ').toUpperCase() : 'ROADMAP';

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="flex-1 flex flex-col pt-20">
        <div className="px-8 py-4 border-b border-border flex items-center justify-between bg-secondary">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-accent rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-[#8bc34a]">
              {roadmapName}
            </h1>
          </div>
        </div>

        <div className="flex-1 relative">
          <InteractiveRoadmap 
            key={id || 'default'}
            initialNodes={initialNodes} 
            initialEdges={initialEdges} 
            roadmapId={id || 'default'} 
          />
        </div>
      </main>
      
      <HoverFooter />
    </div>
  );
}
