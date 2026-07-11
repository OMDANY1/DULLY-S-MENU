import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load local environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const adminEmail = "admin@dullys.com";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in your environment.");
  process.exit(1);
}

// Service role key is required for admin authentication management operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  console.log(`Inviting admin user: ${adminEmail}...`);

  // Invite the user using Supabase Auth Admin API
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(adminEmail, {
    redirectTo: `${supabaseUrl.replace(".supabase.co", ".supabase.co")}` // Default redirect is handled by Supabase dashboard settings
  });

  if (error) {
    // If the user already exists, let's fetch them to link to admin_profiles
    if (error.message.includes("already registered") || error.status === 422) {
      console.log("User already registered in Auth. Fetching user ID...");
      const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.error("Error listing users:", listError.message);
        process.exit(1);
      }
      const existingUser = listData.users.find(u => u.email === adminEmail);
      if (!existingUser) {
        console.error(`Could not find existing user with email ${adminEmail}`);
        process.exit(1);
      }
      await linkProfile(existingUser.id);
    } else {
      console.error("Error inviting user:", error.message);
      process.exit(1);
    }
  } else if (data && data.user) {
    console.log(`Successfully invited ${adminEmail}! User ID: ${data.user.id}`);
    await linkProfile(data.user.id);
  }
}

async function linkProfile(userId: string) {
  console.log(`Linking admin profile for user ID: ${userId}...`);
  const { error: profileError } = await supabase
    .from("admin_profiles")
    .upsert({
      user_id: userId,
      role: "admin",
      is_active: true
    }, { onConflict: "user_id" });

  if (profileError) {
    console.error("Error linking admin profile:", profileError.message);
    process.exit(1);
  }

  console.log("Admin user profile linked successfully!");
}

createAdmin().catch(err => {
  console.error("Fatal error creating admin:", err);
  process.exit(1);
});
