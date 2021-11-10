export const VALID_PASSWORD = `Password, must contain 1 lowercase and 1 uppercase letter, 1 number, 1 special character, and be at least 6 characters. Also, must not reveal the location of the Soul Stone.`;
export const VALID_LEGAL = `You should agree to the legal stuff`;
export const TOKEN_NAME = "DW_TOKEN";

export const OG_DESCRIPTION = "A place to write.";
export const OG_IMAGE_URL = "https://downwrite.vercel.app/og.png";
export const BASE_PROD_URL = "https://beta.downwrite.us/";
export const BASE_OG_TITLE = "Downwrite";
export const ICON_LINK = "/icon-192x192.png";

export const createMetadata = (path?: string, title?: string) => {
  return {
    PAGE_TITLE: title ? `${title} | ${BASE_OG_TITLE}` : BASE_OG_TITLE,
    PAGE_URL: path ? `https://beta.downwrite.us/${path}` : BASE_PROD_URL
  };
};

export const __IS_DEV__: boolean = process.env.NODE_ENV === "development";
export const __IS_PROD__: boolean = process.env.NODE_ENV === "production";
export const __IS_BROWSER__: boolean = typeof window !== "undefined";
export const __IS_TEST__: boolean = process.env.NODE_ENV === "test";

export const LOCAL_DB_ADDRESS = "mongodb://127.0.0.1:27017/downwrite";
