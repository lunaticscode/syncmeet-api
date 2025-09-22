const MONGODB_URL = process.env.MONGODB_URL ?? "";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "";
const ENV_CONFIGS: Record<string, string> = { MONGODB_DB_NAME, MONGODB_URL };
export { MONGODB_URL, MONGODB_DB_NAME, ENV_CONFIGS };
