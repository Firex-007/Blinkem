export const WORKER_IMAGES = {
  'Muthu K': '/images/workers/muthu.jpg',
  'Karthik M': '/images/workers/karthik.jpg',
  'Ramesh P': '/images/workers/ramesh.jpg',
  'Selvam R': '/images/workers/selvam.jpg',
  'Anitha S': '/images/workers/anitha.jpg',
  'Kumar V': '/images/workers/kumar.jpg',
  'Deepa N': '/images/workers/deepa.jpg',
  'Suresh T': '/images/workers/suresh.jpg',
};

export const CATEGORY_WORKER_FALLBACK = {
  plumber: '/images/workers/muthu.jpg',
  electrician: '/images/workers/karthik.jpg',
  carpenter: '/images/workers/ramesh.jpg',
  painter: '/images/workers/selvam.jpg',
  cleaner: '/images/workers/anitha.jpg',
  ac_repair: '/images/workers/kumar.jpg',
  cook: '/images/workers/deepa.jpg',
  appliance_repair: '/images/workers/suresh.jpg',
};

export function getWorkerImage(worker) {
  if (worker?.image_url) return worker.image_url;
  if (worker?.avatar_url) return worker.avatar_url;
  if (worker?.name && WORKER_IMAGES[worker.name]) return WORKER_IMAGES[worker.name];

  const firstName = worker?.name?.split(' ')[0];
  if (firstName) {
    for (const [name, img] of Object.entries(WORKER_IMAGES)) {
      if (name.startsWith(firstName)) return img;
    }
  }

  const cat = worker?.category || 'plumber';
  return CATEGORY_WORKER_FALLBACK[cat] || '/images/workers/muthu.jpg';
}
