import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    req.setHeader('Access-Control-Allow-Origin','*');
  await supabase.from('departments').select('id').limit(1);
  return res.status(200).json({ ok: true, time: new Date().toISOString() });
}