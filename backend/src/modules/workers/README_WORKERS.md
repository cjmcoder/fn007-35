# FLOCKNODE Workers - Production Grade

## 🎯 **Overview**

This is the consolidated, production-grade worker system for FLOCKNODE, providing exactly-once processing, policy-driven enforcement, comprehensive observability, and anti-fraud by design.

## 🏗️ **Architecture**

### **Core Workers**

1. **ServerProvisionWorker** - Pterodactyl server lifecycle management
2. **StreamHealthWorker** - Stream telemetry and enforcement
3. **HmacGuard** - Security guard for HMAC verification
4. **ScheduledTasksService** - Cron-based task scheduling

### **Key Features**

- **Exactly-once Processing** - Event ID-based idempotency
- **Policy-driven Enforcement** - Configurable business rules
- **Comprehensive Observability** - Structured logging and metrics
- **Anti-fraud by Design** - Security-first approach

## 🖥️ **Server Provision Worker**

### **Responsibilities**

- Process `server.reserved` events
- Poll for server readiness (5-minute timeout)
- Handle server cleanup on `server.released`
- Update match checklists based on server status
- Automatic match cancellation and refunds on failure

### **Event Processing**

```typescript
// Server Reserved Event
{
  v: 'v1',
  eventId: 'uuid',
  matchId: 'match-id',
  panelServerId: 123
}

// Server Released Event
{
  v: 'v1',
  eventId: 'uuid',
  matchId: 'match-id',
  panelServerId: 123
}
```

### **Readiness Criteria**

1. **Server Installed** - Pterodactyl reports `installed: true`
2. **Admin Hooks OK** - HMAC admin hook endpoint called
3. **Overlay Connected** - Overlay service connected (if in container)

### **Failure Handling**

- **Timeout (5 minutes)** → Cancel match + refund
- **Pterodactyl API errors** → Retry with exponential backoff
- **Database errors** → Log and continue

## 📺 **Stream Health Worker**

### **Responsibilities**

- Monitor VERIFIED_STREAM matches every 30 seconds
- Enforce stream quality requirements
- Apply grace periods for temporary issues
- Trigger forfeits or disputes based on policy

### **Stream Requirements**

- **Minimum FPS**: 30
- **Minimum Bitrate**: 2500 kbps
- **Title Validation**: Must contain `#<matchId>` or `[<matchId>]`
- **Live Status**: Stream must be live

### **Enforcement Policy**

1. **Grace Period**: 90 seconds for temporary issues
2. **Overlay Check**: If overlay shows gameplay continued → forfeit
3. **No Overlay**: If no overlay confirmation → dispute
4. **Evidence Collection**: Stream violations logged for disputes

### **Checklist Updates**

- `p1StreamLive` / `p2StreamLive` - Live status
- `titlesContainMatchId` - Title validation
- `bitrateOk` - Bitrate requirements
- `fpsOk` - FPS requirements

## 🔒 **HMAC Security Guard**

### **Security Features**

- **CIDR Allowlist** - VPS-3 and WireGuard mesh only
- **Clock Skew Protection** - ±60 second tolerance
- **Replay Protection** - Nonce-based with Redis storage
- **Per-Match Secrets** - Rotating secrets with expiration
- **Timing-Safe Comparison** - Prevents timing attacks

### **Header Requirements**

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

### **IP Allowlist**

- `51.81.223.116/32` - VPS-3 public IP
- `10.42.0.0/16` - WireGuard mesh network
- `127.0.0.1/32` - Localhost
- `::1/128` - IPv6 localhost

## 📊 **Kafka Events**

### **Server Events**

- `server.reserved` - Server reservation created
- `server.ready` - Server ready for match
- `server.failed` - Server creation/readiness failed
- `server.released` - Server released after match

### **Stream Events**

- `stream.health.warn` - Stream health warning
- `stream.health.check` - Trigger health check
- `match.forfeit` - Stream violation forfeit
- `match.dispute` - Stream violation dispute

### **Security Events**

- `overlay.violation` - Security violations
- `hmac.verification.failed` - HMAC failures
- `replay.attack.detected` - Replay attacks

## ⏰ **Scheduled Tasks**

### **Stream Health Check**

- **Frequency**: Every 30 seconds
- **Backup**: Every minute
- **Scope**: All active VERIFIED_STREAM matches
- **Actions**: Update checklists, enforce policies

### **Server Monitoring**

