#!/bin/bash

# FLOCKNODE Container Admin Hook Script
# This script should be run inside game containers to report readiness

set -e

# Configuration
MATCH_ID="${MATCH_ID:-}"
ADMIN_HOOK_URL="${ADMIN_HOOK_URL:-https://api.flocknode.com/server/admin-hook}"
ADMIN_HOOK_SECRET="${ADMIN_HOOK_SECRET:-}"

# Validate required environment variables
if [ -z "$MATCH_ID" ]; then
    echo "ERROR: MATCH_ID environment variable is required"
    exit 1
fi

if [ -z "$ADMIN_HOOK_SECRET" ]; then
    echo "ERROR: ADMIN_HOOK_SECRET environment variable is required"
    exit 1
fi

# Function to send admin hook
send_admin_hook() {
    local status="$1"
    local message="${2:-}"
    local version="${3:-}"
    
    # Get current timestamp
    local timestamp=$(date +%s)
    
    # Create payload
    local payload=$(cat <<EOF
{
    "status": "$status",
    "ts": $timestamp,
    "message": "$message",
    "version": "$version"
}
EOF
)
    
    # Generate HMAC signature
    local signature=$(echo -n "$payload" | openssl dgst -sha256 -hmac "$ADMIN_HOOK_SECRET" -hex | sed 's/^.* //')
    
    # Send hook
    echo "Sending admin hook for match $MATCH_ID: $status"
    
    local response=$(curl -s -w "\n%{http_code}" -X POST "$ADMIN_HOOK_URL/$MATCH_ID" \
        -H "x-flock-signature: $signature" \
        -H "Content-Type: application/json" \
        -d "$payload")
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        echo "Admin hook sent successfully: $body"
        return 0
    else
        echo "Admin hook failed with HTTP $http_code: $body"
        return 1
    fi
}

# Function to wait for server to be ready
wait_for_server_ready() {
    local max_attempts=30
    local attempt=1
    
    echo "Waiting for server to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        # Check if server is ready (implement game-specific logic here)
        if check_server_ready; then
            echo "Server is ready!"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts: Server not ready yet, waiting 10 seconds..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    echo "Server failed to become ready within timeout"
    return 1
}

# Function to check if server is ready (game-specific implementation)
check_server_ready() {
    # This is a placeholder - implement game-specific logic
    # Examples:
    # - Check if game server is listening on expected port
    # - Verify configuration files are loaded
    # - Check if game world is initialized
    # - Verify admin commands are working
    
    # For demonstration, we'll just check if a port is listening
    # Replace with actual game-specific checks
    
    local port="${GAME_PORT:-7777}"
    if netstat -ln | grep -q ":$port "; then
        return 0
    else
        return 1
    fi
}

# Function to start the game server
start_game_server() {
    echo "Starting game server for match $MATCH_ID..."
    
    # This is a placeholder - implement game-specific startup logic
    # Examples:
    # - Start the game server binary
    # - Load configuration files
    # - Initialize game world
    # - Set up admin commands
    
    # For demonstration, we'll just sleep to simulate startup
    sleep 5
    
    echo "Game server started"
}

# Main execution
main() {
    echo "FLOCKNODE Container Admin Hook - Match ID: $MATCH_ID"
    
    # Send initial status
    send_admin_hook "starting" "Game server starting up" "1.0.0"
    
    # Start the game server
    start_game_server
    
    # Wait for server to be ready
    if wait_for_server_ready; then
        # Send ready status
        send_admin_hook "ready" "Game server is ready for players" "1.0.0"
        
        # Keep server running and send periodic health checks
        while true; do
            sleep 60  # Send health check every minute
            
            # Check server health (implement game-specific logic)
            if check_server_ready; then
                send_admin_hook "healthy" "Server is running normally" "1.0.0"
            else
                send_admin_hook "unhealthy" "Server health check failed" "1.0.0"
                break
            fi
        done
    else
        # Send failure status
        send_admin_hook "failed" "Server failed to become ready" "1.0.0"
        exit 1
    fi
}

# Handle signals for graceful shutdown
trap 'echo "Received shutdown signal, sending final status..."; send_admin_hook "shutdown" "Server shutting down" "1.0.0"; exit 0' SIGTERM SIGINT

# Run main function
main "$@"





