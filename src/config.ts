function getEnv(key: string, safeMode: boolean = false, defaultValue: string = "") {
  const val = import.meta.env[key];

  if (!safeMode && val === undefined) {
    throw new Error(`env value ${key} not found, exiting...`);
  }

  return val ?? defaultValue;
}


const env = getEnv("PRODUCTION", true, "0") == "1";

export const Config = {
  IS_PROD: env,
  API_BASE_URL: env ? "https://api.reflectionsprojections.org" : "http://localhost:3000",
  // API_BASE_URL: "http://localhost:3000",
  EVENT_TYPES: [
    "SPEAKER",
    "CORPORATE",
    "SPECIAL",
    "PARTNERS",
    "MEALS",
    "CHECKIN",
  ]
};
