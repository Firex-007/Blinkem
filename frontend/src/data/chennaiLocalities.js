export const CHENNAI_LOCALITIES = [
  {
    name: "T. Nagar",
    lat: 13.0418,
    lng: 80.2341,
    pin_code: "600017",
    landmark: "Pondy Bazaar / Panagal Park",
    area_type: "Commercial & Residential",
    popular: true,
  },
  {
    name: "Kodambakkam",
    lat: 13.0521,
    lng: 80.2255,
    pin_code: "600024",
    landmark: "Kodambakkam Bridge / Power House",
    area_type: "Central Chennai",
    popular: true,
  },
  {
    name: "Mylapore",
    lat: 13.0368,
    lng: 80.2676,
    pin_code: "600004",
    landmark: "Kapaleeshwarar Temple / Luz Corner",
    area_type: "Heritage & Cultural Hub",
    popular: true,
  },
  {
    name: "Saidapet",
    lat: 13.0213,
    lng: 80.2231,
    pin_code: "600015",
    landmark: "Saidapet Metro / Maraimalai Adigal Bridge",
    area_type: "Transit & Residential",
    popular: true,
  },
  {
    name: "Ashok Nagar",
    lat: 13.0378,
    lng: 80.2123,
    pin_code: "600083",
    landmark: "Ashok Pillar / 11th Avenue",
    area_type: "Planned Residential",
    popular: true,
  },
  {
    name: "Nungambakkam",
    lat: 13.0569,
    lng: 80.2425,
    pin_code: "600034",
    landmark: "High Road / Sterling Road",
    area_type: "Commercial & Upscale",
    popular: true,
  },
  {
    name: "Adyar",
    lat: 13.0067,
    lng: 80.2570,
    pin_code: "600020",
    landmark: "Gandhi Nagar / Adyar Signal",
    area_type: "South Chennai Prime",
    popular: true,
  },
  {
    name: "Velachery",
    lat: 12.9815,
    lng: 80.2180,
    pin_code: "600042",
    landmark: "Phoenix Marketcity / 100 Feet Road",
    area_type: "IT & Hub",
    popular: true,
  },
  {
    name: "Anna Nagar",
    lat: 13.0850,
    lng: 80.2101,
    pin_code: "600040",
    landmark: "Anna Arch / Roundtana",
    area_type: "West Chennai Prime",
    popular: true,
  },
  {
    name: "Vadapalani",
    lat: 13.0500,
    lng: 80.2120,
    pin_code: "600026",
    landmark: "Murugan Temple / Forum Vijaya Mall",
    area_type: "Transit Hub",
    popular: true,
  },
  {
    name: "Guindy",
    lat: 13.0067,
    lng: 80.2024,
    pin_code: "600032",
    landmark: "Kathipara Flyover / Industrial Estate",
    area_type: "Transit & Tech Hub",
    popular: true,
  },
];

export function findClosestLocality(lat, lng) {
  let closest = CHENNAI_LOCALITIES[0];
  let minDistance = Infinity;

  for (const loc of CHENNAI_LOCALITIES) {
    const dLat = loc.lat - lat;
    const dLng = loc.lng - lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }
  return closest;
}
