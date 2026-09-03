import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ywdzhdxrmuxrawelkigs.supabase.co';
const supabaseKey = 'sb_publishable_sAWXkfW_DM5Qf4-nYj0jWw_mUtwZjwn';

export const supabase = createClient(supabaseUrl, supabaseKey);