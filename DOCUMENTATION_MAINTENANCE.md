# 📚 Documentation Maintenance Guide

## Overview

This guide ensures that all documentation remains current and accurate as the Stock Portfolio Tracker application evolves. Maintaining up-to-date documentation is crucial for developer onboarding, API integration, and project sustainability.

## 📋 Documentation Update Checklist

### When Making Code Changes

**Before Starting Development:**

- [ ] Review relevant documentation sections
- [ ] Note which docs will need updates
- [ ] Plan documentation changes alongside code changes

**During Development:**

- [ ] Update inline code comments
- [ ] Update TypeScript interfaces and types
- [ ] Update function documentation

**After Code Changes:**

- [ ] Update all affected documentation files
- [ ] Verify code examples still work
- [ ] Update version numbers if applicable
- [ ] Test documentation examples

## 🔄 Documentation Update Triggers

### API Changes

**When modifying `/app/api/` routes:**

1. **Update API_DOCUMENTATION.md**:

   - Request/response examples
   - Parameter descriptions
   - Error codes and messages
   - Usage examples

2. **Update README.md**:

   - API overview section
   - Quick start examples

3. **Update ARCHITECTURE.md**:
   - API flow diagrams
   - Data transformation logic

### Component Changes

**When modifying React components:**

1. **Update README.md**:

   - Component documentation
   - Interface definitions
   - State management descriptions

2. **Update ARCHITECTURE.md**:
   - Component hierarchy
   - Data flow diagrams
   - State management patterns

### Configuration Changes

**When modifying build/deployment configs:**

1. **Update DEPLOYMENT.md**:

   - Build configuration
   - Environment variables
   - Deployment scripts

2. **Update CONTRIBUTING.md**:
   - Development setup
   - Build commands
   - Testing procedures

### Dependency Changes

**When adding/removing/updating dependencies:**

1. **Update README.md**:

   - Dependencies section
   - Installation instructions

2. **Update CONTRIBUTING.md**:

   - Development setup
   - Required tools

3. **Update DEPLOYMENT.md**:
   - Build requirements
   - Production dependencies

## 📝 Documentation Files Mapping

### Primary Documentation Files

| File                   | Responsible For                         | Update Triggers                                                 |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------- |
| `README.md`            | Project overview, quick start, features | Any major feature, API changes, setup changes                   |
| `API_DOCUMENTATION.md` | Complete API reference                  | Any API route changes, new endpoints, parameter changes         |
| `ARCHITECTURE.md`      | Technical architecture, data flows      | Component changes, new integrations, architectural decisions    |
| `DEPLOYMENT.md`        | Deployment procedures, configuration    | Config changes, new deployment targets, environment changes     |
| `CONTRIBUTING.md`      | Development guidelines, standards       | Process changes, new tools, coding standard updates             |
| `KITE_SETUP.md`        | Zerodha integration guide               | Kite API changes, authentication updates, setup process changes |

### Code-Level Documentation

| Location          | Type            | Update Triggers                          |
| ----------------- | --------------- | ---------------------------------------- |
| Component files   | TSDoc comments  | Function signature changes, prop changes |
| API routes        | Inline comments | Logic changes, new validations           |
| Type definitions  | Interface docs  | New fields, changed types                |
| Utility functions | Function docs   | Parameter changes, behavior changes      |

## 🛠️ Automated Documentation Tools

### Pre-commit Hooks

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Check if API files changed and remind about docs
if git diff --cached --name-only | grep -q "app/api/"; then
  echo "⚠️  API files changed. Please update API_DOCUMENTATION.md"
fi

# Check if components changed and remind about docs
if git diff --cached --name-only | grep -q "components/"; then
  echo "⚠️  Components changed. Please update README.md and ARCHITECTURE.md"
fi

# Check if config files changed
if git diff --cached --name-only | grep -E "(next.config|package.json|tsconfig)" -q; then
  echo "⚠️  Configuration changed. Please update DEPLOYMENT.md and CONTRIBUTING.md"
