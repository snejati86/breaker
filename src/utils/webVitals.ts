import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

type ReportHandler = (metric: Metric) => void;

/**
 * Reports web vitals metrics to the console and optionally to an analytics service.
 *
 * Core Web Vitals:
 * - LCP (Largest Contentful Paint): Loading performance - should be < 2.5s
 * - INP (Interaction to Next Paint): Interactivity - should be < 200ms
 * - CLS (Cumulative Layout Shift): Visual stability - should be < 0.1
 *
 * Other metrics:
 * - FCP (First Contentful Paint): Initial render time
 * - TTFB (Time to First Byte): Server response time
 */
export function reportWebVitals(onReport?: ReportHandler): void {
  const handleMetric: ReportHandler = (metric) => {
    // Log to console in development
    if (import.meta.env.DEV) {
      const color = getMetricColor(metric);
      console.log(
        `%c[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}${getMetricUnit(metric.name)}`,
        `color: ${color}; font-weight: bold;`
      );
    }

    // Call custom handler if provided
    if (onReport) {
      onReport(metric);
    }

    // TODO: Send to analytics service in production
    // Example: sendToAnalytics(metric);
  };

  onCLS(handleMetric);
  onINP(handleMetric);
  onFCP(handleMetric);
  onLCP(handleMetric);
  onTTFB(handleMetric);
}

/**
 * Get a color based on the metric's performance rating
 */
function getMetricColor(metric: Metric): string {
  const { name, value } = metric;

  // Thresholds based on Google's recommendations
  const thresholds: Record<string, { good: number; poor: number }> = {
    CLS: { good: 0.1, poor: 0.25 },
    INP: { good: 200, poor: 500 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
  };

  const threshold = thresholds[name];
  if (!threshold) return '#888';

  if (value <= threshold.good) return '#0f0'; // Good - green
  if (value <= threshold.poor) return '#ff0'; // Needs improvement - yellow
  return '#f00'; // Poor - red
}

/**
 * Get the unit for a metric
 */
function getMetricUnit(name: string): string {
  if (name === 'CLS') return '';
  return 'ms';
}

/**
 * Example analytics sender (implement based on your analytics service)
 */
export function sendToAnalytics(metric: Metric): void {
  // Example: Send to Google Analytics
  // gtag('event', metric.name, {
  //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  //   event_category: 'Web Vitals',
  //   event_label: metric.id,
  //   non_interaction: true,
  // });

  // Example: Send to custom endpoint
  // fetch('/api/analytics/vitals', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     name: metric.name,
  //     value: metric.value,
  //     rating: metric.rating,
  //     id: metric.id,
  //     navigationType: metric.navigationType,
  //   }),
  // });

  console.debug('[Analytics] Would send metric:', metric);
}
