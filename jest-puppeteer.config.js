module.exports = {
  server: {
    command: "NO_HTTPS=true yarn start",
    port: 3000,
    launchTimeout: 45000,
    debug: false
  },
  launch: {
    headless: true,
    slowMo: 0
  }
};