fi

# Run linting and type checking
pnpm lint
pnpm type-check
```

### Documentation Validation Script

Create `scripts/validate-docs.js`:

````javascript
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

function checkDocumentationFreshness() {
  const warnings = [];

  // Check if API docs are newer than API files
  const apiDocStat = fs.statSync("API_DOCUMENTATION.md");

  API_ROUTES.forEach((route) => {
    if (fs.existsSync(route)) {
      const routeStat = fs.statSync(route);
      if (routeStat.mtime > apiDocStat.mtime) {
        warnings.push(`⚠️  ${route} is newer than API_DOCUMENTATION.md`);
      }
    }
  });

  // Check if README is newer than package.json
  const readmeStat = fs.statSync("README.md");
  const packageStat = fs.statSync("package.json");

  if (packageStat.mtime > readmeStat.mtime) {
    warnings.push(
      `⚠️  package.json is newer than README.md - check dependencies section`
    );
  }

  return warnings;
}

function validateCodeExamples() {
  const warnings = [];

  // Check if code examples in docs are valid
  const apiDoc = fs.readFileSync("API_DOCUMENTATION.md", "utf8");

  // Extract code blocks and validate syntax
  const codeBlocks = apiDoc.match(
    /```(?:typescript|javascript|json)\n([\s\S]*?)\n```/g
  );

  if (codeBlocks) {
    codeBlocks.forEach((block, index) => {
      try {
        // Basic syntax validation for JSON blocks
        if (block.includes("```json")) {
          const jsonContent = block
            .replace(/```json\n/, "")
            .replace(/\n```/, "");
          JSON.parse(jsonContent);
        }
      } catch (error) {
        warnings.push(
          `⚠️  Invalid JSON in API_DOCUMENTATION.md code block ${index + 1}`
        );
      }
    });
  }

  return warnings;
}

// Run validation
console.log("🔍 Validating documentation...\n");

const freshnessWarnings = checkDocumentationFreshness();
const syntaxWarnings = validateCodeExamples();

const allWarnings = [...freshnessWarnings, ...syntaxWarnings];

if (allWarnings.length === 0) {
  console.log("✅ All documentation appears up-to-date!");
} else {
  console.log("Documentation issues found:\n");
  allWarnings.forEach((warning) => console.log(warning));
  console.log(
    "\n📝 Please review and update the relevant documentation files."
  );
}
````

### GitHub Actions Workflow

Create `.github/workflows/docs-check.yml`:

```yaml
name: Documentation Check

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  check-docs:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"

      - name: Check if API files changed
        id: api-changes
        run: |
          if git diff --name-only HEAD~1 HEAD | grep -q "app/api/"; then
            echo "api_changed=true" >> $GITHUB_OUTPUT
          fi

      - name: Check if API docs updated
        if: steps.api-changes.outputs.api_changed == 'true'
        run: |
          if ! git diff --name-only HEAD~1 HEAD | grep -q "API_DOCUMENTATION.md"; then
            echo "⚠️ API files changed but API_DOCUMENTATION.md was not updated"
            exit 1
          fi

      - name: Validate documentation
        run: |
          node scripts/validate-docs.js

      - name: Check for broken links
        uses: gaurav-nelson/github-action-markdown-link-check@v1
        with:
          use-quiet-mode: "yes"
          use-verbose-mode: "yes"
```

## 📊 Documentation Review Process

### Regular Maintenance Schedule

**Weekly (Automated):**

- [ ] Run documentation validation script
- [ ] Check for broken links
- [ ] Verify code examples compile

**Monthly (Manual Review):**

- [ ] Review all documentation for accuracy
- [ ] Update screenshots if UI changed
- [ ] Verify setup instructions work
- [ ] Check external links still work

**Before Major Releases:**

- [ ] Complete documentation audit
- [ ] Update version numbers
- [ ] Review and update feature lists
- [ ] Verify all examples work with latest code

