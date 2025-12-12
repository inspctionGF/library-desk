import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { StepIndicator } from './StepIndicator';
import { welcomeGuideSteps } from '@/data/welcomeGuideSteps';
import { cn } from '@/lib/utils';

interface WelcomeGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (dontShowAgain: boolean) => void;
}

export function WelcomeGuideDialog({
  open,
  onOpenChange,
  onComplete,
}: WelcomeGuideDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const step = welcomeGuideSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === welcomeGuideSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete(dontShowAgain);
      setCurrentStep(0);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete(dontShowAgain);
    setCurrentStep(0);
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const StepIcon = step.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>Guide de bienvenue</DialogTitle>
        </DialogHeader>
        
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </button>

        <div className="flex flex-col items-center py-6">
          {/* Icon */}
          <div className={cn(
            "flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6",
            "animate-scale-in"
          )}>
            <StepIcon className="h-10 w-10 text-primary" />
          </div>

          {/* Content */}
          <div key={step.id} className="text-center space-y-3 animate-fade-in">
            <h2 className="text-xl font-semibold">{step.title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed px-4">
              {step.description}
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator
            totalSteps={welcomeGuideSteps.length}
            currentStep={currentStep}
            onStepClick={handleStepClick}
            className="mt-8"
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            <Button
              onClick={handleNext}
              size="sm"
              className="gap-1"
            >
              {isLastStep ? "Commencer" : "Suivant"}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 border-t">
            <Checkbox
              id="dont-show"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <Label 
              htmlFor="dont-show" 
              className="text-xs text-muted-foreground cursor-pointer"
            >
              Ne plus afficher ce guide
            </Label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
