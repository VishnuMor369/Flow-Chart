import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, PlayCircle } from 'lucide-react';
import cleanCodeImg from '@/assets/clean_code_thumbnail.png';

const CATEGORIES = ['All', 'React', 'Architecture', 'Clean Code', 'DSA', 'System Design'];

const initialVideos = [
  {
    id: 1,
    title: "React Course - Beginner's Tutorial",
    channel: "freeCodeCamp.org",
    url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
    thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/maxresdefault.jpg",
    category: "React"
  },
  {
    id: 2,
    title: "React Architecture - How to Structure Your Apps",
    channel: "Cosden Solutions",
    url: "https://www.youtube.com/watch?v=I6ypD7qv3Z8",
    thumbnail: "https://img.youtube.com/vi/I6ypD7qv3Z8/maxresdefault.jpg",
    category: "Architecture"
  },
  {
    id: 3,
    title: "10 Must Know Clean Code Tips",
    channel: "Web Dev Simplified",
    url: "https://www.youtube.com/watch?v=UjgO6D-9H0c",
    thumbnail: cleanCodeImg,
    category: "Clean Code"
  },
  {
    id: 4,
    title: "System Design Interview: A Step-By-Step Guide",
    channel: "ByteByteGo",
    url: "https://www.youtube.com/watch?v=bBTPZ9NdSk8",
    thumbnail: "https://img.youtube.com/vi/bBTPZ9NdSk8/maxresdefault.jpg",
    category: "System Design"
  },
  {
    id: 5,
    title: "Data Structures Easy to Advanced Course",
    channel: "freeCodeCamp.org",
    url: "https://www.youtube.com/watch?v=RBSGKlAvoiM",
    thumbnail: "https://img.youtube.com/vi/RBSGKlAvoiM/maxresdefault.jpg",
    category: "DSA"
  },
  {
    id: 6,
    title: "Learn React useMemo In 12 Minutes",
    channel: "Web Dev Simplified",
    url: "https://www.youtube.com/watch?v=THL1OPn72vo",
    thumbnail: "https://img.youtube.com/vi/THL1OPn72vo/maxresdefault.jpg",
    category: "React"
  }
];

export default function BestPractices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredVideos = initialVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          video.channel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || video.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground mb-4">
            Best Practices
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl">
            Curated learning resources from YouTube
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search videos or channels..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-secondary border border-border rounded-full py-2.5 pl-10 pr-4 text-foreground focus:outline-none focus:border-[#8bc34a]/50 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category 
                    ? 'bg-[#8bc34a] text-black shadow-[0_0_10px_rgba(139,195,74,0.3)]' 
                    : 'bg-secondary text-muted-foreground hover:text-foreground border border-border/50 hover:border-border/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          layout
        >
          {filteredVideos.map((video, index) => (
            <motion.a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="group flex flex-col bg-secondary rounded-xl overflow-hidden border border-border/50 hover:border-[#8bc34a]/30 hover:shadow-[0_0_20px_rgba(139,195,74,0.15)] transition-all"
            >
              <div className="relative aspect-video overflow-hidden bg-[#111] flex items-center justify-center">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  // Fallback to 0.jpg if maxresdefault is not available
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.includes('maxresdefault.jpg')) {
                      target.src = target.src.replace('maxresdefault.jpg', '0.jpg');
                    } else {
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }
                  }}
                />
                <div className="hidden absolute inset-0 bg-[#111] flex-col items-center justify-center text-gray-600 group-hover:text-gray-500 transition-colors">
                    <PlayCircle className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-xs uppercase tracking-widest font-bold">Video Thumbnail</span>
                </div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                <div className="absolute bottom-3 right-3 bg-black/80 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <ExternalLink className="w-4 h-4 text-[#8bc34a]" />
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <span className="text-xs font-semibold text-[#8bc34a] mb-2">{video.category}</span>
                <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">{video.title}</h3>
                <p className="text-sm text-muted-foreground mt-auto flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs text-foreground/70">
                    {video.channel.charAt(0)}
                  </span>
                  {video.channel}
                </p>
              </div>
            </motion.a>
          ))}
          
          {filteredVideos.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">
              No videos found matching your criteria.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
