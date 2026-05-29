import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

const config = await loadQuartzConfig({
theme: {
    typography: {
      header: {
        name: "Filipa",
        weights: [400],
        includeItalic: false,

      },
      body: {
        name: "Metamorphous",
        weights: [400],
        includeItalic: false,

      },
      code: "IBM Plex Mono",
    },
}})
export default config
export const layout = await loadQuartzLayout()
