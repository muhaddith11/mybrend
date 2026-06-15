import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://amvmwibqdrufiaodqair.supabase.co'
const supabaseKey = 'sb_publishable_cuZzESB7VKhdldnbgA6EeQ_akDyGcTQ'

export const supabase = createClient(supabaseUrl, supabaseKey)

