/** Vite `define` shims for testing-library packages in real browsers. */
export declare const vitestBrowserDefine: {
    readonly "process.env.NODE_ENV": string;
    readonly "process.env.VTL_SKIP_AUTO_CLEANUP": "undefined";
    readonly "process.env.QTL_SKIP_AUTO_CLEANUP": "undefined";
};
/** Shared Vitest browser mode config (matches apps/react-example). */
export declare const vitestBrowserMode: {
    browser: {
        enabled: true;
        headless: true;
        provider: import("vitest/node").BrowserProviderOption<import("@vitest/browser-playwright").PlaywrightProviderOptions>;
        instances: {
            browser: "chromium";
        }[];
    };
};
