'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CheckCircleIcon, StarIcon } from 'lucide-react';
import { motion, Transition } from 'framer-motion';

type FREQUENCY = 'monthly' | 'yearly';
const frequencies: FREQUENCY[] = ['monthly', 'yearly'];

interface Plan {
	name: string;
	info: string;
	price: {
		monthly: number;
		yearly: number;
	};
	features: {
		text: string;
		tooltip?: string;
	}[];
	btn: {
		text: string;
		href: string;
	};
	highlighted?: boolean;
}

interface PricingSectionProps extends React.ComponentProps<'div'> {
	plans: Plan[];
	heading: string;
	description?: string;
}

export function PricingSection({
	plans,
	heading,
	description,
	...props
}: PricingSectionProps) {
	const [frequency, setFrequency] = React.useState<'monthly' | 'yearly'>(
		'monthly',
	);

	return (
		<div
			className={cn(
				'flex w-full flex-col items-center justify-center space-y-10 py-20 px-4 bg-[#0f0f0f]',
				props.className,
			)}
			{...props}
		>
			<div className="mx-auto max-w-2xl space-y-4">
				<h2 className="text-center text-4xl font-bold tracking-tight md:text-5xl text-white">
					{heading}
				</h2>
				{description && (
					<p className="text-gray-400 text-center text-lg max-w-xl mx-auto">
						{description}
					</p>
				)}
			</div>
			
			<div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 pt-10">
				{plans.map((plan) => (
					<PricingCard plan={plan} key={plan.name} frequency={frequency} />
				))}
			</div>
		</div>
	);
}

type PricingCardProps = React.ComponentProps<'div'> & {
	plan: Plan;
	frequency?: FREQUENCY;
};

export function PricingCard({
	plan,
	className,
	frequency = frequencies[0],
	...props
}: PricingCardProps) {
	return (
		<div
			key={plan.name}
			className={cn(
				'relative flex w-full flex-col rounded-2xl border border-white/10 bg-[#151515]',
				className,
			)}
			{...props}
		>
			{plan.highlighted && (
				<BorderTrail
					style={{
						boxShadow:
							'0px 0px 60px 30px rgba(139, 195, 74, 0.5), 0 0 100px 60px rgba(0, 0, 0, 0.5), 0 0 140px 90px rgba(0, 0, 0, 0.5)',
					}}
					size={100}
				/>
			)}
			<div
				className={cn(
					'bg-white/5 rounded-t-2xl border-b border-white/10 p-8',
					plan.highlighted && 'bg-[#8bc34a]/10 border-[#8bc34a]/30',
				)}
			>
				<div className="absolute top-4 right-4 z-10 flex items-center gap-2">
					{plan.highlighted && (
						<p className="bg-[#8bc34a] text-black font-bold flex items-center gap-1.5 rounded-full px-3 py-1 text-xs uppercase tracking-wider">
							<StarIcon className="h-3 w-3 fill-current" />
							Premium
						</p>
					)}
				</div>

				<div className="text-2xl font-bold text-white">{plan.name}</div>
				<p className="text-gray-400 text-sm mt-2">{plan.info}</p>
				<h3 className="mt-4 flex items-end gap-1">
					<span className="text-4xl font-black text-white">{plan.price.monthly === 0 ? 'Free' : `₹${plan.price[frequency]}`}</span>
				</h3>
			</div>
			<div
				className={cn(
					'text-gray-300 space-y-4 px-8 py-8 text-base flex-1',
					plan.highlighted && 'bg-[#8bc34a]/5',
				)}
			>
				{plan.features.map((feature, index) => (
					<div key={index} className="flex items-center gap-3">
						<CheckCircleIcon className="text-[#8bc34a] h-5 w-5 shrink-0" />
						<TooltipProvider>
							<Tooltip delayDuration={0}>
								<TooltipTrigger asChild>
									<p
										className={cn(
											feature.tooltip &&
												'cursor-pointer border-b border-dashed border-gray-600',
										)}
									>
										{feature.text}
									</p>
								</TooltipTrigger>
								{feature.tooltip && (
									<TooltipContent className="bg-[#222] text-white border-white/10">
										<p>{feature.tooltip}</p>
									</TooltipContent>
								)}
							</Tooltip>
						</TooltipProvider>
					</div>
				))}
			</div>
			<div
				className={cn(
					'mt-auto w-full p-8 pt-0',
					plan.highlighted && 'bg-[#8bc34a]/5 rounded-b-2xl',
				)}
			>
				<Button
					className={cn("w-full py-6 text-lg font-bold rounded-xl", plan.highlighted ? "bg-[#8bc34a] text-black hover:bg-[#8bc34a]/90 hover:scale-[1.02] transition-transform" : "bg-white/10 text-white hover:bg-white/20 hover:scale-[1.02] transition-transform")}
				>
					{plan.btn.text}
				</Button>
			</div>
		</div>
	);
}

type BorderTrailProps = {
  className?: string;
  size?: number;
  transition?: Transition;
  delay?: number;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
};

export function BorderTrail({
  className,
  size = 60,
  transition,
  delay,
  onAnimationComplete,
  style,
}: BorderTrailProps) {
  const BASE_TRANSITION = {
    repeat: Infinity,
    duration: 5,
    ease: 'linear' as any,
  };

  return (
    <div className='pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]'>
      <motion.div
        className={cn('absolute aspect-square bg-[#8bc34a]', className)}
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          ...style,
        }}
        animate={{
          offsetDistance: ['0%', '100%'],
        }}
        transition={{
          ...(transition ?? BASE_TRANSITION),
          delay: delay,
        }}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
}
