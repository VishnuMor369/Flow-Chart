import { useState } from 'react';
import { FaLinkedinIn, FaTwitter, FaBehance, FaInstagram } from 'react-icons/fa';
import { cn } from '@/lib/utils';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    behance?: string;
  };
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Sheryians AI School',
    role: 'ML',
    image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2070&auto=format&fit=crop',
    social: { twitter: '#', linkedin: '#' },
  },
  {
    id: '2',
    name: 'CodeHelp by Babbar',
    role: 'FULLSTACK',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop',
    social: { twitter: '#', linkedin: '#' },
  },
  {
    id: '3',
    name: 'Code Editor',
    role: 'BLOCK CHAIN',
    image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1974&auto=format&fit=crop',
    social: { twitter: '#', linkedin: '#' },
  },
  {
    id: '4',
    name: 'WsCube Tech',
    role: 'FRONTEND',
    image: 'https://www.wscubetech.com/_next/image?url=https%3A%2F%2Fdeen3evddmddt.cloudfront.net%2Fuploads%2Freview-images%2Fsujal-img.webp&w=640&q=75',
    social: { twitter: '#' },
  },
  {
    id: '5',
    name: 'freeCodeCamp',
    role: 'BACKEND',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuv-L8Jslq__ogDlqO7vkEBDPGKfhYxYlHVg&s',
    social: { twitter: '#', linkedin: '#' },
  },
  {
    id: '6',
    name: 'Programming with Mosh',
    role: 'DEVOPS',
    image: 'https://yt3.googleusercontent.com/HCv0fXFEEcD0HRyF0_qR1K7b7qO3KCzmIoyH1DEJYB94CIUFhIE5i2t2IDIPX97W1-DK4hegww=s900-c-k-c0x00ffffff-no-rj',
    social: { twitter: '#' },
  },
];

interface TeamShowcaseProps {
  members?: TeamMember[];
}

export default function TeamShowcase({ members = DEFAULT_MEMBERS }: TeamShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const col1 = members.filter((_, i) => i % 3 === 0);
  const col2 = members.filter((_, i) => i % 3 === 1);
  const col3 = members.filter((_, i) => i % 3 === 2);

  return (
    <div className="bg-background text-foreground py-20 px-4 md:px-6 font-sans">
      <div className="max-w-5xl mx-auto mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Community Driven</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Routiq is built by Kamran Ahmed and maintained with the help of the amazing developer community. Join over 2.8M registered developers.</p>
      </div>
      <div className="flex flex-col md:flex-row items-start gap-8 md:gap-10 lg:gap-14 select-none w-full max-w-5xl mx-auto">
        {/* ── Left: photo grid ── */}
        <div className="flex gap-2 md:gap-3 flex-shrink-0 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          {/* Column 1 */}
          <div className="flex flex-col gap-2 md:gap-3">
            {col1.map((member) => (
              <PhotoCard
                key={member.id}
                member={member}
                className="w-[110px] h-[120px] sm:w-[130px] sm:h-[140px] md:w-[155px] md:h-[165px]"
                hoveredId={hoveredId}
                onHover={setHoveredId}
              />
            ))}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-2 md:gap-3 mt-[48px] sm:mt-[56px] md:mt-[68px]">
            {col2.map((member) => (
              <PhotoCard
                key={member.id}
                member={member}
                className="w-[122px] h-[132px] sm:w-[145px] sm:h-[155px] md:w-[172px] md:h-[182px]"
                hoveredId={hoveredId}
                onHover={setHoveredId}
              />
            ))}
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-2 md:gap-3 mt-[22px] sm:mt-[26px] md:mt-[32px]">
            {col3.map((member) => (
              <PhotoCard
                key={member.id}
                member={member}
                className="w-[115px] h-[125px] sm:w-[136px] sm:h-[146px] md:w-[162px] md:h-[172px]"
                hoveredId={hoveredId}
                onHover={setHoveredId}
              />
            ))}
          </div>
        </div>

        {/* ── Right: member name list*/}
        <div className="flex flex-col sm:grid sm:grid-cols-2 md:flex md:flex-col gap-4 md:gap-5 pt-0 md:pt-2 flex-1 w-full mt-10 md:mt-0">
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PhotoCard({
  member,
  className,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  className: string;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl cursor-pointer flex-shrink-0 transition-opacity duration-400',
        className,
        isDimmed ? 'opacity-30' : 'opacity-100',
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <img
        src={member.image}
        alt={member.name}
        className="w-full h-full object-cover transition-[filter] duration-500"
        style={{
          filter: isActive ? 'grayscale(0) brightness(1)' : 'grayscale(1) brightness(0.77)',
        }}
      />
    </div>
  );
}

function MemberRow({
  member,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;
  const hasSocial = member.social?.twitter ?? member.social?.linkedin ?? member.social?.instagram ?? member.social?.behance;

  return (
    <div
      className={cn(
        'cursor-pointer transition-opacity duration-300',
        isDimmed ? 'opacity-30' : 'opacity-100',
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'w-4 h-3 rounded-[5px] flex-shrink-0 transition-all duration-300',
            isActive ? 'bg-[#8bc34a] w-5' : 'bg-[#8bc34a]/30',
          )}
        />
        <span
          className={cn(
            'text-lg md:text-[20px] font-bold leading-none tracking-tight transition-colors duration-300',
            isActive ? 'text-foreground' : 'text-foreground/80',
          )}
        >
          {member.name}
        </span>

        {hasSocial && (
          <div
            className={cn(
              'flex items-center gap-1.5 ml-0.5 transition-all duration-200',
              isActive
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-2 pointer-events-none',
            )}
          >
            {member.social?.twitter && (
              <a
                href={member.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded text-muted-foreground hover:text-[#8bc34a] hover:bg-muted transition-all duration-150 hover:scale-110"
              >
                <FaTwitter size={14} />
              </a>
            )}
          </div>
        )}
      </div>
      <p className="mt-2 pl-[27px] text-[10px] md:text-[12px] font-bold uppercase tracking-[0.2em] text-[#8bc34a]">
        {member.role}
      </p>
    </div>
  );
}
