import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PngInfo {
  width: number;
  height: number;
}

function parsePngDimensions(buffer: Buffer): PngInfo | null {
  try {
    if (buffer.readUInt32BE(0) !== 0x89504E47 || buffer.readUInt32BE(4) !== 0x0D0A1A0A) {
      return null;
    }
    let offset = 8;
    while (offset < buffer.length) {
      const length = buffer.readUInt32BE(offset);
      const type = buffer.toString("ascii", offset + 4, offset + 8);
      if (type === "IHDR") {
        const width = buffer.readUInt32BE(offset + 8);
        const height = buffer.readUInt32BE(offset + 12);
        return { width, height };
      }
      offset += 12 + length;
    }
  } catch (e) {
    // Ignore parsing errors
  }
  return null;
}

async function runTrace() {
  console.log("Fetching direct database products...");
  const { data: dbProducts, error: dbErr } = await supabase
    .from("menu_products")
    .select("id, category_id, name, availability_status, is_active");
  
  if (dbErr || !dbProducts) {
    console.error("Failed to fetch database products:", dbErr);
    return;
  }

  console.log(`Fetched ${dbProducts.length} database products.`);

  console.log("Fetching menu assets...");
  const { data: dbAssets, error: assetErr } = await supabase
    .from("menu_product_assets")
    .select("product_id, storage_path, variant_id");
  
  if (assetErr || !dbAssets) {
    console.error("Failed to fetch database assets:", assetErr);
    return;
  }

  // Group default assets (where variant_id is null)
  const defaultAssets: Record<string, string> = {};
  for (const asset of dbAssets) {
    if (!asset.variant_id) {
      defaultAssets[asset.product_id] = asset.storage_path;
    }
  }

  console.log("Fetching RPC get_public_menu...");
  const { data: rpcMenu, error: rpcErr } = await supabase.rpc("get_public_menu");
  if (rpcErr || !rpcMenu || !rpcMenu.categories) {
    console.error("Failed to fetch RPC get_public_menu:", rpcErr);
    return;
  }

  // Create lookup for RPC product images
  const rpcImages: Record<string, string | null> = {};
  for (const cat of rpcMenu.categories) {
    if (!cat.items) continue;
    for (const item of cat.items) {
      rpcImages[item.id] = item.image; // Path returned by RPC
    }
  }

  console.log("Auditing each product...");
  const rows: any[] = [];

  for (const p of dbProducts) {
    const slug = p.id;
    const category = p.category_id;
    const dbImage = defaultAssets[slug] || null; // Path stored in assets table
    const rpcImage = rpcImages[slug] !== undefined ? rpcImages[slug] : null; 
    
    // Mapped URL
    let mappedUrl: string | null = null;
    if (dbImage) {
      mappedUrl = supabase.storage.from("menu-products").getPublicUrl(dbImage).data.publicUrl;
    }

    let httpStatus = "N/A";
    let contentType = "N/A";
    let contentLength = "0";
    let dimensions = "N/A";
    let aspectRatio = "N/A";
    let classification = "HEALTHY";

    if (!dbImage) {
      classification = "MISSING DATA";
    } else if (rpcImage === null) {
      classification = "MISSING DATA"; // Product not in RPC
    } else if (mappedUrl) {
      try {
        const res = await fetch(mappedUrl);
        
        httpStatus = res.status.toString();
        if (res.ok) {
          contentType = res.headers.get("content-type") || "N/A";
          contentLength = res.headers.get("content-length") || "0";
          
          const arrayBuffer = await res.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const dims = parsePngDimensions(buffer);
          if (dims) {
            dimensions = `${dims.width} x ${dims.height}`;
            aspectRatio = (dims.width / dims.height).toFixed(3);
          }
          
          const sizeKb = parseInt(contentLength, 10) / 1024;
          if (sizeKb > 500) {
            classification = "SLOW NETWORK ASSET";
          }
        } else {
          classification = "REQUEST FAILURE";
        }
      } catch (err: any) {
        classification = "REQUEST FAILURE";
        httpStatus = `ERR: ${err.message}`;
      }
    }

    rows.push({
      slug,
      category,
      dbImage,
      rpcImage,
      mappedUrl,
      httpStatus,
      contentType,
      contentLength,
      dimensions,
      aspectRatio,
      classification
    });
  }

  console.log("TRACE_RESULTS_JSON_START");
  console.log(JSON.stringify(rows, null, 2));
  console.log("TRACE_RESULTS_JSON_END");
}

runTrace().catch(err => console.error(err));
