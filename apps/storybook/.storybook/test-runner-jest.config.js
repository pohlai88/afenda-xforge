const path = require("node:path");
const { getJestConfig } = require("@storybook/test-runner");

const storybookAppRoot = path.resolve(__dirname, "..");
const config = getJestConfig();

// getJestConfig() roots at the monorepo; scope tests to this app's stories only.
config.rootDir = storybookAppRoot;
config.testMatch = ["<rootDir>/stories/**/*.stories.@(ts|tsx)"];
// Compose galleries are heavy; allow more time when the runner loads many stories.
config.testTimeout = 60_000;

module.exports = config;
