
import fs from "fs";
import path from "path";

const configPath = path.resolve("data/config.json");

export function loadConfig() {
  if (!fs.existsSync(configPath)) {
    const def = { max_retries: 3, backoff_base: 2 };
    fs.writeFileSync(configPath, JSON.stringify(def, null, 2));
  }
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
}

export function setConfig(key, value) {
  const cfg = loadConfig();
  cfg[key] = value;
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
}
