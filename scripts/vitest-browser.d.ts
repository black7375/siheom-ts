/** Vite `define` shims for testing-library packages in real browsers. */
export declare const vitestBrowserDefine: {
    readonly "process.env.NODE_ENV": string;
    readonly "process.env.VTL_SKIP_AUTO_CLEANUP": "undefined";
    readonly "process.env.QTL_SKIP_AUTO_CLEANUP": "undefined";
};
/** Shared Vitest browser mode config (matches apps/react-example). */
export declare const vitestBrowserMode: {
    onConsoleLog(log: any, type: any): false | undefined;
    browser: {
        enabled: boolean;
        headless: boolean;
        provider: any;
        instances: {
            browser: string;
        }[];
    };
};
