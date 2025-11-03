import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  // FIX: Made children optional to fix errors in App.tsx and HomePage.tsx.
  // This seems to be a requirement of the toolchain, as seen in other components.
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Reverted to a constructor-based state initialization. The class property syntax was causing a TypeScript issue where `this.props` was not recognized in the `render` method, likely due to a specific toolchain configuration.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <h1 className="font-bold text-lg mb-2">Something went wrong.</h1>
          <p>Please try refreshing the page. If the problem persists, contact support.</p>
          <details className="mt-2 text-sm text-gray-600">
            <summary>Error Details</summary>
            <pre className="mt-2 p-2 bg-gray-200 rounded text-xs overflow-auto">
              {this.state.error?.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;