# FLOCKNODE Overlay Service - HMAC Events

## 🎯 **Overview**

This is the hardened overlay service for FLOCKNODE's anti-fraud and automation goals, providing HMAC-verified events, replay defense, per-match secrets, and comprehensive monitoring.

## 🏗️ **Architecture**

### **Core Components**

1. **OverlayService** - Main business logic with HMAC verification
2. **OverlayController** - REST API endpoints and event processing
3. **Event Types** - SCORE, STATE, MATCH_END, HEARTBEAT
4. **Kafka Events** - Real-time event streaming and monitoring

### **Security Features**

- **HMAC-SHA256 Signatures** - All events cryptographically signed
- **Replay Protection** - Nonce-based replay attack prevention
- **Clock Skew Protection** - ±60 second timestamp validation
- **IP Allowlist** - VPS-3 and overlay pod access only
- **Per-Match Secrets** - Short-lived, rotated secrets per match
- **Rate Limiting** - 10 events per second per match maximum

## 🔒 **HMAC Verification Process**

### **Headers Required**
```
x-flock-key-id: ovl_matchId_timestamp
x-flock-ts: 1737762334123
x-flock-nonce: base64url-encoded-nonce
x-flock-signature: hex-hmac-sha256-signature
```

### **Canonical String Format**
```
v1|<key-id>|<timestamp>|<nonce>|<matchId>|<type>|<canonical-json(payload)>
```

### **Canonical JSON Rules**
- UTF-8 encoding
- No spaces
- Keys sorted ascending
- Booleans/literals lowercase
- Numbers as given

## 📊 **Event Types**

### **SCORE Events**
```json
{
  "eventId": "01JD...",
  "matchId": "cku...",
  "type": "SCORE",
  "payload": { "home": 3, "away": 2 },
  "timestamp": 1737762334123
}
```

### **STATE Events**
```json
{
  "eventId": "01JD...",
  "matchId": "cku...",
  "type": "STATE",
  "payload": { "state": "PAUSE", "message": "Half time" },
  "timestamp": 1737762334123
}
```

### **MATCH_END Events**
```json
{
  "eventId": "01JD...",
  "matchId": "cku...",
  "type": "MATCH_END",
  "payload": {
    "reason": "COMPLETED",
    "winner": "home",
    "finalScore": { "home": 3, "away": 2 }
  },
  "timestamp": 1737762334123
}
```

### **HEARTBEAT Events**
```json
{
  "eventId": "01JD...",
  "matchId": "cku...",
  "type": "HEARTBEAT",
  "payload": { "status": "alive", "uptime": 3600 },
  "timestamp": 1737762334123
}
```

## 🚀 **API Endpoints**

### **Core Operations**
- `POST /overlay/event` - Process overlay event (HMAC verified)
- `GET /overlay/score/:matchId` - Get current match score
- `GET /overlay/heartbeat/:matchId` - Get last heartbeat (admin only)

### **Secret Management**
- `POST /overlay/secrets/:matchId` - Generate overlay secrets (admin only)
- `POST /overlay/secrets/:matchId/revoke` - Revoke overlay secrets (admin only)

### **Monitoring**
- `GET /overlay/health` - Service health check
- `POST /overlay/test/signature` - Test signature verification (dev only)

## 📊 **Kafka Events**

### **Event Processing**
- `overlay.event.ingested` - Event successfully processed
- `overlay.score.updated` - Score change detected
- `overlay.state` - Match state change
- `overlay.match_end` - Match completion event

### **Security Events**
- `overlay.violation` - Security violations (replay, signature failure, etc.)

### **Secret Management**
- `overlay.secret.generated` - New secrets created
- `overlay.secret.revoked` - Secrets revoked

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Security
OVERLAY_MASTER_SECRET=your-master-secret-for-generating-per-match-secrets
ADMIN_HOOK_SECRET=your-admin-hook-secret

# Limits
MAX_BODY_BYTES=32768  # 32KB
MAX_SKEW_MS=60000     # 60 seconds
RATE_LIMIT_PER_SECOND=10

# Redis Keys
NONCE_TTL_MS=120000   # 2 minutes
EVENT_ID_TTL_MS=86400000  # 24 hours
HEARTBEAT_TTL_MS=1800000  # 30 minutes
```

### **IP Allowlist**
```typescript
const allowedIPs = [
  '51.81.223.116', // VPS-3
  '10.42.0.0/16',  // WireGuard mesh
  '127.0.0.1',     // Localhost for testing
];
```

## 🧪 **Testing**

### **Client Examples**

**Bash Script:**
```bash
# Set environment variables
export MATCH_ID="test-match-123"
export KEY_ID="ovl_test-match-123_01"
export SECRET="your-overlay-secret"

