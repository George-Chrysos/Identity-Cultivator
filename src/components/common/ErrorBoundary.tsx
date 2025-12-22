import { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logger } from '@/utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for graceful error handling
 * Prevents app crashes and shows user-friendly fallback UI
 * 
 * @example
 * <ErrorBoundary fallbackTitle="Shop Error" onRetry={() => refetch()}>
 *   <ShopContent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('ErrorBoundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      const { fallbackTitle = 'Something went wrong', fallbackMessage } = this.props;

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-[200px] p-8 bg-slate-900/60 backdrop-blur-md border-2 border-red-500/30 rounded-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          
          <h3 className="text-xl font-bold text-red-300 mb-2">{fallbackTitle}</h3>
          
          <p className="text-slate-400 text-center mb-6 max-w-md">
            {fallbackMessage || 'An unexpected error occurred. Please try again.'}
          </p>

          {this.props.onRetry && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-purple-500/30 transition-shadow"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>
          )}

          {import.meta.env.DEV && this.state.error && (
            <details className="mt-6 w-full max-w-lg">
              <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-400">
                Error Details (Dev Only)
              </summary>
              <pre className="mt-2 p-4 bg-slate-950 rounded-lg text-xs text-red-400 overflow-auto max-h-40">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
