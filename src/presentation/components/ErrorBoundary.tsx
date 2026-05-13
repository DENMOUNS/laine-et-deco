import React, { Component, ErrorInfo } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
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
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    // @ts-ignore
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        // @ts-ignore
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Oups ! Quelque chose s'est mal passé</h1>
              <p className="text-slate-500 mb-8">
                Une erreur inattendue est survenue. Nous nous excusons pour le désagrément.
              </p>
              {this.state.error && (
                <div className="bg-red-50 rounded-lg p-4 mb-8 text-left overflow-auto max-h-32">
                  <code className="text-xs text-red-600 font-mono">
                    {this.state.error.message}
                  </code>
                </div>
              )}
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                <RefreshCcw size={18} />
                Recharger la page
              </button>
            </div>
          </div>
        )
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
