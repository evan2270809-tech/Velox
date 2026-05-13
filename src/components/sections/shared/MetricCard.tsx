import { FeatureCard } from "@/components/ui/FeatureCard";

interface MetricCardProps {
  value: string;
  label: string;
  index?: number;
}

export function MetricCard({ value, label, index = 0 }: MetricCardProps) {
  return (
    <div className="animate-spring-in" style={{ animationDelay: `${index * 80}ms` }}>
      <FeatureCard className="flex flex-col gap-2">
        <p className="font-display text-[44px] leading-none text-[var(--color-starlight)]">
          {value}
        </p>
        <p className="text-[14px] tracking-[0.04em] text-[var(--color-silver)]">{label}</p>
      </FeatureCard>
    </div>
  );
}
