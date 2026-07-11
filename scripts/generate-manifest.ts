import fs from "fs";
import path from "path";

// Source directories — priority order: public/products FIRST, then public/assets/products
// If the same logical product ID is found in both directories, public/products wins.
const SOURCE_DIRS = [
  { dir: path.join(process.cwd(), "public", "products"), webPrefix: "/products" },
  { dir: path.join(process.cwd(), "public", "assets", "products"), webPrefix: "/assets/products" },
];

const OUTPUT_FILE = path.join(process.cwd(), "src", "data", "productAssetManifest.ts");
const MENU_DATA_FILE = path.join(process.cwd(), "src", "data", "menu.ts");

const IMAGE_EXTENSIONS = new Set([".png", ".webp", ".avif", ".jpg", ".jpeg"]);
const SIZE_PATTERN = /-(16oz|22oz|8oz|12oz|premium|standard)$/i;

interface ManifestEntry {
  default: string | null;
  variants: Record<string, string>;
}

/** Read all known product IDs from menu.ts for validation, failing loudly on error */
function getKnownProductIds(): Set<string> {
  const ids = new Set<string>();
  try {
    const content = fs.readFileSync(MENU_DATA_FILE, "utf-8");
    // Match "id": "some-product-id" patterns
    const idPattern = /"id"\s*:\s*"([a-z0-9-]+)"/g;
    let match;
    while ((match = idPattern.exec(content)) !== null) {
      ids.add(match[1]);
    }
  } catch (err: any) {
    console.error(`\n❌ [ERROR] Failed to read menu data file: ${err.message}\n`);
    process.exit(1);
  }

  if (ids.size === 0) {
    console.error(`\n❌ [ERROR] No product IDs found in menu data file: ${MENU_DATA_FILE}\n`);
    process.exit(1);
  }

  return ids;
}

export function generateManifest() {
  const manifest: Record<string, ManifestEntry> = {};
  const crossSourceDuplicates: string[] = [];

  for (const { dir, webPrefix } of SOURCE_DIRS) {
    if (!fs.existsSync(dir)) {
      continue;
    }

    // Deterministic sort: read and sort files alphabetically
    const files = fs.readdirSync(dir).sort();
    const mappedInThisDir = new Map<string, string>();

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(ext)) continue;

      const basename = path.basename(file, ext);
      const sizeMatch = basename.match(SIZE_PATTERN);
      const isVariant = !!sizeMatch;
      const sizeCode = sizeMatch ? sizeMatch[1].toLowerCase() : "default";
      const productId = sizeMatch ? basename.replace(SIZE_PATTERN, "") : basename;

      const logicalKey = `${productId}:${sizeCode}`;
      const filePath = path.join(dir, file);
      const webPath = `${webPrefix}/${file}`;

      // 1. Same-source directory duplicate logical key: FAIL LOUDLY
      if (mappedInThisDir.has(logicalKey)) {
        const conflictingPath = mappedInThisDir.get(logicalKey)!;
        console.error(`\n❌ [ERROR] SAME-SOURCE DUPLICATE DETECTED:`);
        console.error(`  Product ID:  ${productId}`);
        console.error(`  Logical Key: ${sizeCode}`);
        console.error(`  Conflict 1:  ${conflictingPath}`);
        console.error(`  Conflict 2:  ${filePath}\n`);
        process.exit(1);
      }
      mappedInThisDir.set(logicalKey, filePath);

      // 2. Cross-source duplicate: apply explicit priority (first dir wins)
      if (!manifest[productId]) {
        manifest[productId] = { default: null, variants: {} };
      }

      if (isVariant) {
        if (manifest[productId].variants[sizeCode]) {
          crossSourceDuplicates.push(
            `Shadowed variant: ${productId}/${sizeCode} — kept "${manifest[productId].variants[sizeCode]}", ignoring "${webPath}"`
          );
        } else {
          manifest[productId].variants[sizeCode] = webPath;
        }
      } else {
        if (manifest[productId].default !== null) {
          crossSourceDuplicates.push(
            `Shadowed default: ${productId} — kept "${manifest[productId].default}", ignoring "${webPath}"`
          );
        } else {
          manifest[productId].default = webPath;
        }
      }
    }
  }

  // 3. Unknown product ID validation against official static menu data: FAIL LOUDLY
  const knownIds = getKnownProductIds();
  const unknownIds: string[] = [];
  for (const assetProductId of Object.keys(manifest)) {
    if (!knownIds.has(assetProductId)) {
      unknownIds.push(assetProductId);
    }
  }

  if (unknownIds.length > 0) {
    console.error(`\n❌ [ERROR] UNKNOWN PRODUCT IDs DETECTED (${unknownIds.length}):`);
    for (const uid of unknownIds) {
      console.error(`  Asset product ID "${uid}" not found in menu.ts`);
    }
    console.error("");
    process.exit(1);
  }

  // Sort manifest keys deterministically for stable output
  const sortedKeys = Object.keys(manifest).sort();
  const sortedManifest: Record<string, ManifestEntry> = {};
  for (const key of sortedKeys) {
    const entry = manifest[key];
    const sortedVariants: Record<string, string> = {};
    for (const vk of Object.keys(entry.variants).sort()) {
      sortedVariants[vk] = entry.variants[vk];
    }
    sortedManifest[key] = { default: entry.default, variants: sortedVariants };
  }

  // Generate output without dynamic runtime timestamps to prevent git diff noise
  const content = `// DULLY'S PRODUCT ASSET MANIFEST
// Automatically generated by scripts/generate-manifest.ts
// Do not modify manually.

export interface ManifestAsset {
  default: string | null;
  variants: Record<string, string>;
}

export const productAssetManifest: Record<string, ManifestAsset> = ${JSON.stringify(sortedManifest, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, content, "utf-8");

  // Report
  const totalProducts = sortedKeys.length;
  const totalVariants = sortedKeys.reduce((sum, k) => sum + Object.keys(sortedManifest[k].variants).length, 0);
  const nullDefaults = sortedKeys.filter((k) => sortedManifest[k].default === null).length;

  console.log(`\n✓ Generated asset manifest: ${OUTPUT_FILE}`);
  console.log(`  Products: ${totalProducts}`);
  console.log(`  Size variants: ${totalVariants}`);
  console.log(`  Products with null default image: ${nullDefaults}`);

  if (crossSourceDuplicates.length > 0) {
    console.log(`\nℹ Cross-source shadowing warnings (${crossSourceDuplicates.length}):`);
    for (const d of crossSourceDuplicates) {
      console.log(`  ${d}`);
    }
  }

  console.log("");
}

// If run directly
const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith("generate-manifest.ts") ||
    process.argv[1].endsWith("generate-manifest.js") ||
    process.argv[1].includes("generate-manifest"));
if (isDirectRun) {
  generateManifest();
}
