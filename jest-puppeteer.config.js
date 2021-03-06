module.exports = {
  server: {
    command: "NO_HTTPS=true yarn start",
    port: 3000,
    debug: true
  },
  launch: {
    timeout: 0,
    headless: !!process.env.CI,
    slowMo: 150,
    defaultViewport: { width: 1440, height: 1024 },
    args: ["--start-maximized", "--window-size=1440,1024"]
  }
};
