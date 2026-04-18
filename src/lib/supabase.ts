import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nelcuoiygfydfokxvjss.supabase.co';
const supabaseAnonKey = 'sb_publishable_1pNxe4keLc7fksoIW87fRg_7pw2xY-6';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
