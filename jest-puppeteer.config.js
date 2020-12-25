module.exports = {
  server: {
    command: "NO_HTTPS=true yarn start",
    port: 3000,
    debug: false
  },
  launch: {
    headless: true,
    slowMo: 0,
    args: ["--no-sandbox"]
  }
};
