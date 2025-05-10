import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  const { toast } = useToast();
  useEffect(() => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }, [error, toast]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="mb-4">{error.message}</p>
      <button className="btn" onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  );
}

export default function App({
  Component,
  pageProps,
}: {
  Component: any;
  pageProps: any;
}) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}
