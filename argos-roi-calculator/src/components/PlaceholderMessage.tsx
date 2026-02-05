import { Button } from '@/components/ui';

export interface PlaceholderMessageProps {
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export function PlaceholderMessage({
  message,
  actionText,
  onAction,
}: PlaceholderMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <p className="text-2xl text-gray-600">{message}</p>
      {actionText && onAction && (
        <Button variant="primary" size="lg" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
