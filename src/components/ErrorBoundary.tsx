"use client";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI. Defaults to a minimal error card. */
  fallback?: ReactNode;
  /** Optional component label for error reporting (e.g. "REAPACopilot"). */
  label?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * ErrorBoundary — Sprint 11
 *
 * Wraps any subtree and catches synchronous render errors.
 * Renders a recoverable fallback card instead of a white-screen crash.
 *
 * Usage:
 *   <ErrorBoundary label="REAPACopilot">
 *     <REAPACopilot />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? "Unknown error" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const label = this.props.label ?? "Unknown";
    console.error(`[ErrorBoundary: ${label}]`, error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-3 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center"
        >
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-red-400 mb-1">
              {this.props.label ? `${this.props.label} crashed` : "Something went wrong"}
            </p>
            <p className="text-xs text-gray-500 font-mono">{this.state.message}</p>
          </div>
          <button
            onClick={this.handleReset}
            className="mt-1 px-4 py-1.5 text-xs font-medium bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors border border-red-600/30"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
