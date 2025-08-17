import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onFinish?: () => void;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  finishLabel?: string;
}

export function FormNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onFinish,
  isNextDisabled = false,
  isLoading = false,
  nextLabel = "Next",
  previousLabel = "Previous",
  finishLabel = "Finish"
}: FormNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between items-center pt-6 border-t">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">
          Step {currentStep} of {totalSteps}
        </span>
        <div className="flex space-x-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i + 1 <= currentStep
                  ? "bg-primary"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex space-x-2">
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isLoading}
            data-testid="button-previous"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {previousLabel}
          </Button>
        )}

        {!isLastStep && (
          <Button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled || isLoading}
            data-testid="button-next"
          >
            {nextLabel}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}

        {isLastStep && (
          <Button
            type="submit"
            onClick={onFinish}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-finish"
          >
            <Check className="h-4 w-4 mr-2" />
            {isLoading ? "Processing..." : finishLabel}
          </Button>
        )}
      </div>
    </div>
  );
}