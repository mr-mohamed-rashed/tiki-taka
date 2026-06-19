import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[One2] App crashed:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-xl rounded-lg border border-destructive/40 bg-card p-6 text-center shadow-elevated">
          <h1 className="font-display text-2xl font-extrabold mb-3">One2 setup issue</h1>
          <p className="text-sm text-muted-foreground mb-4">
            The app loaded, but one setup value is missing or invalid. Check hosting environment variables and redeploy.
          </p>
          <pre className="whitespace-pre-wrap rounded bg-muted p-3 text-left text-xs text-destructive">
            {this.state.error.message}
          </pre>
        </div>
      </div>
    );
  }
}
