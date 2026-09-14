import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl border-2 border-rose-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl font-black">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Oops! We encountered an issue displaying your itinerary.</h2>
          <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-md transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset & Reload Itinerary</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
