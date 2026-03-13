import { PREFIX } from "./config";

export class I18nError extends Error {
    constructor(message: string) {
        super(`[${PREFIX}] ${message}`);
        this.name = "I18nError";
    }
}
