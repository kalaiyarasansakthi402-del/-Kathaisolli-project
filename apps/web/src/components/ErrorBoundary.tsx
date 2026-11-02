import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Leaf } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Kathaisolli ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-[#F8F5E9] dark:bg-[#033B2B] text-[#173D2E] dark:text-[#F8F5E9] transition-colors">
          <div className="max-w-lg w-full p-8 rounded-3xl bg-white dark:bg-[#083325] border-2 border-[#E3DCBA] dark:border-[#124835] shadow-xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0E2] dark:bg-[#064E3B] text-xs font-bold text-[#064E3B] dark:text-[#A7F3D0]">
                <Leaf className="w-3.5 h-3.5 fill-current" />
                <span>Kathaisolli · கதைசொல்லி</span>
              </div>
              <h2 className="text-2xl font-black font-serif text-[#064E3B] dark:text-[#F8F5E9]">
                {this.props.fallbackTitle || 'பக்கத்தை ஏற்றுவதில் பிழை (Page Error)'}
              </h2>
              <p className="text-sm text-[#173D2E]/80 dark:text-stone-300">
                {this.props.fallbackMessage ||
                  'மன்னிக்கவும், பக்கத்தை ஏற்றுவதில் எதிர்பாராத பிழை ஏற்பட்டது. தயவுசெய்து பக்கத்தை மீண்டும் ஏற்றவும்.'}
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-[#032419] text-left text-xs font-mono text-stone-600 dark:text-stone-400 overflow-x-auto max-h-32 border border-stone-200 dark:border-stone-800">
                <span className="font-bold text-amber-700 dark:text-amber-400">Error:</span> {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#064E3B] hover:bg-[#075C45] text-white font-bold text-sm shadow-md hover:scale-105 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>மீண்டும் ஏற்று (Reload)</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#E8F0E2] dark:bg-[#032419] hover:bg-[#D5E6CC] text-[#064E3B] dark:text-[#A7F3D0] border border-[#D5CEBA] dark:border-[#124835] font-bold text-sm transition-all"
              >
                <Home className="w-4 h-4" />
                <span>முகப்பு (Home)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
