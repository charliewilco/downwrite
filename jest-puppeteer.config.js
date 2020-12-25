module.exports = {
  server: {
    command: "NO_HTTPS=true yarn start",
    port: 3000,
    launchTimeout: 45000,
    debug: true
  },
  launch: {
    headless: !!process.env.CI,
    slowMo: process.env.CI ? 0 : 250
  }
};
