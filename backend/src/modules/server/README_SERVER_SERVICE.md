# FLOCKNODE Server Service - MANAGED_SERVER Mode

## 🎯 **Overview**

This is the hardened server service for FLOCKNODE's MANAGED_SERVER mode, providing idempotent Pterodactyl reservations, HMAC-verified admin hooks, automated cleanup, and comprehensive monitoring.

## 🏗️ **Architecture**

### **Core Components**

1. **ServerService** - Main business logic with Pterodactyl integration
2. **ServerController** - REST API endpoints and admin hooks
3. **Server Configuration** - Game presets and region mapping
4. **Kafka Events** - Real-time server lifecycle events

### **Server Lifecycle**

```
REQUESTED → PROVISIONING → READY → RELEASING → RELEASED
                ↓
              FAILED (on error)
```

- **REQUESTED**: Server reservation created in database
- **PROVISIONING**: Pterodactyl server creation in progress
- **READY**: Server installed, started, and admin hooks verified
- **FAILED**: Server creation or readiness failed
- **RELEASING**: Server deletion in progress
- **RELEASED**: Server successfully deleted

## 🎮 **Supported Games**

### **Assetto Corsa Competizione**
- **Egg ID**: 123
- **Docker Image**: `ghcr.io/flocknode/acc:latest`
- **Memory**: 4GB
- **CPU**: 200%
- **Disk**: 10GB

### **PES6**
- **Egg ID**: 124
- **Docker Image**: `ghcr.io/flocknode/pes6:latest`
- **Memory**: 2GB
- **CPU**: 150%
- **Disk**: 5GB

### **FIFA 24**
- **Egg ID**: 125
- **Docker Image**: `ghcr.io/flocknode/fifa24:latest`
- **Memory**: 3GB
- **CPU**: 175%
- **Disk**: 8GB

## 🌍 **Supported Regions**

- **us-east**: Location ID 1
- **us-central**: Location ID 2
- **us-west**: Location ID 3
- **eu-west**: Location ID 4
- **eu-central**: Location ID 5
- **asia-pacific**: Location ID 6

## 🔒 **Security Features**

### **HMAC Verification**
- All admin hooks signed with HMAC-SHA256
- Timestamp freshness check (±30 seconds)
- Replay protection via signature validation

### **Idempotency**
- Redis locks for reservation operations
- Database-level upsert operations
- Duplicate request protection

### **Environment Isolation**
- Per-match server instances
- Unique server names with match ID
- Isolated network and resources

## 🚀 **API Endpoints**

### **Core Operations**
- `POST /server/reserve` - Reserve server for match
- `GET /server/status/:matchId` - Get server status
- `POST /server/release/:matchId` - Release server
- `GET /server/reservation/:matchId` - Get reservation details
- `GET /server/active` - Get all active reservations

### **Admin Hooks**
- `POST /server/admin-hook/:matchId` - HMAC-verified server status
- `POST /server/health/:matchId` - Server health check

## 📊 **Kafka Events**

### **Server Lifecycle**
- `server.reserved` - Server reservation created
- `server.ready` - Server ready for match
- `server.failed` - Server creation/readiness failed
- `server.released` - Server released after match

### **Monitoring Events**
- `server.health_check` - Server health status
- `server.admin_hook` - Admin hook received
- `server.status_update` - Server status change

## ⏰ **Automation & Timeouts**

### **Readiness Timeout**
- **5 minutes** to reach READY state
- Automatic failure and refund if timeout
- Progressive status polling every 4 seconds

### **Checklist Integration**
- `serverReserved` = PASS after Pterodactyl creation
- `serverReady` = PASS after server installation
- `adminHooksOk` = PASS after HMAC admin hook

### **Cleanup Automation**
- Automatic server release after match completion
- Failed reservation cleanup
- Resource monitoring and alerts

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Pterodactyl Configuration
PTERO_APP_URL=https://panel.yourdomain.com
PTERO_APP_API_KEY=your_application_api_key
PTERO_CLIENT_API_KEY=your_client_api_key  # Optional

# Security
ADMIN_HOOK_SECRET=your_hmac_secret

# Timeouts
READY_DEADLINE_SEC=300  # 5 minutes
POLL_INTERVAL_MS=4000   # 4 seconds
```

### **Game Presets**
Each game has a predefined configuration including:
- Docker image and startup command
- Resource limits (memory, CPU, disk)
- Environment variables
- Port allocation settings

## 🧪 **Testing**

### **Manual Testing**
```bash
# Reserve a server
curl -X POST http://localhost:3000/server/reserve \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "matchId": "test-match-123",
    "gameSlug": "assetto-corsa-competizione",
    "region": "us-east"
  }'

# Check server status
curl -X GET http://localhost:3000/server/status/test-match-123 \
  -H "Authorization: Bearer $JWT_TOKEN"

# Release server
curl -X POST http://localhost:3000/server/release/test-match-123 \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### **Admin Hook Testing**
```bash
# Generate HMAC signature
SIG=$(echo -n '{"status":"ready","ts":'$(date +%s)'}' | \
  openssl dgst -sha256 -hmac "$ADMIN_HOOK_SECRET" -hex | \
  sed 's/^.* //')

# Send admin hook
curl -X POST http://localhost:3000/server/admin-hook/test-match-123 \
  -H "x-flock-signature: $SIG" \
  -H "Content-Type: application/json" \
  -d '{"status":"ready","ts":'$(date +%s)'}'
```

## 📈 **Monitoring**

### **Key Metrics**
- Server reservation success rate
- Average provisioning time
- Server failure rate
- Resource utilization
- Admin hook response time

### **Alerts**
- Server creation failures
- Readiness timeouts
- Admin hook failures
- Resource exhaustion
- Pterodactyl API errors

## 🔮 **Future Enhancements**

1. **Advanced Resource Management**
   - Dynamic resource allocation
   - Load balancing across nodes
   - Auto-scaling based on demand

2. **Enhanced Monitoring**
   - Real-time server metrics
   - Performance analytics
   - Predictive failure detection

3. **Multi-Cloud Support**
   - AWS, GCP, Azure integration
   - Cross-region failover
   - Cost optimization

4. **Game-Specific Features**
   - Custom game configurations
   - Mod support
   - Tournament modes

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Server Creation Fails**
   - Check Pterodactyl API credentials
   - Verify node availability
   - Check resource limits

2. **Admin Hook Failures**
   - Verify HMAC secret configuration
   - Check timestamp freshness
   - Validate signature generation

3. **Readiness Timeouts**
   - Check server installation logs
   - Verify admin hook implementation
   - Monitor resource usage

### **Debug Commands**
```bash
# Check active reservations
curl -X GET http://localhost:3000/server/active \
  -H "Authorization: Bearer $JWT_TOKEN"

# Get server logs from Pterodactyl
curl -X GET https://panel.yourdomain.com/api/application/servers/{id}/logs \
  -H "Authorization: Bearer $PTERO_APP_API_KEY"
```

This server service provides the foundation for FLOCKNODE's MANAGED_SERVER mode with robust Pterodactyl integration, comprehensive monitoring, and automated operations.





