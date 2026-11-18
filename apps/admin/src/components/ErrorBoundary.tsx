import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, LogIn } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('[Kathaisolli Admin] Uncaught React Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/admin';
  };

  private handleGoLogin = () => {
    window.location.href = '/admin/login';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7EE] text-[#1F2937] flex items-center justify-center p-4 selection:bg-[#064E3B] selection:text-white">
          <div className="w-full max-w-lg p-8 sm:p-10 rounded-3xl bg-white border border-gray-200 shadow-2xl space-y-6 text-center">
            {/* Warning Icon */}
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-serif">
                பயன்பாட்டில் எதிர்பாராத பிழை ஏற்பட்டது
              </h1>
              <p className="text-xs text-gray-600 font-tamil leading-relaxed">
                நிர்வாக தளத்தை ஏற்றுவதில் தொழில்நுட்பப் பிழை ஏற்பட்டுள்ளது. தயவுசெய்து பக்கத்தை மீண்டும் ஏற்றவும்.
              </p>
              <p className="text-[11px] text-gray-400">
                (An unexpected error occurred in the Admin Portal. Please reload the page.)
              </p>
            </div>

            {/* Diagnostic Details */}
            {this.state.error && (
              <div className="text-left p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-rose-700 overflow-x-auto max-h-32">
                <span className="font-bold">Error:</span> {this.state.error.message || String(this.state.error)}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold transition-colors shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>மீண்டும் ஏற்றுக (Reload)</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors border border-gray-200"
              >
                <Home className="w-4 h-4" />
                <span>முகப்பு (Dashboard)</span>
              </button>
              <button
                onClick={this.handleGoLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors border border-gray-200"
              >
                <LogIn className="w-4 h-4" />
                <span>உள்நுழைவு (Login)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