### Documentation Review Checklist

**For API Documentation:**

- [ ] All endpoints documented
- [ ] Request/response examples current
- [ ] Error codes accurate
- [ ] Authentication requirements clear
- [ ] Rate limiting information current

**For Architecture Documentation:**

- [ ] Component diagrams current
- [ ] Data flow accurate
- [ ] Dependencies up-to-date
- [ ] Performance characteristics current

**For Setup Documentation:**

- [ ] Installation steps work
- [ ] Environment variables complete
- [ ] Prerequisites accurate
- [ ] Troubleshooting section current

## 🔧 Documentation Update Templates

### API Change Template

When updating API endpoints:

```markdown
## Changes Made

- [ ] Updated endpoint documentation
- [ ] Updated request/response examples
- [ ] Updated error codes
- [ ] Updated usage examples
- [ ] Tested all code examples

## Files Updated

- [ ] API_DOCUMENTATION.md
- [ ] README.md (if public API changed)
- [ ] ARCHITECTURE.md (if flow changed)

## Verification

- [ ] All code examples tested
- [ ] Postman collection updated
- [ ] Integration tests pass
```

### Component Change Template

When updating React components:

```markdown
## Changes Made

- [ ] Updated component documentation
- [ ] Updated interface definitions
- [ ] Updated usage examples
- [ ] Updated prop descriptions

## Files Updated

- [ ] README.md
- [ ] ARCHITECTURE.md
- [ ] Component TSDoc comments

## Verification

- [ ] Component examples work
- [ ] Type definitions accurate
- [ ] Props table current
```

## 🚀 Best Practices

### Writing Documentation

1. **Keep Examples Current:**

   - Test all code examples
   - Use realistic data
   - Include error scenarios

2. **Version Everything:**

   - Date significant updates
   - Note breaking changes
   - Maintain changelog

3. **Be Specific:**

   - Include exact commands
   - Specify versions
   - Provide complete examples

4. **Cross-Reference:**
   - Link between related docs
   - Reference code locations
   - Include issue/PR links

### Automation

1. **Use Git Hooks:**

   - Pre-commit documentation checks
   - Post-merge documentation updates
   - Automated link checking

2. **CI/CD Integration:**

   - Documentation builds
   - Link validation
   - Example testing

3. **Monitoring:**
   - Track documentation usage
   - Monitor for outdated content
   - Alert on missing updates

## 📈 Metrics and Monitoring

### Documentation Health Metrics

Track these metrics to ensure documentation quality:

- **Freshness**: Days since last update per file
- **Accuracy**: Number of broken examples/links
- **Completeness**: Coverage of API endpoints/components
- **Usage**: Page views and user feedback

### Alerting Rules

Set up alerts for:

- Documentation older than 30 days with recent code changes
- Broken links in documentation
- Failed example validations
- Missing documentation for new features

## 🎯 Action Items

### Immediate Setup

1. **Install Documentation Tools:**

   ```bash
   pnpm add -D husky lint-staged
   pnpm add -D markdown-link-check
   ```

2. **Create Validation Scripts:**

   - Copy validation script to `scripts/`
   - Set up pre-commit hooks
   - Configure GitHub Actions

3. **Establish Review Process:**
   - Add documentation review to PR template
   - Schedule monthly documentation reviews
   - Assign documentation maintainers

### Ongoing Maintenance

1. **Every Code Change:**

   - Update relevant documentation
   - Test documentation examples
   - Verify links and references

2. **Every Release:**

   - Complete documentation audit
   - Update version references
   - Verify all setup instructions

3. **Regular Reviews:**
   - Monthly freshness check
   - Quarterly complete review
   - Annual documentation restructure

By following this maintenance guide, the Stock Portfolio Tracker documentation will remain accurate, helpful, and current with all code changes. This ensures a great developer experience and reduces support burden.

---

**Remember: Documentation is code too - it needs the same care and attention as the application itself!** 📚✨
