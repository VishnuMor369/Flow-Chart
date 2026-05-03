'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { LucideIcon } from 'lucide-react';
import {
	CodeIcon,
	GlobeIcon,
	LayersIcon,
	UserPlusIcon,
	Users,
	Star,
	FileText,
	Shield,
	RotateCcw,
	Handshake,
	Leaf,
	HelpCircle,
	BarChart,
	PlugIcon,
} from 'lucide-react';

type LinkItem = {
	title: string;
	href: string;
	icon: LucideIcon;
	description?: string;
};

type HeaderProps = {
	onAiTutorClick?: () => void;
};

export function Header({ onAiTutorClick }: HeaderProps = {}) {
	const [open, setOpen] = React.useState(false);
	const [profileOpen, setProfileOpen] = React.useState(false);
	const scrolled = useScroll(10);
	const { user, signOut, loading: authLoading } = useAuth();
	const navigate = useNavigate();

	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn('fixed top-0 z-50 w-full border-b border-transparent transition-all duration-300', {
				'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg':
					scrolled,
			})}
		>
			<div className="bg-[#8bc34a] text-black text-xs font-semibold py-1.5 px-4 text-center">
				Master SQL with our new premium course — Start Learning →
			</div>
			<nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
				<div className="flex items-center gap-5">
					<a href="#" className="hover:text-[#8bc34a] transition-colors rounded-md p-2 flex items-center font-bold text-lg gap-2 tracking-tight">
						<span className="text-[#8bc34a]">R</span> outiq
					</a>
					<NavigationMenu className="hidden md:flex">
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuTrigger className="bg-transparent text-sm">Roadmaps</NavigationMenuTrigger>
								<NavigationMenuContent className="bg-background p-1 pr-1.5">
									<ul className="bg-popover grid w-max grid-cols-2 gap-2 rounded-md border p-2 shadow">
										{productLinks.map((item, i) => (
											<li key={i}>
												<ListItem {...item} />
											</li>
										))}
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuLink className="px-4 text-sm font-medium" asChild>
								<Link to="/best-practices" className="hover:text-[#8bc34a] transition-colors rounded-md p-2">
									Best Practices
								</Link>
							</NavigationMenuLink>
							<NavigationMenuLink className="px-4 text-sm font-medium" asChild>
								<a href="#team" className="hover:text-[#8bc34a] transition-colors rounded-md p-2">
									Guides
								</a>
							</NavigationMenuLink>
							<NavigationMenuLink className="px-4 text-sm font-medium" asChild>
								<button onClick={onAiTutorClick} className="hover:text-[#8bc34a] transition-colors rounded-md p-2 text-[#8bc34a] cursor-pointer bg-transparent border-none">
									AI Tutor
								</button>
							</NavigationMenuLink>
						</NavigationMenuList>
					</NavigationMenu>
				</div>
				<div className="hidden items-center gap-2 md:flex">
					{user ? (
						<div className="relative">
							<button
								onClick={() => setProfileOpen(!profileOpen)}
								className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-[#8bc34a]/30 hover:bg-white/5 transition-all"
							>
								{user.user_metadata?.avatar_url ? (
									<img src={user.user_metadata.avatar_url} alt="" className="w-6 h-6 rounded-full" />
								) : (
									<div className="w-6 h-6 rounded-full bg-[#8bc34a] flex items-center justify-center text-black text-xs font-bold">
										{(user.email?.[0] || 'U').toUpperCase()}
									</div>
								)}
								<span className="text-sm font-medium text-gray-300 max-w-[120px] truncate">
									{user.user_metadata?.full_name || user.email?.split('@')[0]}
								</span>
							</button>
							{profileOpen && (
								<>
									<div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
									<div className="absolute right-0 top-full mt-2 w-48 bg-[#151515] border border-white/10 rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
										<button
											onClick={() => { setProfileOpen(false); navigate('/dashboard'); }}
											className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-[#8bc34a] transition-colors"
										>
											Dashboard
										</button>
										<hr className="border-white/10 my-1" />
										<button
											onClick={async () => { setProfileOpen(false); await signOut(); navigate('/'); }}
											className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-400/5 transition-colors"
										>
											Sign Out
										</button>
									</div>
								</>
							)}
						</div>
					) : (
						<>
							<Button variant="ghost" className="hover:text-[#8bc34a]" asChild>
								<Link to="/login">Log In</Link>
							</Button>
							<Button className="bg-[#8bc34a] text-black hover:bg-[#8bc34a]/90 font-semibold" asChild>
								<Link to="/login">Sign Up</Link>
							</Button>
						</>
					)}
				</div>
				<Button
					size="icon"
					variant="outline"
					onClick={() => setOpen(!open)}
					className="md:hidden border-none hover:bg-transparent"
					aria-expanded={open}
					aria-controls="mobile-menu"
					aria-label="Toggle menu"
				>
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</Button>
			</nav>
			<MobileMenu open={open} className="flex flex-col justify-between gap-2 overflow-y-auto">
				<NavigationMenu className="max-w-full">
					<div className="flex w-full flex-col gap-y-2">
						<span className="text-sm text-[#8bc34a] font-bold">Roadmaps</span>
						{productLinks.map((link) => (
							<ListItem key={link.title} {...link} />
						))}
					</div>
				</NavigationMenu>
				<div className="flex flex-col gap-2">
					{user ? (
						<>
							<Button variant="outline" className="w-full bg-transparent" asChild>
								<Link to="/dashboard">Dashboard</Link>
							</Button>
							<Button
								className="w-full bg-red-500/10 text-red-400 border border-red-400/20"
								onClick={async () => { await signOut(); navigate('/'); setOpen(false); }}
							>
								Sign Out
							</Button>
						</>
					) : (
						<>
							<Button variant="outline" className="w-full bg-transparent" asChild>
								<Link to="/login">Log In</Link>
							</Button>
							<Button className="w-full bg-[#8bc34a] text-black" asChild>
								<Link to="/login">Sign Up</Link>
							</Button>
						</>
					)}
				</div>
			</MobileMenu>
		</header>
	);
}

