import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { type } = req.query;

  try {
    switch (type) {
      case 'departments': {
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .order('name');
        if (error) throw error;
        return res.json(data);
      }

      case 'ppe-items': {
        const { data: items, error: itemsErr } = await supabase
          .from('ppe_items')
          .select('*')
          .order('name');
        if (itemsErr) throw itemsErr;

        const { data: stocks } = await supabase
          .from('inventory_stocks')
          .select('ppe_item_id, quantity');

        const stockMap = Object.fromEntries((stocks ?? []).map(s => [s.ppe_item_id, s.quantity]));
        const result = items.map(item => ({ ...item, current_stock: stockMap[item.id] ?? 0 }));
        return res.json(result);
      }

      case 'inventory': {
        const { data, error } = await supabase
          .from('inventory_stocks')
          .select('*');
        if (error) throw error;
        return res.json(data);
      }

      case 'issue-logs': {
        const { data: logs, error } = await supabase
          .from('issue_logs')
          .select('*, ppe_items(name, unit), departments(name)')
          .order('issued_at', { ascending: false });
        if (error) throw error;

        const result = logs.map(log => ({
          ...log,
          ppe_item_name: log.ppe_items?.name,
          ppe_item_unit: log.ppe_items?.unit,
          department_name: log.departments?.name,
        }));
        return res.json(result);
      }

      default:
        return res.status(400).json({ error: 'Unknown type' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
