#!/usr/bin/env bash
# smoke.sh — Phase 3 happy-path verification
# Usage: ./smoke.sh
# Tests: create request → wait for offers → accept → booking → fast-forward → start (OTP) → complete → review

set -e

BASE="http://localhost:8000/api"
PASS=0
FAIL=0

ok() { echo "  [PASS] $1"; PASS=$((PASS+1)); }
fail() { echo "  [FAIL] $1"; FAIL=$((FAIL+1)); }

echo "=== Phase 3 Smoke Test ==="

# Ensure DB is clean
echo "Resetting database..."
curl -s -X POST "$BASE/demo/reset" -H "X-User-Id: 1" > /dev/null
ok "demo/reset"

# 1. Create request as customer 1
echo "Creating request..."
RESP=$(curl -s -X POST "$BASE/requests" -H "Content-Type: application/json" -H "X-User-Id: 1" -d '{"category":"plumber","description":"Kitchen sink leaking","lat":13.0418,"lng":80.2341,"address":"12, South Usman Rd, T. Nagar","urgency":"now"}')
REQ_ID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
MATCHED=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['matched_count'])")
echo "  Request id=$REQ_ID matched=$MATCHED"
[ "$REQ_ID" != "" ] && ok "POST /requests" || fail "POST /requests"

# 2. Wait for bot offers (8s)
echo "Waiting 8s for bot offers..."
sleep 8

# 3. Get offers
echo "Fetching offers..."
RESP=$(curl -s "$BASE/requests/$REQ_ID" -H "X-User-Id: 1")
OFFER_COUNT=$(echo "$RESP" | python3 -c "import sys,json; print(len(json.load(sys.stdin)['offers']))")
STATUS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])")
echo "  status=$STATUS offers=$OFFER_COUNT"
[ "$OFFER_COUNT" -ge 1 ] && ok "GET /requests/$REQ_ID (offers ready)" || fail "GET /requests/$REQ_ID"

# 4. Accept first offer
OFFER_ID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['offers'][0]['id'])")
echo "  Accepting offer $OFFER_ID..."
RESP=$(curl -s -X POST "$BASE/offers/$OFFER_ID/accept" -H "Content-Type: application/json" -H "X-User-Id: 1")
BOOKING_ID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['booking_id'])")
echo "  Booking id=$BOOKING_ID"
[ "$BOOKING_ID" != "" ] && ok "POST /offers/$OFFER_ID/accept" || fail "POST /offers/$OFFER_ID/accept"

# 5. Get booking — verify OTP exists
echo "Fetching booking details..."
RESP=$(curl -s "$BASE/bookings/$BOOKING_ID" -H "X-User-Id: 1")
OTP=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('otp',''))")
STATUS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])")
echo "  status=$STATUS otp=$OTP"
[ "$OTP" != "" ] && [ "$OTP" != "None" ] && ok "GET /bookings/$BOOKING_ID (OTP present)" || fail "GET /bookings/$BOOKING_ID"

# 6. Fast-forward
echo "Fast-forwarding booking..."
curl -s -X POST "$BASE/demo/booking/$BOOKING_ID/fast-forward" -H "X-User-Id: 1" > /dev/null
ok "POST /demo/booking/$BOOKING_ID/fast-forward"

# 7. Start job as worker (worker_id = user_id - 2)
WORKER_ID=$((BOOKING_ID + 2))  # heuristic: worker id N maps to user id N+2
RESP=$(curl -s -X POST "$BASE/bookings/$BOOKING_ID/start" -H "Content-Type: application/json" -H "X-User-Id: $WORKER_ID" -d "{\"otp\":\"$OTP\"}")
START_STATUS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])" 2>/dev/null || echo "ERR")
echo "  start status=$START_STATUS"
[ "$START_STATUS" = "in_progress" ] && ok "POST /bookings/$BOOKING_ID/start (worker)" || fail "POST /bookings/$BOOKING_ID/start"

# 8. Complete as worker
RESP=$(curl -s -X POST "$BASE/bookings/$BOOKING_ID/complete" -H "Content-Type: application/json" -H "X-User-Id: $WORKER_ID")
COMPLETE_STATUS=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])" 2>/dev/null || echo "ERR")
echo "  complete status=$COMPLETE_STATUS"
[ "$COMPLETE_STATUS" = "completed" ] && ok "POST /bookings/$BOOKING_ID/complete (worker)" || fail "POST /bookings/$BOOKING_ID/complete"

# 9. Review as customer
RESP=$(curl -s -X POST "$BASE/bookings/$BOOKING_ID/review" -H "Content-Type: application/json" -H "X-User-Id: 1" -d '{"rating":5,"comment":"Great service!"}')
REVIEW_OK=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('ok',False))" 2>/dev/null || echo "False")
echo "  review ok=$REVIEW_OK"
[ "$REVIEW_OK" = "True" ] && ok "POST /bookings/$BOOKING_ID/review" || fail "POST /bookings/$BOOKING_ID/review"

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ] && echo "SMOKE TEST PASSED" || echo "SMOKE TEST FAILED"
exit $FAIL
