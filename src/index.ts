import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { Hustler } from "./types"; // Importing your blueprints

// Load the environment variables from the .env file
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials in .env file");
}

// 1. Initialize the Database Client
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Write the test function
async function testDatabaseConnection() {
  console.log("Connecting to project-alpha database...");

  // We pass <Hustler> so TypeScript knows exactly what shape the data should be
  const { data, error } = await supabase
    .from("hustlers")
    .select("*")
    .returns<Hustler[]>();

  if (error) {
    console.error("❌ Connection failed:", error.message);
    return;
  }

  if (data && data.length === 0) {
    console.log(
      "✅ Connected successfully, but the 'hustlers' table is empty!",
    );
  } else {
    console.log("✅ Success! Here is your data:");
    console.log(data);
  }
}

// 3. Run the function
testDatabaseConnection();
