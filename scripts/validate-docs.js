const fs = require("fs");
const path = require("path");

const DOCS_TO_CHECK = [
  "README.md",
  "API_DOCUMENTATION.md",
  "ARCHITECTURE.md",
  "DEPLOYMENT.md",
  "CONTRIBUTING.md",
  "KITE_SETUP.md",
];

const API_ROUTES = [
  "app/api/stock/[ticker]/route.ts",
  "app/api/kite/holdings/route.ts",
  "app/api/kite/positions/route.ts",
];

const COMPONENT_FILES = [
  "components/stock-table-with-kite.tsx",
  "app/page.tsx",
  "app/layout.tsx",
];

function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function getFileModificationTime(filePath) {
  try {
    return fs.statSync(filePath).mtime;
  } catch (error) {
    return null;
  }
}

function checkDocumentationFreshness() {
  const warnings = [];

  console.log("🔍 Checking documentation freshness...\n");

  // Check if API docs are newer than API files
  if (checkFileExists("API_DOCUMENTATION.md")) {
    const apiDocTime = getFileModificationTime("API_DOCUMENTATION.md");

    API_ROUTES.forEach((route) => {
      if (checkFileExists(route)) {
        const routeTime = getFileModificationTime(route);
        if (routeTime && apiDocTime && routeTime > apiDocTime) {
          warnings.push(`⚠️  ${route} is newer than API_DOCUMENTATION.md`);
        }
      }
    });
  } else {
    warnings.push(`❌ API_DOCUMENTATION.md not found`);
  }

  // Check if README is newer than package.json
  if (checkFileExists("README.md") && checkFileExists("package.json")) {
    const readmeTime = getFileModificationTime("README.md");
    const packageTime = getFileModificationTime("package.json");

    if (packageTime && readmeTime && packageTime > readmeTime) {
      warnings.push(
        `⚠️  package.json is newer than README.md - check dependencies section`
      );
    }
  }

  // Check if ARCHITECTURE.md is current with component changes
  if (checkFileExists("ARCHITECTURE.md")) {
    const archTime = getFileModificationTime("ARCHITECTURE.md");

    COMPONENT_FILES.forEach((component) => {
      if (checkFileExists(component)) {
        const componentTime = getFileModificationTime(component);
        if (componentTime && archTime && componentTime > archTime) {
          warnings.push(`⚠️  ${component} is newer than ARCHITECTURE.md`);
        }
      }
    });
  } else {
    warnings.push(`❌ ARCHITECTURE.md not found`);
  }

  return warnings;
}

function validateCodeExamples() {
  const warnings = [];

  console.log("🔍 Validating code examples...\n");

  DOCS_TO_CHECK.forEach((docFile) => {
    if (!checkFileExists(docFile)) {
      warnings.push(`❌ ${docFile} not found`);
      return;
    }

    try {
      const content = fs.readFileSync(docFile, "utf8");

      // Extract JSON code blocks and validate syntax
      const jsonBlocks = content.match(/```json\n([\s\S]*?)\n```/g);

      if (jsonBlocks) {
        jsonBlocks.forEach((block, index) => {
          try {
            const jsonContent = block
              .replace(/```json\n/, "")
              .replace(/\n```/, "");
            JSON.parse(jsonContent);
          } catch (error) {
            warnings.push(
              `⚠️  Invalid JSON in ${docFile} code block ${index + 1}: ${
                error.message
              }`
            );
          }
        });
      }

      // Check for broken internal links
      const internalLinks = content.match(/\[.*?\]\((?!http).*?\)/g);

      if (internalLinks) {
        internalLinks.forEach((link) => {
          const linkPath = link.match(/\((.*?)\)/)[1];
          // Skip anchors and complex paths
          if (
            !linkPath.startsWith("#") &&
            !linkPath.includes("*") &&
            !linkPath.includes("?")
          ) {
            if (!checkFileExists(linkPath)) {
              warnings.push(
                `⚠️  Broken internal link in ${docFile}: ${linkPath}`
              );
            }
          }
        });
      }
    } catch (error) {
      warnings.push(`❌ Error reading ${docFile}: ${error.message}`);
    }
  });

  return warnings;
}

