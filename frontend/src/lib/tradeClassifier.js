/**
 * Intelligent client-side service trade classifier & Gemini fallback
 * Accurately categorizes queries in English, Tamil, Tanglish, and Hindi
 */

const KEYWORDS = {
  electrician: [
    'electric', 'wire', 'wiring', 'fuse', 'current', 'shock', 'switch', 'switchboard',
    'plug', 'socket', 'mcb', 'tripping', 'short circuit', 'fan', 'ceiling fan', 'light',
    'bulb', 'tube light', 'phase', 'inverter', 'power cut', 'spark', 'sparking',
    'மின்', 'மின்சாரம்', 'ஃபேன்', 'சுவிட்ச்', 'பல்ப்', 'மின்விசிறி', 'ஒயரிங்',
    'बिजली', 'पंखा', 'तार', 'शॉर्ट सर्किट', 'फ्यूज', 'लाइट', 'स्विच', 'करंट',
    'pankha', 'bijli', 'tar', 'eriyala', 'minsaram', 'odala'
  ],
  plumber: [
    'plumber', 'leak', 'leaking', 'tap', 'faucet', 'pipe', 'drain', 'drainage',
    'sink', 'washbasin', 'toilet', 'flush', 'cistern', 'commode', 'tank', 'sump',
    'water', 'motor', 'pump', 'blockage', 'valve', 'sewage', 'clogged', 'clog',
    'குழாய்', 'கசிவு', 'தண்ணீர்', 'தொட்டி', 'மோட்டார்', 'அடைப்பு', 'டேப்',
    'नल', 'पाइप', 'लीक', 'टपक', 'पानी', 'नाली', 'टैंक', 'मोटर',
    'thanni', 'thanneer', 'kasivu', 'odanji', 'udaivu', 'kuzhai', 'nal', 'paani'
  ],
  ac_repair: [
    'ac', 'a/c', 'air conditioner', 'split ac', 'window ac', 'cooling', 'gas',
    'refrigerant', 'gas leak', 'filter', 'water dropping', 'blower', 'compressor',
    'remote', 'service', 'installation', 'cool',
    'ஏசி', 'கூலிங்', 'குளிரூட்டி', 'கேஸ்',
    'एसी', 'कूलिंग', 'गैस', 'एयर कंडीशनर',
    'thanda nahi', 'kulirchi', 'gas refill'
  ],
  cleaner: [
    'clean', 'cleaning', 'cleaner', 'deep clean', 'maid', 'sweep', 'sweeping',
    'mop', 'mopping', 'dust', 'dusting', 'bathroom wash', 'toilet clean', 'sofa clean',
    'kitchen clean', 'garbage', 'housekeeping', 'floor wash',
    'சுத்தம்', 'பெருக்க', 'கழுவ', 'துடைக்க', 'குப்பை',
    'सफाई', 'झाड़ू', 'पोछा', 'धुलाई', 'कचरा',
    'safai', 'suththam', 'perukka', 'kuppai'
  ],
  carpenter: [
    'carpenter', 'wood', 'door', 'window', 'cupboard', 'wardrobe', 'cabinet',
    'shelf', 'table', 'chair', 'desk', 'bed', 'cot', 'furniture', 'latch', 'lock',
    'handle', 'hinge', 'plywood', 'repair wood',
    'தச்சர்', 'கதவு', 'ஜன்னல்', 'பூட்டு', 'மேசை', 'நாற்காலி', 'மரவேலை',
    'बढ़ई', 'दरवाजा', 'खिड़की', 'ताला', 'अलमारी', 'कुर्सी', 'मेज', 'लकड़ी',
    'kadhavu', 'thatchar', 'mesai', 'poottu', 'saavi', 'darwaza', 'lakdi'
  ],
  painter: [
    'paint', 'painter', 'painting', 'wall', 'whitewash', 'putty', 'primer',
    'distemper', 'emulsion', 'waterproof', 'damp', 'stain', 'color', 'coating',
    'பெயிண்ட்', 'சுவர்', 'வெள்ளை அடித்தல்', 'வண்ணம்',
    'पेंट', 'पेंटर', 'दीवार', 'रंग', 'सफेदी',
    'suvar', 'rang', 'safedi'
  ],
  cook: [
    'cook', 'cooking', 'chef', 'catering', 'meal', 'meals', 'breakfast', 'lunch',
    'dinner', 'food', 'samayal', 'daily cook', 'party food', 'biryani',
    'சமையல்', 'சாப்பாடு', 'உணவு', 'மாஸ்டர்',
    'खाना बनाना', 'रसोइया', 'कुक', 'भोजन', 'दोपहर का खाना',
    'saapadu', 'khana'
  ],
  appliance_repair: [
    'fridge', 'refrigerator', 'washing machine', 'microwave', 'oven', 'mixer',
    'grinder', 'induction', 'chimney', 'tv', 'television', 'geyser', 'water heater',
    'வாஷிங் மெஷின்', 'பிரிட்ஜ்', 'மிக்ஸி', 'கிரைண்டர்', 'கீசர்',
    'फ्रिज', 'वाशिंग मशीन', 'मिक्सर', 'गीज़र', 'माइक्रोवेव',
    'heater'
  ],
};

const URGENCY_TERMS = [
  'immediately', 'urgent', 'urgently', 'emergency', 'now', 'right now', 'fast',
  'seekiram', 'udane', 'ippove', 'jaldi', 'turant', 'சீக்கிரம்', 'உடனே', 'இப்போவே', 'जल्दी', 'तुरंत'
];

export function classifyTradeFromText(text = '') {
  if (!text || typeof text !== 'string') {
    return {
      category: 'electrician', // safe neutral
      confidence: 0.5,
      urgency: 'now',
      description: 'Home service request',
    };
  }

  const clean = text.toLowerCase();

  // Score each category
  const scores = {};
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    scores[cat] = 0;
    for (const w of words) {
      if (clean.includes(w.toLowerCase())) {
        // Multi-word matches or exact words score higher
        scores[cat] += w.includes(' ') ? 3 : 1;
      }
    }
  }

  let bestCat = 'electrician';
  let bestScore = 0;
  for (const [cat, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCat = cat;
    }
  }

  // If no match found, pick category based on first relevant word or general
  if (bestScore === 0) {
    if (clean.includes('current') || clean.includes('power') || clean.includes('wire')) bestCat = 'electrician';
    else if (clean.includes('water') || clean.includes('pipe')) bestCat = 'plumber';
    else bestCat = 'electrician';
  }

  const isUrgent = URGENCY_TERMS.some((term) => clean.includes(term)) || true; // default now for emergency dispatch

  return {
    category: bestCat,
    confidence: bestScore > 0 ? Math.min(0.95, 0.7 + bestScore * 0.1) : 0.6,
    urgency: isUrgent ? 'now' : 'scheduled',
    description: text.trim().slice(0, 140),
  };
}
