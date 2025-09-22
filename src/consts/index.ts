import { AppError } from "../utils/error";
import { ENV_CONFIGS as APP_CONFIGS } from "./app";
import { ENV_CONFIGS as DB_CONFIGS } from "./db";
import { ENV_CONFIGS as KEY_CONFIGS } from "./key";
import { ENV_CONFIGS as OAUTH_CONFIGS } from "./oauth";

const validateEnvConfigs = () => {
  const target: Record<string, string> = {
    ...APP_CONFIGS,
    ...DB_CONFIGS,
    ...KEY_CONFIGS,
    ...OAUTH_CONFIGS,
  };
  for (const configName in target) {
    const configValue = target[configName];
    if (!configValue || !configValue.trim()) {
      throw new AppError(
        `Invalid '${configName}' config value.`,
        "INVALID_ENV_CONFIG",
        "consts.index.validateEnvConfigs"
      );
    }
  }
  console.log(`✅Success to load env config values.`);
};

export { validateEnvConfigs };