function checkRequiredSections() {
  const warnings = [];

  console.log("🔍 Checking required documentation sections...\n");

  // Check README.md for required sections
  if (checkFileExists("README.md")) {
    const readmeContent = fs.readFileSync("README.md", "utf8");
    const requiredSections = [
      "## 🌟 Features",
      "## 🏗️ Architecture",
      "## 🚀 Setup Instructions",
      "## 📚 API Documentation",
    ];

    requiredSections.forEach((section) => {
      if (!readmeContent.includes(section)) {
        warnings.push(`⚠️  README.md missing required section: ${section}`);
      }
    });
  }

  // Check API_DOCUMENTATION.md for required sections
  if (checkFileExists("API_DOCUMENTATION.md")) {
    const apiContent = fs.readFileSync("API_DOCUMENTATION.md", "utf8");
    const requiredApiSections = [
      "## 📈 Stock Price API",
      "## 🏦 Kite Holdings API",
      "## 📊 Status Codes",
      "## 🚀 Usage Examples",
    ];

    requiredApiSections.forEach((section) => {
      if (!apiContent.includes(section)) {
        warnings.push(
          `⚠️  API_DOCUMENTATION.md missing required section: ${section}`
        );
      }
    });
  }

  return warnings;
}

function checkEnvironmentVariables() {
  const warnings = [];

  console.log("🔍 Checking environment variable documentation...\n");

  // Check if all environment variables used in code are documented
  const envVarsInCode = new Set();

  // Scan API files for environment variables
  API_ROUTES.forEach((route) => {
    if (checkFileExists(route)) {
      const content = fs.readFileSync(route, "utf8");
      const envMatches = content.match(/process\.env\.([A-Z_]+)/g);

      if (envMatches) {
        envMatches.forEach((match) => {
          const varName = match.replace("process.env.", "");
          envVarsInCode.add(varName);
        });
      }
    }
  });

  // Check if these variables are documented
  if (checkFileExists("README.md")) {
    const readmeContent = fs.readFileSync("README.md", "utf8");

    envVarsInCode.forEach((varName) => {
      if (!readmeContent.includes(varName)) {
        warnings.push(
          `⚠️  Environment variable ${varName} used in code but not documented in README.md`
        );
      }
    });
  }

  return warnings;
}

function generateReport(allWarnings) {
  console.log("\n📊 Documentation Validation Report\n");
  console.log("=".repeat(50));

  if (allWarnings.length === 0) {
    console.log("✅ All documentation appears up-to-date and valid!");
    console.log("📚 Great job maintaining the docs!");
  } else {
    console.log(`Found ${allWarnings.length} documentation issues:\n`);

    // Group warnings by type
    const errorWarnings = allWarnings.filter((w) => w.startsWith("❌"));
    const generalWarnings = allWarnings.filter((w) => w.startsWith("⚠️"));

    if (errorWarnings.length > 0) {
      console.log("🚨 Critical Issues:");
      errorWarnings.forEach((warning) => console.log(`  ${warning}`));
      console.log();
    }

    if (generalWarnings.length > 0) {
      console.log("⚠️  Warnings:");
      generalWarnings.forEach((warning) => console.log(`  ${warning}`));
      console.log();
    }

    console.log(
      "📝 Please review and update the relevant documentation files."
    );
    console.log("💡 See DOCUMENTATION_MAINTENANCE.md for guidance.");
  }

  console.log("\n" + "=".repeat(50));

  // Exit with error code if there are critical issues
  const hasCriticalIssues = allWarnings.some((w) => w.startsWith("❌"));
  if (hasCriticalIssues) {
    process.exit(1);
  }
}

// Main execution
function main() {
  console.log("📚 Stock Portfolio Tracker - Documentation Validator\n");

  const freshnessWarnings = checkDocumentationFreshness();
  const syntaxWarnings = validateCodeExamples();
  const sectionWarnings = checkRequiredSections();
  const envWarnings = checkEnvironmentVariables();

  const allWarnings = [
    ...freshnessWarnings,
    ...syntaxWarnings,
    ...sectionWarnings,
    ...envWarnings,
  ];

  generateReport(allWarnings);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  checkDocumentationFreshness,
  validateCodeExamples,
  checkRequiredSections,
  checkEnvironmentVariables,
};
