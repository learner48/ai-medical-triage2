interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="bg-semantic-critical/10 text-semantic-critical p-4 rounded-lg">
      {message}
    </div>
  );
}