const config = {
  separator: '_',
  content: [`${__dirname}/{packages,apps}/*/{src,public}/**/*.{ts,tsx,js,jsx,html,css,scss,sass}`],
  plugins: [],
  theme: {
    extend: {}
  }
}
const relativeFile = `${process.env.PNPM_SCRIPT_SRC_DIR}/tailwind.config.js`
if (require('node:fs').existsSync(relativeFile)) config.presets = [require(relativeFile)]

module.exports = config
