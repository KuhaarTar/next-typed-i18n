import { PREFIX } from "./config";

class I18nLogger {
    private prefix: string = PREFIX;
    private debug: boolean = false;

    constructor(debug: boolean = false) {
        this.debug = debug;
    }

    public log(...args: unknown[]) {
        if (!this.debug) {
            return;
        }
        console.log(`[${this.prefix}]`, ...args);
    }

    public warn(...args: unknown[]) {
        if (!this.debug) {
            return;
        }
        console.warn(`[${this.prefix}]`, ...args);
    }

    public error(...args: unknown[]) {
        if (!this.debug) {
            return;
        }
        console.error(`[${this.prefix}]`, ...args);
    }
}

export { I18nLogger };
