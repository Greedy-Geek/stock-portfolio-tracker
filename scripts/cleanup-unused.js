const fs = require("fs");
const path = require("path");

// Files and directories to remove
const UNUSED_FILES = [
  // Empty component file
  "components/stock-table.tsx",

  // Unused placeholder images
  "public/placeholder-logo.png",
  "public/placeholder-logo.svg",
  "public/placeholder-user.jpg",
  "public/placeholder.jpg",
  "public/placeholder.svg",

  // Unused UI components
  "components/ui/accordion.tsx",
  "components/ui/alert-dialog.tsx",
  "components/ui/alert.tsx",
  "components/ui/aspect-ratio.tsx",
  "components/ui/avatar.tsx",
  "components/ui/breadcrumb.tsx",
  "components/ui/calendar.tsx",
  "components/ui/carousel.tsx",
  "components/ui/chart.tsx",
  "components/ui/checkbox.tsx",
  "components/ui/collapsible.tsx",
  "components/ui/command.tsx",
  "components/ui/context-menu.tsx",
  "components/ui/drawer.tsx",
  "components/ui/dropdown-menu.tsx",
  "components/ui/form.tsx",
  "components/ui/hover-card.tsx",
  "components/ui/input-otp.tsx",
  "components/ui/menubar.tsx",
  "components/ui/navigation-menu.tsx",
  "components/ui/pagination.tsx",
  "components/ui/popover.tsx",
  "components/ui/progress.tsx",
  "components/ui/radio-group.tsx",
  "components/ui/resizable.tsx",
  "components/ui/scroll-area.tsx",
  "components/ui/select.tsx",
  "components/ui/separator.tsx",
  "components/ui/sheet.tsx",
  "components/ui/sidebar.tsx",
  "components/ui/slider.tsx",
  "components/ui/sonner.tsx",
  "components/ui/switch.tsx",
  "components/ui/textarea.tsx",
  "components/ui/toast.tsx",
  "components/ui/toaster.tsx",
  "components/ui/toggle-group.tsx",
  "components/ui/toggle.tsx",
  "components/ui/tooltip.tsx",
  "components/ui/use-mobile.tsx",
  "components/ui/use-toast.ts",
];

const EMPTY_DIRECTORIES = ["hooks", "styles"];

function safeRemoveFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const size = stats.size;
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${filePath} (${size} bytes)`);
      return { removed: true, size };
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
      return { removed: false, size: 0 };
    }
  } catch (error) {
    console.log(`❌ Error removing ${filePath}: ${error.message}`);
    return { removed: false, size: 0 };
  }
}

function safeRemoveDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      const stats = fs.statSync(dirPath);
      if (stats.isDirectory()) {
        const files = fs.readdirSync(dirPath);
        if (files.length === 0) {
          fs.rmdirSync(dirPath);
          console.log(`✅ Removed empty directory: ${dirPath}`);
          return true;
        } else {
          console.log(
            `⚠️  Directory not empty: ${dirPath} (${files.length} files)`
          );
          return false;
        }
      }
    } else {
      console.log(`⚠️  Directory not found: ${dirPath}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error removing directory ${dirPath}: ${error.message}`);
    return false;
  }
}

function main() {
  console.log("🧹 Stock Portfolio Tracker - Cleanup Script\n");
  console.log("Removing unnecessary files and folders...\n");

  let totalRemoved = 0;
  let totalSize = 0;

  // Remove unused files
  console.log("📄 Removing unused files:");
  UNUSED_FILES.forEach((file) => {
    const result = safeRemoveFile(file);
    if (result.removed) {
      totalRemoved++;
      totalSize += result.size;
    }
  });

  console.log("\n📁 Checking empty directories:");
  EMPTY_DIRECTORIES.forEach((dir) => {
    if (safeRemoveDirectory(dir)) {
      totalRemoved++;
    }
  });

  console.log("\n" + "=".repeat(50));
  console.log(`🎉 Cleanup completed!`);
  console.log(`📊 Summary:`);
  console.log(`   - Files/directories removed: ${totalRemoved}`);
  console.log(`   - Total space freed: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log("\n💡 Benefits:");
  console.log("   - Smaller bundle size");
  console.log("   - Faster builds");
  console.log("   - Cleaner codebase");
  console.log("   - Reduced maintenance overhead");

  if (totalRemoved > 0) {
    console.log("\n📝 Next steps:");
    console.log("   1. Run: pnpm build (to verify everything still works)");
    console.log("   2. Run: pnpm dev (to test in development)");
    console.log(
      '   3. Commit changes: git add . && git commit -m "chore: remove unused files and components"'
    );
  }

  console.log("\n" + "=".repeat(50));
}

// Export for use in other scripts
module.exports = {
  UNUSED_FILES,
  EMPTY_DIRECTORIES,
  safeRemoveFile,
  safeRemoveDirectory,
};

// Run if called directly
if (require.main === module) {
  main();
}
