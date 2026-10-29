/**
 * Pan-India Cities & Localities Dataset
 * Multi-city directory for on-demand hyperlocal matching
 */

export const CITIES = [
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    popular: true,
    localities: [
      { name: 'Indiranagar', lat: 12.9784, lng: 77.6408, pin_code: '560038', landmark: '100ft Road / CMH Road', area_type: 'Hub & Dining', popular: true },
      { name: 'Koramangala', lat: 12.9352, lng: 77.6245, pin_code: '560034', landmark: 'Sony World Signal / 80ft Road', area_type: 'Startup & Tech', popular: true },
      { name: 'HSR Layout', lat: 12.9121, lng: 77.6446, pin_code: '560102', landmark: '27th Main / Sector 1', area_type: 'Residential & Tech', popular: true },
      { name: 'Whitefield', lat: 12.9698, lng: 77.7500, pin_code: '560066', landmark: 'ITPB / Nexus Shantiniketan', area_type: 'Tech Corridor', popular: true },
      { name: 'Jayanagar', lat: 12.9308, lng: 77.5838, pin_code: '560011', landmark: '4th Block Complex / South End', area_type: 'Heritage & Prime', popular: true },
      { name: 'Bellandur', lat: 12.9304, lng: 77.6784, pin_code: '560103', landmark: 'Ecospace / Outer Ring Road', area_type: 'IT Tech Park', popular: true },
      { name: 'Marathahalli', lat: 12.9591, lng: 77.6974, pin_code: '560037', landmark: 'Multiplex Bridge / Ring Road', area_type: 'Transit & Residential', popular: false },
      { name: 'Electronic City', lat: 12.8399, lng: 77.6770, pin_code: '560100', landmark: 'Phase 1 Toll / Infosys Gate', area_type: 'Tech Park', popular: false },
      { name: 'Malleshwaram', lat: 13.0031, lng: 77.5643, pin_code: '560003', landmark: 'Sampige Road / 8th Cross', area_type: 'Heritage Residential', popular: false },
      { name: 'Hebbal', lat: 13.0358, lng: 77.5970, pin_code: '560024', landmark: 'Flyover / Manyata Tech Park', area_type: 'North Corridor', popular: false },
    ],
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.0760,
    lng: 72.8777,
    popular: true,
    localities: [
      { name: 'Bandra West', lat: 19.0596, lng: 72.8295, pin_code: '400050', landmark: 'Hill Road / Linking Road', area_type: 'Upscale & Cultural', popular: true },
      { name: 'Andheri West', lat: 19.1363, lng: 72.8277, pin_code: '400053', landmark: 'Lokhandwala / Infinity Mall', area_type: 'Commercial & Media', popular: true },
      { name: 'Powai', lat: 19.1176, lng: 72.9060, pin_code: '400076', landmark: 'Hiranandani Gardens / IIT Gate', area_type: 'Modern Township', popular: true },
      { name: 'Juhu', lat: 19.1075, lng: 72.8263, pin_code: '400049', landmark: 'Juhu Beach / JVPD Scheme', area_type: 'Prime Coastal', popular: true },
      { name: 'Dadar', lat: 19.0178, lng: 72.8478, pin_code: '400028', landmark: 'Shivaji Park / Plaza Cinema', area_type: 'Central Junction', popular: true },
      { name: 'Lower Parel', lat: 18.9953, lng: 72.8300, pin_code: '400013', landmark: 'High Street Phoenix / Kamala Mills', area_type: 'Corporate Hub', popular: true },
      { name: 'Colaba', lat: 18.9067, lng: 72.8147, pin_code: '400005', landmark: 'Gateway of India / Causeway', area_type: 'South Mumbai', popular: false },
      { name: 'Thane West', lat: 19.2183, lng: 72.9781, pin_code: '400601', landmark: 'Viviana Mall / Ghodbunder Road', area_type: 'Residential City', popular: false },
      { name: 'Borivali West', lat: 19.2307, lng: 72.8567, pin_code: '400092', landmark: 'Eksar Road / Shimpoli', area_type: 'North Western', popular: false },
      { name: 'Navi Mumbai / Vashi', lat: 19.0771, lng: 72.9986, pin_code: '400703', landmark: 'Sector 17 / Inorbit Mall', area_type: 'Planned Hub', popular: false },
    ],
  },
  {
    id: 'delhi',
    name: 'Delhi NCR',
    state: 'Delhi / NCR',
    lat: 28.6139,
    lng: 77.2090,
    popular: true,
    localities: [
      { name: 'Connaught Place', lat: 28.6315, lng: 77.2167, pin_code: '110001', landmark: 'Inner Circle / Rajiv Chowk', area_type: 'Central Business District', popular: true },
      { name: 'Gurgaon Cyber City', lat: 28.4947, lng: 77.0894, pin_code: '122002', landmark: 'DLF CyberHub / Rapid Metro', area_type: 'Corporate Corridor', popular: true },
      { name: 'South Extension', lat: 28.5729, lng: 77.2227, pin_code: '110049', landmark: 'Ring Road / South Ex Part 1 & 2', area_type: 'Upscale Retail', popular: true },
      { name: 'Noida Sector 18', lat: 28.5708, lng: 77.3260, pin_code: '201301', landmark: 'Mall of India / Atta Market', area_type: 'Commercial Hub', popular: true },
      { name: 'Hauz Khas', lat: 28.5494, lng: 77.2001, pin_code: '110016', landmark: 'HKV / Aurobindo Marg', area_type: 'Cultural & Dining', popular: true },
      { name: 'Greater Kailash', lat: 28.5482, lng: 77.2340, pin_code: '110048', landmark: 'M Block Market / GK-1 & 2', area_type: 'Prime Residential', popular: true },
      { name: 'Dwarka', lat: 28.5921, lng: 77.0460, pin_code: '110075', landmark: 'Sector 12 City Centre', area_type: 'Subcity Residential', popular: false },
      { name: 'Lajpat Nagar', lat: 28.5677, lng: 77.2433, pin_code: '110024', landmark: 'Central Market', area_type: 'Central Market Hub', popular: false },
      { name: 'Rohini', lat: 28.7159, lng: 77.1171, pin_code: '110085', landmark: 'Sector 10 / Swarn Jayanti Park', area_type: 'North Delhi', popular: false },
    ],
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    lat: 17.3850,
    lng: 78.4867,
    popular: true,
    localities: [
      { name: 'Hitec City', lat: 17.4435, lng: 78.3772, pin_code: '500081', landmark: 'Cyber Towers / Mindspace', area_type: 'IT Epicenter', popular: true },
      { name: 'Gachibowli', lat: 17.4401, lng: 78.3489, pin_code: '500032', landmark: 'Financial District / ORR Junction', area_type: 'Financial & IT', popular: true },
      { name: 'Jubilee Hills', lat: 17.4319, lng: 78.4073, pin_code: '500033', landmark: 'Road No. 36 / Check Post', area_type: 'Luxury & Dining', popular: true },
      { name: 'Banjara Hills', lat: 17.4156, lng: 78.4357, pin_code: '500034', landmark: 'Road No. 1 / City Centre Mall', area_type: 'Commercial & Prime', popular: true },
      { name: 'Madhapur', lat: 17.4483, lng: 78.3915, pin_code: '500081', landmark: 'Ayyappa Society / 100ft Road', area_type: 'Tech & Residential', popular: true },
      { name: 'Kondapur', lat: 17.4699, lng: 78.3578, pin_code: '500084', landmark: 'Botanical Garden / RTO', area_type: 'Modern Residential', popular: false },
      { name: 'Kukatpally', lat: 17.4948, lng: 78.3996, pin_code: '500072', landmark: 'KPHB Colony / Forum Sujana Mall', area_type: 'Vibrant Hub', popular: false },
      { name: 'Secunderabad', lat: 17.4399, lng: 78.4983, pin_code: '500003', landmark: 'Clock Tower / Station Road', area_type: 'Twin City Hub', popular: false },
    ],
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    popular: true,
    localities: [
      { name: 'T. Nagar', lat: 13.0418, lng: 80.2341, pin_code: '600017', landmark: 'Pondy Bazaar / Panagal Park', area_type: 'Commercial & Retail', popular: true },
      { name: 'Adyar', lat: 13.0067, lng: 80.2570, pin_code: '600020', landmark: 'Gandhi Nagar / Lattice Bridge', area_type: 'South Coastal Prime', popular: true },
      { name: 'Mylapore', lat: 13.0368, lng: 80.2676, pin_code: '600004', landmark: 'Kapaleeshwarar Temple / Luz', area_type: 'Heritage Hub', popular: true },
      { name: 'Anna Nagar', lat: 13.0850, lng: 80.2101, pin_code: '600040', landmark: 'Roundtana / 2nd Avenue', area_type: 'Planned Prime', popular: true },
      { name: 'Velachery', lat: 12.9815, lng: 80.2180, pin_code: '600042', landmark: 'Phoenix Marketcity / 100ft Road', area_type: 'IT & Residential', popular: true },
      { name: 'OMR / Thoraipakkam', lat: 12.9348, lng: 80.2307, pin_code: '600097', landmark: 'Tidel Park / IT Expressway', area_type: 'Cyber Corridor', popular: true },
      { name: 'Nungambakkam', lat: 13.0569, lng: 80.2425, pin_code: '600034', landmark: 'Sterling Road / High Road', area_type: 'Upscale Central', popular: false },
      { name: 'Kodambakkam', lat: 13.0521, lng: 80.2255, pin_code: '600024', landmark: 'Bridge / Power House', area_type: 'Cinema & Central', popular: false },
      { name: 'Tambaram', lat: 12.9249, lng: 80.1000, pin_code: '600045', landmark: 'Sanatorium / GST Road', area_type: 'South Transit Hub', popular: false },
      { name: 'Guindy', lat: 13.0067, lng: 80.2024, pin_code: '600032', landmark: 'Kathipara / Industrial Estate', area_type: 'Transit & Tech Hub', popular: false },
    ],
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
    popular: true,
    localities: [
      { name: 'Koregaon Park', lat: 18.5362, lng: 73.8940, pin_code: '411001', landmark: 'North Main Road / Osho', area_type: 'Cosmopolitan Hub', popular: true },
      { name: 'Viman Nagar', lat: 18.5679, lng: 73.9143, pin_code: '411014', landmark: 'Phoenix Marketcity / Symbiosis', area_type: 'IT & Youth Hub', popular: true },
      { name: 'Kothrud', lat: 18.5074, lng: 73.8077, pin_code: '411038', landmark: 'Paud Road / Karve Statue', area_type: 'Prime Residential', popular: true },
      { name: 'Hinjewadi', lat: 18.5913, lng: 73.7389, pin_code: '411057', landmark: 'Rajiv Gandhi Infotech Park Phase 1', area_type: 'Mega IT Corridor', popular: true },
      { name: 'Baner', lat: 18.5590, lng: 73.7868, pin_code: '411045', landmark: 'High Street / Pan Card Club', area_type: 'Modern Dining & Tech', popular: true },
      { name: 'Wakad', lat: 18.5987, lng: 73.7686, pin_code: '411057', landmark: 'Datta Mandir Road / Mumbai Highway', area_type: 'Fast Growing IT Hub', popular: false },
      { name: 'Aundh', lat: 18.5580, lng: 73.8074, pin_code: '411007', landmark: 'DP Road / Westend Mall', area_type: 'Upscale Residential', popular: false },
    ],
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    lat: 22.5726,
    lng: 88.3639,
    popular: true,
    localities: [
      { name: 'Park Street', lat: 22.5529, lng: 88.3534, pin_code: '700016', landmark: 'Flurys / Camac Street', area_type: 'Central Dining & Heritage', popular: true },
      { name: 'Salt Lake / Sector V', lat: 22.5804, lng: 88.4312, pin_code: '700091', landmark: 'College More / RDB Boulevard', area_type: 'IT & Electronics Hub', popular: true },
      { name: 'New Town', lat: 22.5958, lng: 88.4722, pin_code: '700156', landmark: 'Action Area 1 / Eco Park', area_type: 'Smart City Township', popular: true },
      { name: 'Ballygunge', lat: 22.5280, lng: 88.3656, pin_code: '700019', landmark: 'Gariahat Market / Circular Road', area_type: 'Prime South Kolkata', popular: true },
      { name: 'Alipore', lat: 22.5312, lng: 88.3307, pin_code: '700027', landmark: 'National Library / Zoo', area_type: 'Heritage Luxury', popular: false },
      { name: 'Howrah', lat: 22.5958, lng: 88.2636, pin_code: '711101', landmark: 'Station Complex / Kona Expressway', area_type: 'Historic River Transit', popular: false },
    ],
  },
];

