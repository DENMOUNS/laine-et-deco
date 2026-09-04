import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Error500View } from '../views/Error500View';
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
    const isFetchError =
      error?.message?.includes('dynamically imported module') ||
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('Importing a module script failed');
    if (isFetchError && !window.sessionStorage.getItem('error_boundary_reloaded')) {
      window.sessionStorage.setItem('error_boundary_reloaded', '1');
      window.location.reload();
    }
  }

  public render() {
    if (this.state.hasError) {
      return <Error500View onNavigate={this.props.onNavigate} error={this.state.error} />;
    }

    return this.props.children;
  }
}
