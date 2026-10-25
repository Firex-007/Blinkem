"""Dependency-free demo API for Blink'em nearby workers and shops.

Run from the repository root:
    python demo/nearby-marketplace-api.py --port 8787

GET /api/demo/nearby-marketplace?lat=13.0418&lng=80.2341&category=plumber&radius_km=8

All contact numbers in this fixture are synthetic demo values. This adapter is
separate from the contracted /api/nearby-workers endpoint, which intentionally
does not expose worker phone numbers to customers.
"""

from __future__ import annotations

import argparse
import json
import math
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


DATA_PATH = Path(__file__).with_name("nearby-marketplace.json")
DEFAULT_RADIUS_KM = 10.0
MAX_RADIUS_KM = 30.0


def haversine_km(lat_a: float, lng_a: float, lat_b: float, lng_b: float) -> float:
    """Return great-circle distance between two coordinates in kilometres."""
    earth_radius_km = 6371.0
    phi_a, phi_b = math.radians(lat_a), math.radians(lat_b)
    delta_phi = math.radians(lat_b - lat_a)
    delta_lambda = math.radians(lng_b - lng_a)
    value = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi_a) * math.cos(phi_b) * math.sin(delta_lambda / 2) ** 2
    )
    return 2 * earth_radius_km * math.asin(math.sqrt(value))


def approx_eta_minutes(distance_km: float) -> int:
    """A stable demo ETA: ~18 km/h urban travel plus a small dispatch buffer."""
    return max(5, round((distance_km / 18.0) * 60 + 4))


def nearby_items(items, lat: float, lng: float, radius_km: float, category: str | None = None):
    rows = []
    for item in items:
        if category and category not in item.get("categories", item.get("service_categories", [])):
            continue
        distance = haversine_km(lat, lng, item["lat"], item["lng"])
        if distance > radius_km:
            continue
        row = dict(item)
        row["distance_km"] = round(distance, 1)
        row["eta_min"] = approx_eta_minutes(distance)
        rows.append(row)
    return sorted(rows, key=lambda row: (row["distance_km"], row["name"]))


def build_payload(lat: float, lng: float, category: str | None, radius_km: float):
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    workers = [
        worker
        for worker in nearby_items(data["workers"], lat, lng, radius_km, category)
        if worker["availability"] == "available_now"
    ][:12]
    shops = nearby_items(data["shops"], lat, lng, radius_km, category)[:12]
    return {
        "schema_version": data["schema_version"],
        "source": "demo_fixture",
        "demo_only": True,
        "location": {"lat": lat, "lng": lng, "city": data["city"]},
        "filters": {"category": category, "radius_km": radius_km},
        "workers": workers,
        "shops": shops,
    }


class MarketplaceHandler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self._send_json(200, {"ok": True, "source": "demo_fixture"})
            return
        if parsed.path != "/api/demo/nearby-marketplace":
            self._send_json(404, {"detail": "Route not found"})
            return

        params = parse_qs(parsed.query)
        try:
            default_center = json.loads(DATA_PATH.read_text(encoding="utf-8"))["default_center"]
            lat = float(params.get("lat", [default_center["lat"]])[0])
            lng = float(params.get("lng", [default_center["lng"]])[0])
            radius_km = float(params.get("radius_km", [DEFAULT_RADIUS_KM])[0])
            if not (-90 <= lat <= 90 and -180 <= lng <= 180):
                raise ValueError("lat/lng outside valid coordinate bounds")
            if not (0 < radius_km <= MAX_RADIUS_KM):
                raise ValueError(f"radius_km must be between 0 and {MAX_RADIUS_KM:g}")
            category = params.get("category", [None])[0] or None
            payload = build_payload(lat, lng, category, radius_km)
        except (TypeError, ValueError, KeyError, OSError, json.JSONDecodeError) as exc:
            self._send_json(400, {"detail": f"Invalid nearby query: {exc}"})
            return
        self._send_json(200, payload)

    def log_message(self, fmt, *args):
        # Keep terminal output quiet during a short live demo.
        return


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8787)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), MarketplaceHandler)
    print(f"Blink'em demo marketplace API ready at http://{args.host}:{args.port}")
    print("Endpoint: /api/demo/nearby-marketplace (Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

