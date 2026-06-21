import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, ...body } = req.body;

  try {
    switch (action) {
      case 'add-department': {
        const { error } = await supabase
          .from('departments')
          .insert({ name: body.name });
        if (error) throw error;
        return res.json({ success: true });
      }

      case 'delete-department': {
        const { error } = await supabase
          .from('departments')
          .delete()
          .eq('id', body.id);
        if (error) throw error;
        return res.json({ success: true });
      }
      case 'delete-logs-before': {
        const { error } = await supabase
          .from('issue_logs')
          .delete()
          .lt('issued_at', new Date(body.date).toISOString());
        if (error) throw error;
        return res.json({ success: true });
      }

      case 'add-ppe-item': {
        const { data, error } = await supabase
          .from('ppe_items')
          .insert({
            name: body.name,
            unit: body.unit,
            min_stock: body.min_stock ?? 10,
            category: body.category || null,
            description: '',
          })
          .select()
          .single();
        if (error) throw error;

        // Create initial stock entry
        await supabase
          .from('inventory_stocks')
          .insert({ ppe_item_id: data.id, quantity: 0 });

        return res.json({ success: true });
      }

      case 'delete-ppe-item': {
        const { data: logs } = await supabase
          .from('issue_logs')
          .select('id')
          .eq('ppe_item_id', body.id)
          .limit(1);
        
        if (logs && logs.length > 0) {
          return res.json({ success: false, error: 'Cannot delete — this item has issue history. Delete its logs first.' });
        }

        await supabase.from('inventory_stocks').delete().eq('ppe_item_id', body.id);
        const { error } = await supabase.from('ppe_items').delete().eq('id', body.id);
        if (error) throw error;
        return res.json({ success: true });
      }

      case 'set-stock': {
        const { error } = await supabase
          .from('inventory_stocks')
          .update({ quantity: body.quantity, updated_at: new Date().toISOString() })
          .eq('ppe_item_id', body.ppe_item_id);
        if (error) throw error;
        return res.json({ success: true });
      }

      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
