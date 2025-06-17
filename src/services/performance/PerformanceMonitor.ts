
export interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  memoryUsage?: number;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics | null = null;

  static async collectMetrics(): Promise<PerformanceMetrics> {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    
    const metrics: PerformanceMetrics = {
      pageLoadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
    };

    // Get paint metrics
    paintEntries.forEach(entry => {
      if (entry.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = entry.startTime;
      }
    });

    // Get LCP if available
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.largestContentfulPaint = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.log('LCP measurement not supported');
      }
    }

    // Get memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }

    this.metrics = metrics;
    return metrics;
  }

  static getMetrics(): PerformanceMetrics | null {
    return this.metrics;
  }

  static logMetrics(): void {
    if (this.metrics) {
      console.group('🚀 Performance Metrics');
      console.log('Page Load Time:', `${Math.round(this.metrics.pageLoadTime)}ms`);
      console.log('First Contentful Paint:', `${Math.round(this.metrics.firstContentfulPaint)}ms`);
      console.log('Largest Contentful Paint:', `${Math.round(this.metrics.largestContentfulPaint)}ms`);
      if (this.metrics.memoryUsage) {
        console.log('Memory Usage:', `${Math.round(this.metrics.memoryUsage)}MB`);
      }
      console.groupEnd();
    }
  }

  static isPerformanceGood(): boolean {
    if (!this.metrics) return false;
    
    return (
      this.metrics.pageLoadTime < 3000 &&
      this.metrics.firstContentfulPaint < 1800 &&
      (!this.metrics.memoryUsage || this.metrics.memoryUsage < 50)
    );
  }

  static getPerformanceRecommendations(): string[] {
    if (!this.metrics) return [];
    
    const recommendations: string[] = [];
    
    if (this.metrics.pageLoadTime > 3000) {
      recommendations.push('Optimize bundle size and enable code splitting');
    }
    
    if (this.metrics.firstContentfulPaint > 1800) {
      recommendations.push('Optimize critical rendering path and reduce blocking resources');
    }
    
    if (this.metrics.memoryUsage && this.metrics.memoryUsage > 50) {
      recommendations.push('Check for memory leaks and optimize component lifecycle');
    }
    
    return recommendations;
  }
}

// Auto-collect metrics on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      PerformanceMonitor.collectMetrics().then(() => {
        if (process.env.NODE_ENV === 'development') {
          PerformanceMonitor.logMetrics();
        }
      });
    }, 1000);
  });
}
