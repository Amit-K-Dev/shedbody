import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zjazzyyluiexmabagdpo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqYXp6eXlsdWlleG1hYmFnZHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjg4MTUsImV4cCI6MjA4ODY0NDgxNX0.sC4y_Kzdz7ynvsV4GxnoeymTkJLM02kymzYBNtduZkQ";

export const supabase = createClient(supabaseUrl, supabaseKey);
