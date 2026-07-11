import { execSync } from "child_process";
import * as dotenv from "dotenv";
import * as path from "path";

// Load local environment variables from .env.local
const envLocalPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envLocalPath });

const requiredVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY"
];

async function deployEnv() {
  console.log("Reading environment configuration from .env.local...");

  // Validate the presence of critical connection variables
  for (const v of requiredVars) {
    if (!process.env[v]) {
      console.error(`Error: Required environment variable ${v} is missing in .env.local`);
      process.exit(1);
    }
  }

  // Set the values to configure on Vercel
  const varsToSet = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    NEXT_PUBLIC_MENU_DATA_SOURCE: "supabase",
    MENU_DATA_SOURCE: "supabase"
  };

  const targets = ["production", "preview"];

  for (const [key, val] of Object.entries(varsToSet)) {
    for (const target of targets) {
      console.log(`Configuring variable: ${key} on target: ${target}...`);
      
      // Run Vercel CLI env add in non-interactive mode
      try {
        execSync(`npx vercel env add ${key} ${target} --value "${val}" --force --yes`, {
          stdio: "ignore" // Hide output to prevent leaking secret values to console logs
        });
        console.log(`✓ Successfully set ${key} on ${target}`);
      } catch (err: any) {
        console.error(`❌ Failed to set ${key} on ${target}`);
        process.exit(1);
      }
    }
  }

  console.log("\nAll production and preview environment variables successfully configured on Vercel!");
}

deployEnv().catch(err => {
  console.error("Fatal error during Vercel env deployment:", err);
  process.exit(1);
});
