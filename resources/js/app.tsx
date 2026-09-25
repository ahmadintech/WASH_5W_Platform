import './bootstrap';
import '../css/app.css';
import './index.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { AuthProvider } from './context/AuthContext';
import { WashDataProvider } from './context/WashDataContext';
import { ThemeProvider } from './context/ThemeContext';

import AppLayout from './layout/AppLayout';

const appName = import.meta.env.VITE_APP_NAME || 'WASH 5W Platform';

createInertiaApp({
    title: (title) => (title ? `${title} — ${appName}` : appName),
    resolve: async (name) => {
        const page: any = await resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        );
        if (page.default && page.default.layout === undefined) {
            if (
                name.startsWith('AuthPages/') ||
                name === 'Landing/LandingPage' ||
                name === 'Landing/Index' ||
                name === 'Wash/CoverageDashboard' ||
                name === 'Wash/SubmitReport' ||
                name === 'Error'
            ) {
                // Public, Auth, or Error pages handle their own layout
            } else {
                page.default.layout = (p: any) => <AppLayout>{p}</AppLayout>;
            }
        }
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <ThemeProvider>
                <AuthProvider>
                    <WashDataProvider>
                        <App {...props} />
                    </WashDataProvider>
                </AuthProvider>
            </ThemeProvider>
        );
    },
    progress: {
        color: '#12707E',
        showSpinner: true,
    },
});
