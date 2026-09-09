"use client";
import React, { Component, ReactNode } from "react";

export class CanvasErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full w-full bg-red-900 text-white p-10 flex-col z-[999] absolute inset-0">
          <h2 className="text-2xl font-bold mb-4">🚨 Vercel Crash Caught!</h2>
          <pre className="bg-black p-4 rounded text-red-400 max-w-2xl overflow-auto border border-red-500 whitespace-pre-wrap">
            {this.state.error}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}