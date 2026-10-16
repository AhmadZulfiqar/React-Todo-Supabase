import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mokrhtxtzihcrtumynnl.supabase.co";
const supabaseAnonKey = "sb_publishable_ucj-s0LUkB7xaab1W1nH5Q_7T-d9gmk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);