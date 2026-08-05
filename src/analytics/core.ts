export type AnalyticsValue = string | number | boolean | undefined;

export type AnalyticsParameters = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const scriptId = "google-analytics-tag";
let initialized = false;

export const isAnalyticsEnabled = () =>
  import.meta.env.PROD && Boolean(measurementId);

export const initializeAnalytics = () => {
  if (initialized || !isAnalyticsEnabled() || !measurementId) return;

  initialized = true;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    ((...args: unknown[]) => {
      window.dataLayer?.push(args);
    });

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: true,
  });

  if (!document.getElementById(scriptId)) {
    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      measurementId
    )}`;
    document.head.appendChild(script);
  }
};

export const trackEvent = (
  eventName: string,
  parameters: AnalyticsParameters = {}
) => {
  if (!isAnalyticsEnabled()) return;

  initializeAnalytics();
  const definedParameters = Object.fromEntries(
    Object.entries(parameters).filter(([, value]) => value !== undefined)
  );

  window.gtag?.("event", eventName, definedParameters);
};
