export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  
  // Parse body if it's a string
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const { pin, role } = body || {};

  console.log('PIN attempt:', { pin, role, 
    workerPin: process.env.WORKER_PIN, 
    hsePin: process.env.HSE_PIN 
  });

  if (role === 'hse' && pin === process.env.HSE_PIN) {
    return res.status(200).json({ success: true, role: 'hse' });
  }

  if (role === 'worker' && pin === process.env.WORKER_PIN) {
    return res.status(200).json({ success: true, role: 'worker' });
  }

  return res.status(200).json({ success: false });
}