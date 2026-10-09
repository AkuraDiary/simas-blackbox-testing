const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const {
  addCucumberPreprocessorPlugin,
} = require("@badeball/cypress-cucumber-preprocessor");
const {
  createEsbuildPlugin,
} = require("@badeball/cypress-cucumber-preprocessor/esbuild");

module.exports = defineConfig({
  retries: {
    runMode: 2, // Reruns up to 2 times in 'cypress run'
  },
  e2e: {
    reporter: "mochawesome",
    reporterOptions: {
      reportDir: "cypress/reports",
      overwrite: false,
      html: true,
      json: true,
      code: false, 
    },
    numTestsKeptInMemory: 5,
    experimentalMemoryManagement: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    // baseUrl: "http://127.0.0.1:8000/", // Update this to your local SIMAS URL
    baseUrl: "https://dev.elsimas.my.id", // Update this to your local SIMAS URL
    redirectionLimit: 50,
    setupNodeEvents: async (on, config) => {
      // Force Chrome to ignore certain iframe security restrictions during the test session
      on("before:browser:launch", (browser = {}, launchOptions) => {
        if (browser.family === "chromium" && browser.name !== "electron") {
          launchOptions.args.push(
            "--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure",
          );
        }
        return launchOptions;
      });

      const fs = require("fs");
      const path = require("path");

      on("task", {
        findDownloadedFile(extension) {
          const downloadsFolder = "cypress/downloads";
          if (!fs.existsSync(downloadsFolder)) {
            return null;
          }
          const files = fs.readdirSync(downloadsFolder);
          const target = files.find((file) => file.endsWith(extension));
          return target || null;
        },
      });

      await addCucumberPreprocessorPlugin(on, config);
      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        }),
      );
      return config;
    },
    specPattern: "cypress/e2e/**/*.feature",
  },
});
