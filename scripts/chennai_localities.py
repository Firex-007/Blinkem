"""Chennai localities reference for hyperlocal dispatch & distance calculations.

Maps key Chennai neighborhoods to approximate lat/lng, pin codes, and landmarks.
Used to seed realistic worker locations and support ETA/distance math.
"""

CHENNAI_LOCALITIES = [
    {
        "name": "T. Nagar",
        "lat": 13.0418,
        "lng": 80.2341,
        "pin_code": "600017",
        "landmark": "Pondy Bazaar / Usman Road",
    },
    {
        "name": "Kodambakkam",
        "lat": 13.0521,
        "lng": 80.2255,
        "pin_code": "600024",
        "landmark": "Kodambakkam flyover / film industry area",
    },
    {
        "name": "Mylapore",
        "lat": 13.0368,
        "lng": 80.2676,
        "pin_code": "600004",
        "landmark": "Kapaleeshwarar Temple",
    },
    {
        "name": "Saidapet",
        "lat": 13.0213,
        "lng": 80.2231,
        "pin_code": "600015",
        "landmark": "Saidapet bus depot",
    },
    {
        "name": "Ashok Nagar",
        "lat": 13.0378,
        "lng": 80.2123,
        "pin_code": "600083",
        "landmark": "Ashok Pillar",
    },
    {
        "name": "Nungambakkam",
        "lat": 13.0569,
        "lng": 80.2425,
        "pin_code": "600034",
        "landmark": "Nungambakkam High Road",
    },
    {
        "name": "Adyar",
        "lat": 13.0067,
        "lng": 80.2570,
        "pin_code": "600020",
        "landmark": "Theosophical Society / Adyar River",
    },
    {
        "name": "Velachery",
        "lat": 12.9815,
        "lng": 80.2180,
        "pin_code": "600042",
        "landmark": "Velachery Lake / Vijayanagar",
    },
    {
        "name": "K.K. Nagar",
        "lat": 13.0415,
        "lng": 80.1985,
        "pin_code": "600078",
        "landmark": "K.K. Nagar Tower Park",
    },
    {
        "name": "Vadapalani",
        "lat": 13.0500,
        "lng": 80.2121,
        "pin_code": "600026",
        "landmark": "Vadapalani Murugan Temple",
    },
    {
        "name": "Guindy",
        "lat": 13.0067,
        "lng": 80.2206,
        "pin_code": "600032",
        "landmark": "Guindy National Park / IIT Madras",
    },
]

CENTER = {"lat": 13.0418, "lng": 80.2341}  # T. Nagar default


def get_locality(name):
    for loc in CHENNAI_LOCALITIES:
        if loc["name"].lower() == name.lower():
            return loc
    return None


def get_all_names():
    return [loc["name"] for loc in CHENNAI_LOCALITIES]


if __name__ == "__main__":
    print("Chennai localities reference loaded.")
    for loc in CHENNAI_LOCALITIES:
        print(f"{loc['name']}: {loc['lat']},{loc['lng']} PIN {loc['pin_code']} - {loc['landmark']}")
