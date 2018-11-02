export const __IS_DEV__: boolean = process.env.NODE_ENV === "development";
export const __IS_PROD__: boolean = process.env.NODE_ENV === "production";
export const __IS_BROWSER__: boolean = typeof window !== "undefined";
