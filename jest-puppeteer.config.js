module.exports = {
  server: {
    command: "NO_HTTPS=true yarn start",
    port: 3000,
    debug: true
  },
  launch: {
    timeout: 0,
    headless: !!process.env.CI,
    slowMo: process.env.CI ? 0 : 150,
    defaultViewport: { width: 1440, height: 766 },
    args: ["--start-maximized", "--window-size=1440,766"]
  }
};
