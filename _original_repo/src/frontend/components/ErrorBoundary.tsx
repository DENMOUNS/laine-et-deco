import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Une erreur inattendue s'est produite.";
      
      try {
        // Check if it's a Firestore error JSON
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Erreur de base de données : ${parsed.error}`;
            if (parsed.error.includes('insufficient permissions')) {
              errorMessage = "Vous n'avez pas les permissions nécessaires pour effectuer cette action.";
            }
          }
        }
      } catch (e) {
        // Not a JSON error, use default or the error message directly
        if (this.state.error?.message) {
          errorMessage = this.state.error.message;
        }
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-10 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Oups ! Quelque chose s'est mal passé</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <Button
              onClick={this.handleReset}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all shadow-lg flex items-center justify-center gap-2 h-auto"
            >
              <RefreshCw size={20} />
              Réessayer
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
