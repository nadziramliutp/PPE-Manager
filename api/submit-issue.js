import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { worker_name, department_id, ppe_item_id, quantity_issued, notes } = req.body;

  if (!worker_name || !department_id || !ppe_item_id || !quantity_issued) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check stock
    const { data: stock } = await supabase
      .from('inventory_stocks')
      .select('quantity')
      .eq('ppe_item_id', ppe_item_id)
      .single();

    if (!stock || stock.quantity < quantity_issued) {
      return res.json({ success: false, error: 'Insufficient stock' });
    }

    // Insert issue log
    const { error: logError } = await supabase
      .from('issue_logs')
      .insert({
        worker_name,
        department_id,
        ppe_item_id,
        quantity_issued,
        notes: notes || null,
        issued_by_name: 'HSE System',
        issued_at: new Date().toISOString(),
      });

    if (logError) throw logError;

    // Deduct stock
    await supabase
      .from('inventory_stocks')
      .update({ quantity: stock.quantity - quantity_issued, updated_at: new Date().toISOString() })
      .eq('ppe_item_id', ppe_item_id);

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
