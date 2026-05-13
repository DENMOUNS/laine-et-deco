import React, { Component, ErrorInfo, ReactNode, Suspense, lazy } from 'react';
const Error500View = lazy(() => import('../views/Error500View').then(m => ({ default: m.Error500View })));
import { Loader } from './Loader';

interface Props {
  children: ReactNode;
  onNavigate: (view: string) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Suspense fallback={<Loader fullScreen text="Une erreur est survenue..." />}>
          <Error500View onNavigate={this.props.onNavigate} error={this.state.error} />
        </Suspense>
      );
    }

    return this.props.children;
  }
}
