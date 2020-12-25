const merge = require("merge");
const ts = require("ts-jest/jest-preset");
const puppeteer = require("jest-puppeteer/jest-preset");

module.exports = merge.recursive(ts, puppeteer, {
  testTimeout: 100000,
  verbose: true,
  testRegex: "(/__tests__/.*|(\\.|/)(spec))\\.[jt]sx?$"
});
