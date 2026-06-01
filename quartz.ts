import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

const config = await loadQuartzConfig()
config.configuration.theme.typography = {
      header: {
        name: "Cormorant Garamond",
        includeItalic: false,
      },
      body: {
        name: "Noto Serif",
        includeItalic: false,
      },
      code: "IBM Plex Mono",
    };
export default config
export const layout = await loadQuartzLayout()
