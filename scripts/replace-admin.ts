import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load local environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const oldEmail = "admin@dullys.com";
const newEmail = "emadadelgd@gmail.com";

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

async function replaceAdmin() {
  console.log("Starting Administrator transition process...");

  // 1. List users to find the old administrator
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError.message);
    process.exit(1);
  }

  const oldUser = listData.users.find(u => u.email === oldEmail);
  if (oldUser) {
    console.log(`Found old administrator user: ${oldEmail} (ID: ${oldUser.id})`);
    
    // Delete the old user from Supabase Auth (this will cascade delete the admin_profile record)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(oldUser.id);
    if (deleteError) {
      console.error(`Failed to delete old administrator user:`, deleteError.message);
      process.exit(1);
    }
    console.log(`Successfully removed old administrator account: ${oldEmail}`);
  } else {
    console.log(`No existing auth user found for: ${oldEmail}. Checking profile status...`);
  }

  // Double-check and delete any residual profile record for the old email just in case
  const { data: residualProfiles } = await supabase
    .from("admin_profiles")
    .select("user_id");
  
  // 2. Invite the new administrator email
  console.log(`Inviting new administrator: ${newEmail}...`);
  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(newEmail);

  if (inviteError) {
    // If already registered, fetch user ID and link
    if (inviteError.message.includes("already registered") || inviteError.status === 422) {
      console.log(`User ${newEmail} is already registered in Auth. Fetching user ID...`);
      const { data: listData2, error: listError2 } = await supabase.auth.admin.listUsers();
      if (listError2) {
        console.error("Error listing users:", listError2.message);
        process.exit(1);
      }
      const existingUser = listData2.users.find(u => u.email === newEmail);
      if (!existingUser) {
        console.error(`Could not find existing user with email ${newEmail}`);
        process.exit(1);
      }
      await linkProfile(existingUser.id);
    } else {
      console.error("Error inviting new user:", inviteError.message);
      process.exit(1);
    }
  } else if (inviteData && inviteData.user) {
    console.log(`Successfully invited ${newEmail}! User ID: ${inviteData.user.id}`);
    await linkProfile(inviteData.user.id);
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

  console.log(`Administrator profile linked successfully for ${newEmail}!`);
}

replaceAdmin().catch(err => {
  console.error("Fatal error during administrator replacement:", err);
  process.exit(1);
});