- **Frequency**: Every 10 seconds (during provisioning)
- **Timeout**: 5 minutes maximum
- **Actions**: Poll readiness, handle timeouts

## 🔧 **Configuration**

### **Environment Variables**

```bash
# Pterodactyl Configuration
PTERO_APP_URL=https://panel.yourdomain.com
PTERO_APP_API_KEY=your_application_api_key

# Security
OVERLAY_MASTER_SECRET=your-master-secret
ADMIN_HOOK_SECRET=your-admin-hook-secret

# Timeouts
READY_DEADLINE_MS=300000  # 5 minutes
POLL_EVERY_MS=4000        # 4 seconds
OFFLINE_GRACE_MS=90000    # 90 seconds

# Limits
MAX_BODY_BYTES=65536      # 64KB
MAX_SKEW_MS=60000         # 60 seconds
```

### **Redis Keys**

```
wk:idemp:srv:reserved:<eventId>    # Server reserved idempotency
wk:idemp:srv:released:<eventId>    # Server released idempotency
str:grace:<matchId>:<side>         # Stream grace period
hmac:nonce:<keyId>:<nonce>         # HMAC nonce storage
hmac:secret:<keyId>                # Cached HMAC secrets
```

## 📈 **Monitoring**

### **Key Metrics**

- Server provisioning success rate
- Stream health check frequency
- HMAC verification success rate
- Replay attack attempts
- Grace period violations
- Forfeit vs dispute ratio

### **Alerts**

- Server provisioning failures
- Stream health violations
- HMAC verification failures
- Replay attack detection
- High error rates

### **Logging**

- Structured JSON logging
- Request/response correlation IDs
- Performance metrics
- Error stack traces
- Security violation details

## 🧪 **Testing**

### **Unit Tests**

```typescript
// Test server provision worker
describe('ServerProvisionWorker', () => {
  it('should process server reserved event', async () => {
    const payload = { v: 'v1', eventId: 'test', matchId: 'match-1', panelServerId: 123 };
    await worker.processServerReserved(payload);
    // Assertions
  });
});

// Test stream health worker
describe('StreamHealthWorker', () => {
  it('should enforce stream health rules', async () => {
    await worker.checkStreamHealth();
    // Assertions
  });
});

// Test HMAC guard
describe('HmacGuard', () => {
  it('should verify valid signatures', async () => {
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
```

### **Integration Tests**

- End-to-end server provisioning
- Stream health enforcement
- HMAC signature verification
- Kafka event processing
- Redis idempotency

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Server Provisioning Timeout**
   - Check Pterodactyl API connectivity
   - Verify server installation logs
   - Check admin hook endpoint

2. **Stream Health False Positives**
   - Verify stream API rate limits
   - Check title validation logic
   - Review grace period settings

3. **HMAC Verification Failures**
   - Check canonical JSON formatting
   - Verify timestamp accuracy
   - Ensure proper key ordering

### **Debug Commands**

```bash
# Check Redis keys
redis-cli keys "wk:idemp:*"
redis-cli keys "str:grace:*"
redis-cli keys "hmac:*"

# Monitor Kafka events
kafka-console-consumer --topic server.reserved
kafka-console-consumer --topic stream.health.warn

# Check worker logs
tail -f logs/workers.log | grep "ServerProvisionWorker"
tail -f logs/workers.log | grep "StreamHealthWorker"
```

## 🔮 **Future Enhancements**

1. **Advanced Analytics**
   - Machine learning for anomaly detection
   - Predictive failure analysis
   - Performance optimization

2. **Enhanced Security**
   - Certificate-based authentication
   - Multi-factor verification
   - Advanced rate limiting

3. **Scalability**
   - Horizontal worker scaling
   - Load balancing
   - Auto-scaling based on demand

4. **Integration**
   - More stream platforms
   - Advanced game engines
   - Mobile app integration

## 🎮 **FLOCKNODE Integration**

### **Match System Integration**

- Automatic checklist updates
- Real-time status monitoring
- Policy-driven enforcement
- Evidence collection for disputes

### **Anti-Fraud Measures**

- Per-match secret rotation
- Replay attack prevention
- IP allowlist enforcement
- Rate limiting protection

### **Observability**

- Comprehensive logging
- Real-time metrics
- Alert integration
- Performance monitoring

This worker system provides the foundation for FLOCKNODE's automated operations with robust error handling, comprehensive monitoring, and security-first design.





