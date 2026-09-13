import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind";
import path from "path";

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableTailwind(currentConfiguration, { configLocation: path.resolve(__dirname, "tailwind.config.js") });
});
