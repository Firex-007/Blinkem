// Vercel Serverless Function: GET /api/categories

const CATEGORIES = [
  { slug: 'plumber', name_en: 'Plumber', name_ta: 'குழாய் பழுதுபார்ப்பவர்', name_hi: 'नलसाज', icon: 'wrench', price_min: 199, price_max: 799, unit: 'visit', avg_eta_min: 12 },
  { slug: 'electrician', name_en: 'Electrician', name_ta: 'மின் பணியாளர்', name_hi: 'इलेक्ट्रीशियन', icon: 'zap', price_min: 149, price_max: 899, unit: 'visit', avg_eta_min: 15 },
  { slug: 'cleaner', name_en: 'House Cleaner', name_ta: 'வீட்டு துப்புரவாளர்', name_hi: 'सफाईकर्मी', icon: 'sparkles', price_min: 299, price_max: 1499, unit: 'service', avg_eta_min: 20 },
  { slug: 'carpenter', name_en: 'Carpenter', name_ta: 'தச்சர்', name_hi: 'बढ़ई', icon: 'hammer', price_min: 249, price_max: 1299, unit: 'visit', avg_eta_min: 25 },
  { slug: 'painter', name_en: 'Painter', name_ta: 'வண்ணம் பூசுபவர்', name_hi: 'पेंटर', icon: 'paint-bucket', price_min: 399, price_max: 2499, unit: 'service', avg_eta_min: 35 },
  { slug: 'ac_repair', name_en: 'AC Technician', name_ta: 'ஏசி பழுதுபார்ப்பவர்', name_hi: 'एसी तकनीशियन', icon: 'wind', price_min: 349, price_max: 1799, unit: 'service', avg_eta_min: 18 },
  { slug: 'cook', name_en: 'Cook / Chef', name_ta: 'சமையல்காரர்', name_hi: 'रसोइया', icon: 'utensils', price_min: 299, price_max: 1299, unit: 'service', avg_eta_min: 30 },
  { slug: 'appliance_repair', name_en: 'Appliance Repair', name_ta: 'சாதனங்கள் பழுதுபார்ப்பவர்', name_hi: 'उपकरण मरम्मत', icon: 'tv', price_min: 249, price_max: 1499, unit: 'visit', avg_eta_min: 22 }
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-Id');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json(CATEGORIES);
}
