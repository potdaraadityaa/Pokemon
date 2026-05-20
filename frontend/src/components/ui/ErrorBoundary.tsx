import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled runtime error in UI thread:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-card rounded-3xl p-8 border border-red-500/20 text-center relative overflow-hidden">
            {/* Outer red glowing orb */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-500/10 rounded-full blur-3xl -z-10" />

            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-8 h-8 animate-bounce" />
              </div>

              <div>
                <h1 className="text-2xl font-black text-white leading-tight">
                  A Wild <span className="text-red-400 font-mono">Error</span> Appeared!
                </h1>
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                  The application encountered an unexpected runtime issue. Don't worry, your Pokedex state remains safe.
                </p>
              </div>

              {this.state.error && (
                <div className="w-full text-left bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-xs text-red-300 max-h-36 overflow-y-auto break-all">
                  <span className="font-bold text-gray-500">Error:</span> {this.state.error.message}
                </div>
              )}

              <div className="flex gap-3 w-full">
                <Button
                  onClick={this.handleReset}
                  className="flex-1"
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Reload App
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => { window.location.reload(); }}
                  icon={<Home className="w-4 h-4" />}
                >
                  Hard Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
