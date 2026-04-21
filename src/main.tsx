import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { initAppInsights, trackEvent } from './services/appInsights'
import './index.css'
import App from './App.tsx'

// Fetch runtime config from server
async function initializeApp() {
    try {
        // Try /api/config first (production), fallback to /config.json (dev)
        let response;
        let config;

        try {
            response = await fetch('/api/config');
            if (!response.ok) {
                throw new Error('API config not available');
            }
            config = await response.json();
        } catch (apiError) {
            // Fallback to /config.json for local development
            try {
                response = await fetch('/config.json');
                if (!response.ok) {
                    throw new Error('Config file not found');
                }
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Config file is not JSON');
                }
                config = await response.json();
            } catch (configError) {
                console.error('Failed to load /config.json:', configError);
                throw configError;
            }
        }

        const { domain, clientId, audience, redirectUri } = config.auth0;

        // Initialize Azure Application Insights for monitoring
        if (config.appInsights?.connectionString) {
            const initialized = initAppInsights(config.appInsights.connectionString);
            if (initialized) {
                trackEvent('AppInitialized', { environment: config.environment || 'unknown' });
            }
        }

        const onRedirectCallback = (appState: any) => {
            window.history.replaceState(
                {},
                document.title,
                appState?.returnTo || window.location.pathname
            )
        };

        createRoot(document.getElementById('root')!).render(
            <StrictMode>
                <QueryClientProvider client={queryClient}>
                    <Auth0Provider
                        domain={domain}
                        clientId={clientId}
                        authorizationParams={{
                            redirect_uri: redirectUri,
                            audience: audience,
                        }}
                        cacheLocation="localstorage"
                        useRefreshTokens={true}
                        onRedirectCallback={onRedirectCallback}
                    >
                        <App />
                    </Auth0Provider>
                </QueryClientProvider>
            </StrictMode>,
        );
    } catch (error) {
        console.error('Failed to load config:', error);
        const rootEl = document.getElementById('root');
        if (rootEl) {
            rootEl.innerHTML = `
                <div style="padding: 40px; font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #dc2626; margin-bottom: 16px;">⚠️ Configuration Error</h2>
                    <p style="color: #4b5563; margin-bottom: 16px;">Failed to load application configuration.</p>
                    <details style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                        <summary style="cursor: pointer; font-weight: 600; margin-bottom: 8px;">Error Details</summary>
                        <pre style="margin: 8px 0 0 0; overflow-x: auto; font-size: 12px;">${error}</pre>
                    </details>
                    <p style="color: #6b7280; font-size: 14px;">
                        Make sure <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">/public/config.json</code> exists and is valid JSON.
                    </p>
                </div>
            `;
        }
    }
}

initializeApp();
