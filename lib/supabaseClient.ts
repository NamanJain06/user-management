import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bqswwcthdchzyuwmglru.supabase.co'
const supabaseAnonKey = 'sb_publishable_PwlkubcgQ1CTiSdCQCNNVA_DOuYNGWX'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)