# Send score update
./overlay-client-signing.sh score 2 1

# Send heartbeat
./overlay-client-signing.sh heartbeat "alive" 3600

# Send match end
./overlay-client-signing.sh end "COMPLETED" "home" 2 1
```

**Node.js Client:**
```javascript
const client = new FlockNodeOverlayClient({
  matchId: 'test-match-123',
  keyId: 'ovl_test-match-123_01',
  secret: 'your-overlay-secret'
});

// Send events
await client.sendScore(2, 1);
await client.sendHeartbeat('alive', 3600);
await client.sendMatchEnd('COMPLETED', 'home', { home: 2, away: 1 });
```

### **Manual Testing**
```bash
# Generate signature manually
KEY_ID="ovl_test-match-123_01"
NONCE=$(openssl rand -base64 18 | tr '+/' '-_' | tr -d '=')
TS=$(date +%s%3N)
BODY='{"eventId":"test-123","matchId":"test-match-123","type":"SCORE","payload":{"home":2,"away":1},"timestamp":'$TS'}'
CANON_PAYLOAD='{"away":1,"home":2}'
CANON="v1|$KEY_ID|$TS|$NONCE|test-match-123|SCORE|$CANON_PAYLOAD"
SIG=$(printf "%s" "$CANON" | openssl dgst -sha256 -hmac "$SECRET" -hex | awk '{print $2}')

# Send request
curl -X POST https://overlay.flocknode.com/overlay/event \
  -H "Content-Type: application/json" \
  -H "x-flock-key-id: $KEY_ID" \
  -H "x-flock-ts: $TS" \
  -H "x-flock-nonce: $NONCE" \
  -H "x-flock-signature: $SIG" \
  -d "$BODY"
```

## 📈 **Monitoring**

### **Key Metrics**
- Event ingestion rate
- Signature verification success rate
- Replay attack attempts
- Rate limit violations
- IP allowlist violations
- Clock skew incidents

### **Alerts**
- High signature failure rate
- Replay attack detection
- Rate limit violations
- IP allowlist violations
- Service health issues

### **Redis Keys**
```
ovl:nonce:<keyId>:<nonce>     # Replay protection (TTL: 2 min)
ovl:eid:<eventId>             # Event idempotency (TTL: 24h)
ovl:lasthb:<matchId>          # Last heartbeat (TTL: 30 min)
ovl:score:<matchId>           # Current score (TTL: 1h)
ovl:secret:<matchId>:<keyId>  # Cached secrets (TTL: 5 min)
ovl:rl:<matchId>:<type>       # Rate limiting (TTL: 1s)
```

## 🔮 **Future Enhancements**

1. **Advanced Analytics**
   - Event pattern analysis
   - Anomaly detection
   - Performance metrics

2. **Enhanced Security**
   - Certificate-based authentication
   - Multi-factor verification
   - Advanced rate limiting

3. **Real-time Features**
   - WebSocket event streaming
   - Live score updates
   - Real-time notifications

4. **Integration**
   - Stream platform APIs
   - Game engine plugins
   - Mobile app integration

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Signature Mismatch**
   - Check canonical JSON formatting
   - Verify timestamp accuracy
   - Ensure proper key ordering

2. **Replay Attacks**
   - Check nonce uniqueness
   - Verify timestamp freshness
   - Monitor for duplicate events

3. **Rate Limiting**
   - Check event frequency
   - Implement proper delays
   - Monitor rate limit counters

### **Debug Commands**
```bash
# Check Redis keys
redis-cli keys "ovl:*"

# Monitor events
redis-cli monitor | grep "ovl:"

# Check rate limits
redis-cli get "ovl:rl:test-match-123:SCORE"
```

## 🎮 **FLOCKNODE Integration**

### **Checklist Updates**
- `overlayConnected` = PASS on first valid event
- `overlayHeartbeat` = PASS on recent heartbeat
- Automatic checklist updates for match readiness

### **Match System Integration**
- Score events update Redis for real-time display
- MATCH_END events can trigger auto-resolution
- Heartbeat monitoring for match health

### **Anti-Fraud Measures**
- Per-match secret rotation
- Replay attack prevention
- IP allowlist enforcement
- Rate limiting protection

This overlay service provides the foundation for FLOCKNODE's trusted event processing with comprehensive security, monitoring, and automation capabilities.