type MobileMenuProps = React.ComponentProps<'div'> & {
	open: boolean;
};

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
	if (!open || typeof window === 'undefined') return null;

	return createPortal(
		<div
			id="mobile-menu"
			className={cn(
				'bg-background/95 supports-[backdrop-filter]:bg-background/50 backdrop-blur-lg',
				'fixed top-[88px] right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y md:hidden',
			)}
		>
			<div
				data-slot={open ? 'open' : 'closed'}
				className={cn(
					'data-[slot=open]:animate-in data-[slot=open]:zoom-in-97 ease-out',
					'size-full p-4',
					className,
				)}
				{...props}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}

function ListItem({
	title,
	description,
	icon: Icon,
	className,
	href,
	...props
}: React.ComponentProps<typeof NavigationMenuLink> & LinkItem) {
	return (
		<NavigationMenuLink className={cn('w-full flex flex-row gap-x-2 data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-sm p-2', className)} {...props} asChild>
			<a href={href}>
				<div className="bg-background/40 flex aspect-square size-12 items-center justify-center rounded-md border border-border/50 shadow-sm">
					<Icon className="text-[#8bc34a] size-5" />
				</div>
				<div className="flex flex-col items-start justify-center">
					<span className="font-medium text-sm">{title}</span>
					<span className="text-muted-foreground text-xs">{description}</span>
				</div>
			</a>
		</NavigationMenuLink>
	);
}

const productLinks: LinkItem[] = [
	{
		title: 'Frontend',
		href: '/roadmap/frontend',
		description: 'Step by step guide to becoming a frontend developer',
		icon: GlobeIcon,
	},
	{
		title: 'Backend',
		href: '/roadmap/backend',
		description: 'Step by step guide to becoming a backend developer',
		icon: LayersIcon,
	},
	{
		title: 'DevOps',
		href: '/roadmap/devops',
		description: 'Step by step guide to becoming a devops engineer',
		icon: UserPlusIcon,
	},
	{
		title: 'Full Stack',
		href: '/roadmap/full-stack',
		description: 'Step by step guide to becoming a full stack developer',
		icon: CodeIcon,
	},
	{
		title: 'Machine Learning',
		href: '/roadmap/machine-learning',
		description: 'Step by step guide to becoming an ML engineer',
		icon: Shield,
	},
	{
		title: 'Block Chain',
		href: '/roadmap/blockchain',
		description: 'Step by step guide to becoming a blockchain developer',
		icon: BarChart,
	},
];

function useScroll(threshold: number) {
	const [scrolled, setScrolled] = React.useState(false);

	const onScroll = React.useCallback(() => {
		setScrolled(window.scrollY > threshold);
	}, [threshold]);

	React.useEffect(() => {
		window.addEventListener('scroll', onScroll);
		return () => window.removeEventListener('scroll', onScroll);
	}, [onScroll]);

	React.useEffect(() => {
		onScroll();
	}, [onScroll]);

	return scrolled;
}
