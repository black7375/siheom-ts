import { config as defaultConfig } from "@tamagui/config/v3";
import { createTamagui } from "tamagui";

export const tamaguiConfig = createTamagui(defaultConfig);

export default tamaguiConfig;

export type AppConfig = typeof tamaguiConfig;

declare module "tamagui" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppConfig {}
}
