import React, { useState, useEffect, Component, ReactNode } from "react";
import Chart from "react-apexcharts";
import { Props as ChartProps } from "react-apexcharts";

class ChartErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn("ApexChart render error fallback activated:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Chart visualization preview</span>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SafeChart(props: ChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof window === "undefined") {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <span className="text-xs text-gray-400">Loading chart...</span>
      </div>
    );
  }

  const ChartComponent = (Chart as any).default || Chart;

  return (
    <ChartErrorBoundary>
      <ChartComponent {...props} />
    </ChartErrorBoundary>
  );
}
