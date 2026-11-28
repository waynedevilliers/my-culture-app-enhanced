export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/setup.js"],
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: [
    "controllers/**/*.js",
    "routes/**/*.js",
    "!**/*.test.js",
  ],
  coveragePathIgnorePatterns: ["/node_modules/"],
};
