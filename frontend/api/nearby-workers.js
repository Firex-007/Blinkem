// Vercel Serverless Function: GET /api/nearby-workers

const WORKERS = [
  {
    id: 1,
    user_id: 3,
    name: 'Muthu K',
    categories: ['plumber'],
    rating: 4.8,
    rating_count: 112,
    jobs_done: 140,
    base_price: 299,
    eta_min: 12,
    distance_km: 1.4,
    lat: 13.0460,
    lng: 80.2380,
    is_verified: true,
    id_verified: true,
    skill_verified: true,
    languages: ['ta', 'en'],
    avatar_color: '#1F5BFF',
    bio: '10 yrs experience • leak & pipe fitting specialist'
  },
  {
    id: 2,
    user_id: 4,
    name: 'Selvam R',
    categories: ['plumber'],
    rating: 4.6,
    rating_count: 76,
    jobs_done: 96,
    base_price: 349,
    eta_min: 16,
    distance_km: 2.1,
    lat: 13.0521,
    lng: 80.2255,
    is_verified: true,
    id_verified: true,
    skill_verified: true,
    languages: ['ta'],
    avatar_color: '#0EA5E9',
    bio: 'Bathroom drainage & tap replacement expert'
  },
  {
    id: 3,
    user_id: 7,
    name: 'Anbu S',
    categories: ['electrician'],
    rating: 4.7,
    rating_count: 98,
    jobs_done: 120,
    base_price: 299,
    eta_min: 14,
    distance_km: 1.8,
    lat: 13.0378,
    lng: 80.2123,
    is_verified: true,
    id_verified: true,
    skill_verified: true,
    languages: ['ta', 'en'],
    avatar_color: '#6366F1',
    bio: 'Certified wiring, MCB tripping & ceiling fan technician'
  },
  {
    id: 4,
    user_id: 8,
    name: 'Vignesh T',
    categories: ['electrician'],
    rating: 4.5,
    rating_count: 62,
    jobs_done: 77,
    base_price: 349,
    eta_min: 18,
    distance_km: 2.4,
    lat: 13.0569,
    lng: 80.2425,
    is_verified: true,
    id_verified: true,
    skill_verified: true,
    languages: ['ta', 'en'],
    avatar_color: '#0891B2',
    bio: 'Switchboard installation & inverter specialist'
  },
  {
    id: 5,
    user_id: 10,
    name: 'Lakshmi V',
    categories: ['cleaner'],
    rating: 4.8,
    rating_count: 130,
    jobs_done: 160,
    base_price: 699,
    eta_min: 22,
    distance_km: 2.8,
    lat: 13.0415,
    lng: 80.1985,
    is_verified: true,
    id_verified: true,
    skill_verified: true,
    languages: ['ta', 'en'],
    avatar_color: '#2563EB',
    bio: 'Deep kitchen & bathroom scrubbing specialist'
  },
  {
    id: 6,
    user_id: 12,
    name: 'Saravanan D',
    categories: ['carpenter'],
    rating: 4.5,
    rating_count: 51,
    jobs_done: 64,
    base_price: 450,
    eta_min: 25,
    distance_km: 3.2,
    lat: 13.0500,
    lng: 80.2121,
    is_verified: true,
    id_verified: true,
    skill_verified: true,
    languages: ['ta'],
    avatar_color: '#7C3AED',
    bio: 'Wooden door, lock repair & modular furniture fitting'
  },
  {
    id: 7,
    user_id: 15,
    name: 'Senthil J',
    categories: ['ac_repair'],
    rating: 4.7,
    rating_count: 104,
    jobs_done: 130,
    base_price: 499,
    eta_min: 18,
    distance_km: 1.9,
    lat: 13.0390,
    lng: 80.2290,
    is_verified: true,
    id_verified: true,
    skill_verified: true,
    languages: ['ta', 'en'],
    avatar_color: '#0EA5E9',
    bio: 'Split AC filter wash, gas leak repair & cooling service'
  },
  {
    id: 8,
    user_id: 16,
    name: 'Rajeshwari M',
    categories: ['cook'],
    rating: 4.9,
    rating_count: 140,
    jobs_done: 175,
    base_price: 500,
    eta_min: 28,
    distance_km: 3.5,
    lat: 13.0330,
    lng: 80.2650,
    is_verified: true,
    id_verified: true,
    skill_verified: true,
    languages: ['ta', 'en'],
    avatar_color: '#1F5BFF',
    bio: 'South & North Indian meals, breakfast & dinner'
  }
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-User-Id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { category } = req.query;
  let filtered = WORKERS;
  if (category) {
    filtered = WORKERS.filter((w) => w.categories.includes(category));
    if (filtered.length === 0) {
      filtered = WORKERS.slice(0, 3);
    }
  }

  return res.status(200).json(filtered);
}