// Helper: Haversine distance in km
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find closest city from coordinates
export function findClosestCity(lat, lng) {
  let closest = CITIES[0];
  let min = Infinity;
  for (const c of CITIES) {
    const d = distanceKm(lat, lng, c.lat, c.lng);
    if (d < min) {
      min = d;
      closest = c;
    }
  }
  return closest;
}

// Find closest locality across all cities
export function findClosestLocalityGlobal(lat, lng) {
  let closestLoc = null;
  let closestCity = CITIES[0];
  let min = Infinity;

  for (const city of CITIES) {
    for (const loc of city.localities) {
      const d = distanceKm(lat, lng, loc.lat, loc.lng);
      if (d < min) {
        min = d;
        closestLoc = loc;
        closestCity = city;
      }
    }
  }

  return {
    ...(closestLoc || closestCity.localities[0]),
    city: closestCity.name,
    cityId: closestCity.id,
    state: closestCity.state,
  };
}

// Fast reverse geocode using OpenStreetMap with automatic fallback
export async function reverseGeocodeGps(lat, lng) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const localityName =
        addr.suburb ||
        addr.neighbourhood ||
        addr.residential ||
        addr.road ||
        addr.quarter ||
        'Current Area';
      const cityName =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.state_district ||
        addr.county ||
        'Local City';

      return {
        name: localityName,
        city: cityName,
        state: addr.state || '',
        lat,
        lng,
        landmark: data.display_name?.split(',').slice(0, 3).join(',') || `Near ${localityName}`,
        pin_code: addr.postcode || '',
        isGps: true,
      };
    }
  } catch {
    // Fall back to closest pre-configured city & locality
  }

  const closest = findClosestLocalityGlobal(lat, lng);
  return {
    name: closest.name,
    city: closest.city,
    state: closest.state,
    lat,
    lng,
    landmark: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)}) - Near ${closest.name}`,
    pin_code: closest.pin_code,
    isGps: true,
  };
}

// Default initial location: Bengaluru (or first city)
export const DEFAULT_LOCATION = {
  name: 'T. Nagar',
  city: 'Chennai',
  state: 'Tamil Nadu',
  cityId: 'chennai',
  lat: 13.0418,
  lng: 80.2341,
  pin_code: '600017',
  landmark: 'Pondy Bazaar / Panagal Park',
};
