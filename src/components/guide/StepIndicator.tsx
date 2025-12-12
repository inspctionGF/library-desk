import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function StepIndicator({ 
  totalSteps, 
  currentStep, 
  onStepClick,
  className 
}: StepIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onStepClick?.(index)}
          disabled={!onStepClick}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            index === currentStep 
              ? "w-6 bg-primary" 
              : index < currentStep
                ? "w-2 bg-primary/60"
                : "w-2 bg-muted-foreground/30",
            onStepClick && "cursor-pointer hover:bg-primary/80"
          )}
          aria-label={`Étape ${index + 1}`}
        />
      ))}
    </div>
  );
}
