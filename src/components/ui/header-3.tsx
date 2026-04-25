'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { createPortal } from 'react-dom';
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

export function Header() {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);

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
								<a href="#" className="hover:text-[#8bc34a] transition-colors rounded-md p-2">
									Best Practices
								</a>
							</NavigationMenuLink>
							<NavigationMenuLink className="px-4 text-sm font-medium" asChild>
								<a href="#team" className="hover:text-[#8bc34a] transition-colors rounded-md p-2">
									Guides
								</a>
							</NavigationMenuLink>
                            <NavigationMenuLink className="px-4 text-sm font-medium" asChild>
								<a href="#" className="hover:text-[#8bc34a] transition-colors rounded-md p-2 text-[#8bc34a]">
									AI Tutor
								</a>
							</NavigationMenuLink>
						</NavigationMenuList>
					</NavigationMenu>
				</div>
				<div className="hidden items-center gap-2 md:flex">
					<Button variant="ghost" className="hover:text-[#8bc34a]" asChild>
						<a href="/#signin">Log In</a>
					</Button>
					<Button className="bg-[#8bc34a] text-black hover:bg-[#8bc34a]/90 font-semibold" asChild>
						<a href="/#signin">Sign Up</a>
					</Button>
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
					<Button variant="outline" className="w-full bg-transparent" asChild>
						<a href="/#signin">Log In</a>
					</Button>
					<Button className="w-full bg-[#8bc34a] text-black" asChild>
						<a href="/#signin">Sign Up</a>
					</Button>
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
