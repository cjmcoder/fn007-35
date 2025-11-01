#!/usr/bin/env node

/**
 * FLOCKNODE Overlay Client - Node.js Implementation
 * Production-ready client for sending overlay events with proper HMAC signing
 */

const crypto = require('crypto');
const https = require('https');
const { v4: uuidv4 } = require('uuid');

class FlockNodeOverlayClient {
  constructor(config) {
    this.matchId = config.matchId;
    this.keyId = config.keyId;
    this.secret = config.secret;
    this.baseUrl = config.baseUrl || 'https://overlay.flocknode.com';
    this.maxSkewMs = config.maxSkewMs || 60000;
  }

  /**
   * Generate UUID v7 (simplified implementation)
   */
  generateEventId() {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${random}`;
  }

  /**
   * Generate secure nonce
   */
  generateNonce() {
    return crypto.randomBytes(18).toString('base64url');
  }

  /**
   * Create canonical JSON with sorted keys
   */
  canonicalize(obj) {
    if (obj === null || typeof obj !== 'object') {
      return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
      return '[' + obj.map(item => this.canonicalize(item)).join(',') + ']';
    }

    const keys = Object.keys(obj).sort();
    const pairs = keys.map(key => 
      JSON.stringify(key) + ':' + this.canonicalize(obj[key])
    );
    return '{' + pairs.join(',') + '}';
  }

  /**
   * Create canonical payload string for HMAC signing
   */
  createCanonicalString(keyId, timestamp, nonce, matchId, type, payload) {
    const canonicalPayload = this.canonicalize(payload);
    return `v1|${keyId}|${timestamp}|${nonce}|${matchId}|${type}|${canonicalPayload}`;
  }

  /**
   * Generate HMAC signature
   */
  generateSignature(canonicalString, secret) {
    return crypto
      .createHmac('sha256', secret)
      .update(canonicalString, 'utf8')
      .digest('hex');
  }

  /**
   * Send HTTP request
   */
  async sendRequest(url, options, data) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const response = {
              statusCode: res.statusCode,
              headers: res.headers,
              body: JSON.parse(body)
            };
            resolve(response);
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: body
            });
          }
        });
      });

      req.on('error', reject);
      req.write(JSON.stringify(data));
      req.end();
    });
  }

  /**
   * Send overlay event
   */
  async sendEvent(type, payload) {
    const eventId = this.generateEventId();
    const nonce = this.generateNonce();
    const timestamp = Date.now();

    const body = {
      eventId,
      matchId: this.matchId,
      type,
      payload,
      timestamp
    };

    const canonicalString = this.createCanonicalString(
      this.keyId,
      timestamp,
      nonce,
      this.matchId,
      type,
      payload
    );

    const signature = this.generateSignature(canonicalString, this.secret);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-flock-key-id': this.keyId,
        'x-flock-ts': timestamp.toString(),
        'x-flock-nonce': nonce,
        'x-flock-signature': signature
      }
    };

    try {
      const response = await this.sendRequest(
        `${this.baseUrl}/overlay/event`,
        options,
        body
      );

      if (response.statusCode === 200) {
        console.log(`✅ ${type} event sent successfully:`, response.body);
        return response.body;
      } else {
        console.error(`❌ ${type} event failed:`, response.body);
        throw new Error(`HTTP ${response.statusCode}: ${JSON.stringify(response.body)}`);
      }
    } catch (error) {
      console.error(`❌ Failed to send ${type} event:`, error.message);
      throw error;
    }
  }

  /**
   * Send score update
   */
  async sendScore(home, away) {
    return this.sendEvent('SCORE', { home, away });
  }

  /**
   * Send heartbeat
   */
  async sendHeartbeat(status = 'alive', uptime = 0) {
    return this.sendEvent('HEARTBEAT', { status, uptime });
  }

  /**
   * Send state change
   */
  async sendState(state, message = '') {
    return this.sendEvent('STATE', { state, message });
  }

  /**
   * Send match end
   */
  async sendMatchEnd(reason, winner = '', finalScore = { home: 0, away: 0 }) {
    return this.sendEvent('MATCH_END', { reason, winner, finalScore });
  }

  /**
   * Get current match score
   */
  async getScore() {
    try {
      const response = await this.sendRequest(
        `${this.baseUrl}/overlay/score/${this.matchId}`,
        { method: 'GET' },
        null
      );

      if (response.statusCode === 200) {
        return response.body;
      } else {
        throw new Error(`HTTP ${response.statusCode}: ${JSON.stringify(response.body)}`);
      }
    } catch (error) {
      console.error('❌ Failed to get score:', error.message);
      throw error;
    }
  }
}

// Example usage
async function main() {
  const config = {
    matchId: process.env.MATCH_ID || 'test-match-123',
    keyId: process.env.KEY_ID || 'ovl_test-match-123_01',
    secret: process.env.OVERLAY_SECRET || 'your-overlay-secret',
    baseUrl: process.env.OVERLAY_URL || 'https://overlay.flocknode.com'
  };

  if (!config.secret || config.secret === 'your-overlay-secret') {
    console.error('❌ Please set OVERLAY_SECRET environment variable');
    process.exit(1);
  }

  const client = new FlockNodeOverlayClient(config);

  try {
    console.log(`🎮 FLOCKNODE Overlay Client - Match: ${config.matchId}`);
    console.log(`🔑 Key ID: ${config.keyId}`);
    console.log(`🌐 URL: ${config.baseUrl}`);
    console.log('');

    // Send initial heartbeat
    console.log('1. Sending heartbeat...');
    await client.sendHeartbeat('ready', 0);
    await sleep(1000);

    // Send match start
    console.log('2. Sending match start...');
    await client.sendState('STARTED', 'Match has begun');
    await sleep(1000);

    // Send score updates
    console.log('3. Sending score updates...');
    await client.sendScore(0, 0);
    await sleep(1000);
    await client.sendScore(1, 0);
    await sleep(1000);
    await client.sendScore(1, 1);
    await sleep(1000);
    await client.sendScore(2, 1);
    await sleep(1000);

    // Get current score
    console.log('4. Getting current score...');
    const score = await client.getScore();
    console.log('Current score:', score);

    // Send match end
    console.log('5. Sending match end...');
    await client.sendMatchEnd('COMPLETED', 'home', { home: 2, away: 1 });

    console.log('');
    console.log('✅ All events sent successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  const config = {
    matchId: process.env.MATCH_ID || 'test-match-123',
    keyId: process.env.KEY_ID || 'ovl_test-match-123_01',
    secret: process.env.OVERLAY_SECRET || 'your-overlay-secret',
    baseUrl: process.env.OVERLAY_URL || 'https://overlay.flocknode.com'
  };

  const client = new FlockNodeOverlayClient(config);

  switch (command) {
    case 'score':
      const home = parseInt(process.argv[3]) || 0;
      const away = parseInt(process.argv[4]) || 0;
      client.sendScore(home, away).catch(console.error);
      break;

    case 'heartbeat':
      const status = process.argv[3] || 'alive';
      const uptime = parseInt(process.argv[4]) || 0;
      client.sendHeartbeat(status, uptime).catch(console.error);
      break;

    case 'state':
      const state = process.argv[3];
      const message = process.argv[4] || '';
      if (!state) {
        console.error('Usage: node overlay-client.js state <state> [message]');
        process.exit(1);
      }
      client.sendState(state, message).catch(console.error);
      break;

    case 'end':
      const reason = process.argv[3];
      const winner = process.argv[4] || '';
      const homeScore = parseInt(process.argv[5]) || 0;
      const awayScore = parseInt(process.argv[6]) || 0;
      if (!reason) {
        console.error('Usage: node overlay-client.js end <reason> [winner] [home_score] [away_score]');
        process.exit(1);
      }
      client.sendMatchEnd(reason, winner, { home: homeScore, away: awayScore }).catch(console.error);
      break;

    case 'score-get':
      client.getScore().then(console.log).catch(console.error);
      break;

    default:
      main().catch(console.error);
      break;
  }
}

module.exports = FlockNodeOverlayClient;





