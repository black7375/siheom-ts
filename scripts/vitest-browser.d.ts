/** Shared Vitest browser mode config (matches apps/react-example). */
export declare const vitestBrowserMode: {
    readonly browser: {
        readonly enabled: true;
        readonly headless: true;
        readonly provider: import("vitest/node").BrowserProviderOption<import("@vitest/browser-playwright").PlaywrightProviderOptions>;
        readonly instances: readonly [{
            readonly browser: "chromium";
        }];
    };
    readonly testTimeout: 3000;
};
