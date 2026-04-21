/**
 * Azure Application Insights Service for Frontend
 * 
 * This service provides telemetry and monitoring for the React frontend.
 * It tracks:
 * - Page views (automatic)
 * - User actions and interactions
 * - Performance metrics
 * - Exceptions and errors
 * - Custom events
 */

import { ApplicationInsights, ICustomProperties, SeverityLevel } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

// Create React plugin instance
export const reactPlugin = new ReactPlugin();

// App Insights instance - will be initialized with connection string
let appInsights: ApplicationInsights | null = null;
let isInitialized = false;

/**
 * Initialize Application Insights with the connection string from config
 * 
 * @param connectionString - The Application Insights connection string
 * @param history - Optional browser history for SPA page tracking
 * @returns boolean indicating success
 */
export function initAppInsights(connectionString?: string): boolean {
  if (!connectionString) {
    return false;
  }

  if (isInitialized) {
    return true;
  }

  try {
    appInsights = new ApplicationInsights({
      config: {
        connectionString,
        extensions: [reactPlugin],
        enableAutoRouteTracking: true, // Automatically track page views in SPA
        disableAjaxTracking: false, // Track XHR/Fetch requests
        disableFetchTracking: false,
        enableCorsCorrelation: true, // Correlate frontend calls with backend
        // Exclude Auth0 from correlation headers (they don't allow custom headers)
        correlationHeaderExcludedDomains: [
          '*.auth0.com',
          'backfolio.us.auth0.com'
        ],
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
        autoTrackPageVisitTime: true, // Track how long users spend on pages
        disableExceptionTracking: false, // Track JavaScript exceptions
        maxAjaxCallsPerView: 500, // Allow tracking many API calls
      }
    });

    appInsights.loadAppInsights();
    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize Application Insights:', error);
    return false;
  }
}

/**
 * Check if Application Insights is enabled
 */
export function isAppInsightsEnabled(): boolean {
  return isInitialized && appInsights !== null;
}

/**
 * Get the underlying Application Insights instance
 */
export function getAppInsights(): ApplicationInsights | null {
  return appInsights;
}

/**
 * Track a custom event
 * 
 * @param name - Event name (e.g., "BacktestStarted", "StrategyCreated")
 * @param properties - Additional properties to include
 */
export function trackEvent(name: string, properties?: ICustomProperties): void {
  if (!isInitialized || !appInsights) {
    return;
  }

  try {
    appInsights.trackEvent({ name }, properties);
  } catch (error) {
    console.warn(`Failed to track event ${name}:`, error);
  }
}

/**
 * Track a page view (usually automatic, but can be called manually)
 * 
 * @param name - Page name
 * @param uri - Optional page URI
 * @param properties - Additional properties
 */
export function trackPageView(name: string, uri?: string, properties?: ICustomProperties): void {
  if (!isInitialized || !appInsights) {
    return;
  }

  try {
    appInsights.trackPageView({ name, uri, properties });
  } catch (error) {
    console.warn(`Failed to track page view ${name}:`, error);
  }
}

/**
 * Track an exception
 * 
 * @param error - The error object
 * @param properties - Additional context
 * @param severityLevel - Optional severity (defaults to Error)
 */
export function trackException(
  error: Error,
  properties?: ICustomProperties,
  severityLevel: SeverityLevel = SeverityLevel.Error
): void {
  if (!isInitialized || !appInsights) {
    console.error('[AppInsights] Exception not tracked (not initialized):', error);
    return;
  }

  try {
    appInsights.trackException({
      exception: error,
      severityLevel,
      properties
    });
  } catch (err) {
    console.warn('Failed to track exception:', err);
  }
}

/**
 * Track a custom metric
 * 
 * @param name - Metric name
 * @param average - Metric value
 * @param properties - Additional dimensions
 */
export function trackMetric(name: string, average: number, properties?: ICustomProperties): void {
  if (!isInitialized || !appInsights) {
    return;
  }

  try {
    appInsights.trackMetric({ name, average }, properties);
  } catch (error) {
    console.warn(`Failed to track metric ${name}:`, error);
  }
}

/**
 * Set the authenticated user context
 * 
 * @param userId - User identifier (should be anonymized/hashed for privacy)
 * @param accountId - Optional account/tenant ID
 */
export function setAuthenticatedUser(userId: string, accountId?: string): void {
  if (!isInitialized || !appInsights) {
    return;
  }

  try {
    appInsights.setAuthenticatedUserContext(userId, accountId, true);
  } catch (error) {
    console.warn('Failed to set authenticated user context:', error);
  }
}

/**
 * Clear the authenticated user context (on logout)
 */
export function clearAuthenticatedUser(): void {
  if (!isInitialized || !appInsights) {
    return;
  }

  try {
    appInsights.clearAuthenticatedUserContext();
  } catch (error) {
    console.warn('Failed to clear authenticated user context:', error);
  }
}

/**
 * Start timing a custom operation
 * 
 * @returns A function to call when the operation completes
 */
export function startTrackEvent(name: string): () => void {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    trackEvent(name, { durationMs: Math.round(duration) });
    trackMetric(`${name}_Duration`, duration);
  };
}

// ============================================================================
// Pre-built tracking helpers for common Backfolio actions
// ============================================================================

/**
 * Track when a user starts a backtest
 */
export function trackBacktestStarted(properties?: {
  strategyName?: string;
  initialCapital?: number;
  dateRange?: string;
}): void {
  trackEvent('BacktestStarted', properties);
}

/**
 * Track when a backtest completes
 */
export function trackBacktestCompleted(properties: {
  success: boolean;
  durationMs: number;
  strategyName?: string;
  totalReturn?: number;
  sharpeRatio?: number;
}): void {
  trackEvent('BacktestCompleted', properties);
  trackMetric('BacktestDuration', properties.durationMs, { success: String(properties.success) });
}

/**
 * Track strategy creation
 */
export function trackStrategyCreated(properties?: {
  strategyName?: string;
  numAllocations?: number;
  numRules?: number;
}): void {
  trackEvent('StrategyCreated', properties);
}

/**
 * Track strategy saved
 */
export function trackStrategySaved(properties?: {
  strategyId?: string;
  strategyName?: string;
}): void {
  trackEvent('StrategySaved', properties);
}

/**
 * Track when user opens the AI assistant
 */
export function trackAIAssistantOpened(): void {
  trackEvent('AIAssistantOpened');
}

/**
 * Track navigation between pages
 */
export function trackNavigation(properties: {
  from?: string;
  to: string;
}): void {
  trackEvent('Navigation', properties);
}

/**
 * Track user login
 */
export function trackUserLogin(properties?: {
  provider?: string;
}): void {
  trackEvent('UserLogin', properties);
}

/**
 * Track user logout
 */
export function trackUserLogout(): void {
  trackEvent('UserLogout');
  clearAuthenticatedUser();
}

/**
 * Track comparison view usage
 */
export function trackComparisonStarted(properties?: {
  numStrategies?: number;
}): void {
  trackEvent('ComparisonStarted', properties);
}

/**
 * Track chart interaction
 */
export function trackChartInteraction(properties: {
  chartType: string;
  action: string;
}): void {
  trackEvent('ChartInteraction', properties);
}

/**
 * Track feature usage for analytics
 */
export function trackFeatureUsage(featureName: string, properties?: ICustomProperties): void {
  trackEvent('FeatureUsage', { featureName, ...properties });
}

