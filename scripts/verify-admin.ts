import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load local environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in your environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyAdmin() {
  console.log("Checking administrator account status...");

  const email = "emadadelgd@gmail.com";
  
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError.message);
    process.exit(1);
  }

  const user = listData.users.find(u => u.email === email);
  if (!user) {
    console.error(`Error: Could not find auth user for email: ${email}`);
    process.exit(1);
  }

  console.log(`✓ Auth user found: ${email}`);
  console.log(`  User ID: ${user.id}`);
  console.log(`  Email confirmed at: ${user.email_confirmed_at}`);
  console.log(`  Last sign in: ${user.last_sign_in_at}`);

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching admin profile:", profileError.message);
    process.exit(1);
  }

  if (!profile) {
    console.error(`❌ Error: No admin_profiles record exists for user ID: ${user.id}`);
    process.exit(1);
  }

  console.log(`✓ admin_profiles linked correctly!`);
  console.log(`  Role: ${profile.role}`);
  console.log(`  Is Active: ${profile.is_active}`);
}

verifyAdmin().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
