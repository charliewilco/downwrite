module.exports = {
  server: {
    command: "NO_HTTPS=true yarn start",
    port: 3000
  },
  launch: {
    timeout: 0,
    headless: !!process.env.CI,
    slowMo: process.env.CI ? 0 : 150
  }
};
