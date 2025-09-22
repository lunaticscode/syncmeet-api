const APP_PORT = process.env.APP_PORT ?? "8081";
const USER_TOKEN_KEY = "__syncmeet_token";
const ENV_CONFIGS: Record<string, string> = { APP_PORT };
export { APP_PORT, USER_TOKEN_KEY, ENV_CONFIGS };
