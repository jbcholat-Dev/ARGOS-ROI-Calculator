import { clsx } from 'clsx';
import { Button } from '@/components/ui';

export interface NewAnalysisButtonProps {
  className?: string;
  onClick?: () => void;
}

export function NewAnalysisButton({ className, onClick }: NewAnalysisButtonProps) {
  return (
    <Button
      variant="primary"
      size="lg"
      onClick={onClick}
      className={clsx(className)}
    >
      New Analysis
    </Button>
  );
}
