#!/bin/bash

# FLOCKNODE Overlay Client Signing Example
# This script demonstrates how to sign and send overlay events

set -e

# Configuration
MATCH_ID="${MATCH_ID:-test-match-123}"
KEY_ID="${KEY_ID:-ovl_${MATCH_ID}_01}"
SECRET="${SECRET:-your-overlay-secret}"
OVERLAY_URL="${OVERLAY_URL:-https://overlay.flocknode.com/overlay/event}"

# Function to generate UUID v7 (simplified)
generate_uuid() {
    # This is a simplified UUID generator - use a proper UUID v7 library in production
    echo "$(date +%s%3N)-$(openssl rand -hex 8)"
}

# Function to create canonical JSON (sorted keys)
canonical_json() {
    local json="$1"
    # Use Node.js for proper canonical JSON with sorted keys
    node -e "
        const obj = $json;
        function canonicalize(x) {
            if (x === null || typeof x !== 'object') return JSON.stringify(x);
            if (Array.isArray(x)) return '[' + x.map(canonicalize).join(',') + ']';
            const keys = Object.keys(x).sort();
            return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalize(x[k])).join(',') + '}';
        }
        console.log(canonicalize(obj));
    "
}

# Function to send overlay event
send_overlay_event() {
    local event_type="$1"
    local payload="$2"
    
    # Generate unique identifiers
    local event_id=$(generate_uuid)
    local nonce=$(openssl rand -base64 18 | tr '+/' '-_' | tr -d '=')
    local timestamp=$(date +%s%3N)
    
    # Create event body
    local body=$(cat <<EOF
{
    "eventId": "$event_id",
    "matchId": "$MATCH_ID",
    "type": "$event_type",
    "payload": $payload,
    "timestamp": $timestamp
}
EOF
)
    
    # Create canonical payload for signing
    local canonical_payload=$(canonical_json "$payload")
    
    # Create canonical string for HMAC
    local canonical_string="v1|$KEY_ID|$timestamp|$nonce|$MATCH_ID|$event_type|$canonical_payload"
    
    # Generate HMAC signature
    local signature=$(printf "%s" "$canonical_string" | openssl dgst -sha256 -hmac "$SECRET" -hex | awk '{print $2}')
    
    echo "Sending $event_type event for match $MATCH_ID..."
    echo "Event ID: $event_id"
    echo "Canonical string: $canonical_string"
    echo "Signature: $signature"
    echo ""
    
    # Send the request
    local response=$(curl -s -w "\n%{http_code}" -X POST "$OVERLAY_URL" \
        -H "Content-Type: application/json" \
        -H "x-flock-key-id: $KEY_ID" \
        -H "x-flock-ts: $timestamp" \
        -H "x-flock-nonce: $nonce" \
        -H "x-flock-signature: $signature" \
        -d "$body")
    
    local http_code=$(echo "$response" | tail -n1)
    local response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        echo "✅ Event sent successfully: $response_body"
    else
        echo "❌ Event failed with HTTP $http_code: $response_body"
        return 1
    fi
}

# Function to send score update
send_score_update() {
    local home="$1"
    local away="$2"
    
    local payload=$(cat <<EOF
{
    "home": $home,
    "away": $away
}
EOF
)
    
    send_overlay_event "SCORE" "$payload"
}

# Function to send heartbeat
send_heartbeat() {
    local status="${1:-alive}"
    local uptime="${2:-0}"
    
    local payload=$(cat <<EOF
{
    "status": "$status",
    "uptime": $uptime
}
EOF
)
    
    send_overlay_event "HEARTBEAT" "$payload"
}

# Function to send state change
send_state_change() {
    local state="$1"
    local message="${2:-}"
    
    local payload=$(cat <<EOF
{
    "state": "$state",
    "message": "$message"
}
EOF
)
    
    send_overlay_event "STATE" "$payload"
}

# Function to send match end
send_match_end() {
    local reason="$1"
    local winner="${2:-}"
    local final_home="${3:-0}"
    local final_away="${4:-0}"
    
    local payload=$(cat <<EOF
{
    "reason": "$reason",
    "winner": "$winner",
    "finalScore": {
        "home": $final_home,
        "away": $final_away
    }
}
EOF
)
    
    send_overlay_event "MATCH_END" "$payload"
}

# Main execution
main() {
    echo "FLOCKNODE Overlay Client - Match ID: $MATCH_ID"
    echo "Key ID: $KEY_ID"
    echo "Overlay URL: $OVERLAY_URL"
    echo ""
    
    # Check if required environment variables are set
    if [ -z "$SECRET" ] || [ "$SECRET" = "your-overlay-secret" ]; then
        echo "❌ Please set the SECRET environment variable"
        echo "   export SECRET='your-actual-overlay-secret'"
        exit 1
    fi
    
    # Example usage
    echo "=== Sending example events ==="
    echo ""
    
    # Send initial heartbeat
    echo "1. Sending heartbeat..."
    send_heartbeat "ready" 0
    echo ""
    
    # Send state change
    echo "2. Sending state change..."
    send_state_change "STARTED" "Match has begun"
    echo ""
    
    # Send score updates
    echo "3. Sending score updates..."
    send_score_update 0 0
    sleep 1
    send_score_update 1 0
    sleep 1
    send_score_update 1 1
    sleep 1
    send_score_update 2 1
    echo ""
    
    # Send match end
    echo "4. Sending match end..."
    send_match_end "COMPLETED" "home" 2 1
    echo ""
    
    echo "=== All events sent successfully ==="
}

# Handle command line arguments
case "${1:-}" in
    "score")
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "Usage: $0 score <home> <away>"
            exit 1
        fi
        send_score_update "$2" "$3"
        ;;
    "heartbeat")
        send_heartbeat "${2:-alive}" "${3:-0}"
        ;;
    "state")
        if [ -z "$2" ]; then
            echo "Usage: $0 state <state> [message]"
            exit 1
        fi
        send_state_change "$2" "$3"
        ;;
    "end")
        if [ -z "$2" ]; then
            echo "Usage: $0 end <reason> [winner] [home_score] [away_score]"
            exit 1
        fi
        send_match_end "$2" "$3" "$4" "$5"
        ;;
    *)
        main
        ;;
esac





