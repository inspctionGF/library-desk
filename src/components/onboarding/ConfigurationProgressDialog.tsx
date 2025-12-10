import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Sparkles } from 'lucide-react';

interface ConfigurationProgressDialogProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  { id: 1, label: 'Enregistrement des informations...' },
  { id: 2, label: 'Configuration de la base de données...' },
  { id: 3, label: 'Initialisation du système...' },
  { id: 4, label: 'Finalisation...' },
];

export function ConfigurationProgressDialog({ open, onComplete }: ConfigurationProgressDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const progress = (currentStep / steps.length) * 100;

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setIsComplete(false);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length) {
          clearInterval(interval);
          setIsComplete(true);
          return prev;
        }
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [open]);

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <div className="flex flex-col items-center py-6">
          {!isComplete ? (
            <>
              <div className="relative mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Configuration en cours...</h3>
              
              <div className="w-full mb-6">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center mt-2">
                  {Math.round(progress)}%
                </p>
              </div>

              <div className="w-full space-y-3">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3">
                    {index < currentStep ? (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    ) : index === currentStep ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted" />
                    )}
                    <span className={index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="relative mb-6">
                <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-primary-foreground" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">Configuration terminée !</h3>
              <p className="text-muted-foreground text-center mb-6">
                Votre centre de documentation est prêt à être utilisé.
              </p>
              
              <Button onClick={onComplete} size="lg" className="w-full">
                🚀 Commencer à utiliser BiblioSystem
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
