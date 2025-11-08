# 🔐 Security Quick Reference

## Rate Limits Overview

| Endpoint Type | Window | Max Requests | Response on Exceed |
|--------------|--------|--------------|-------------------|
| **General API** | 15 min | 100 | 429 + "Too many requests from this IP" |
| **Login** | 15 min | 5 | 429 + "Too many login attempts" |
| **Registration** | 1 hour | 3 | 429 + "Too many registration attempts" |
| **Password Reset** | 1 hour | 3 | 429 + "Too many password reset attempts" |
| **File Upload** | 1 hour | 20 | 429 + "Too many upload attempts" |
| **Payments** | 15 min | 10 | 429 + "Too many payment attempts" |
| **Messages** | 1 min | 30 | 429 + "Too many messages sent" |

---

## Security Headers

```
Content-Security-Policy: <configured>
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: no-referrer
Permissions-Policy: geolocation=(self), camera=(), microphone=()
```

---

## IP Blocking Rules

**Auto-Block Triggers**:
- ✅ 10 suspicious activities within 24 hours
- ✅ Failed validations
- ✅ Rate limit violations
- ✅ Injection attempts
- ✅ XSS attempts

**Auto-Unblock**: After 24 hours

**Manual Override**: Admin API available

---

## Input Validation Rules

### Registration
- Name: 2-50 chars
- Email: Valid format
- Password: 8+ chars, uppercase, lowercase, number
- Role: Only 'client' or 'provider'
- Phone: 10-15 digits (optional)

### Jobs
- Title: 3-200 chars
- Description: 10-5000 chars
- Budget: Positive, max 1,000,000

### Messages
- Content: 1-2000 chars
- Receiver ID: Valid MongoDB ObjectId

### Payments
- Amount: Positive, max 1,000,000
- Currency: ISO format (INR, USD, EUR)
- Method: Whitelisted values only

---

## Admin Security API

### Get Blocked IPs
```bash
GET /api/security/blocked-ips
Authorization: Bearer <admin-token>

Response: {
  "success": true,
  "blockedIPs": ["192.168.1.100"],
  "count": 1
}
```

### Get Suspicious IPs
```bash
GET /api/security/suspicious-ips
Authorization: Bearer <admin-token>

Response: {
  "success": true,
  "suspiciousIPs": [
    {"ip": "192.168.1.50", "count": 5, "lastSeen": "2024-01-15T10:30:00Z"}
  ]
}
```

### Block IP
```bash
POST /api/security/block-ip
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "ip": "192.168.1.100"
}

Response: {"success": true, "message": "IP blocked"}
```

### Unblock IP
```bash
POST /api/security/unblock-ip
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "ip": "192.168.1.100"
}

Response: {"success": true, "message": "IP unblocked"}
```

---

## CORS Whitelist

**Allowed Origins**:
- http://localhost:3011 (Production frontend)
- http://localhost:3000 (Development)
- http://localhost:5173 (Vite dev)
- process.env.FRONTEND_URL (Environment)

**Allowed Methods**: GET, POST, PUT, DELETE, PATCH

**Credentials**: Enabled

---

## File Upload Limits

- **Max Size**: 10 MB
- **Temp Files**: Enabled
- **Safe Filenames**: Enabled
- **Preserve Extension**: Enabled

---

## Sanitization Applied

**MongoDB Injection**: All `$` operators replaced with `_`

**XSS Prevention**:
- `<script>` tags removed
- HTML tags stripped
- `javascript:` protocol blocked
- Event handlers removed

**HPP Protection**: Duplicate parameters blocked

---

## Security Log Format

```
🔒 [METHOD] /path | IP: x.x.x.x | User-Agent: ...
🚫 Blocked IP attempted access: x.x.x.x
⚠️ Suspicious request detected: IP x.x.x.x | Reason: ...
⚠️ Sanitized [field] in /path
```

---

## Quick Test Commands

### Test Rate Limit
```bash
for i in {1..6}; do 
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

### Check Security Headers
```bash
curl -I http://localhost:5000/api/health
```

### Test XSS Protection
```bash
curl -X POST http://localhost:5000/api/jobs/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"<script>alert(1)</script>Job","description":"Test","budget":100}'
```

### Test IP Blocking
```bash
for i in {1..11}; do 
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"invalid","password":"x"}'
done
```

---

## Emergency Response

### If Under Attack:

1. **Check Logs**:
   ```bash
   tail -f backend/logs/security.log
   ```

2. **Block Attacker**:
   ```bash
   curl -X POST http://localhost:5000/api/security/block-ip \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -d '{"ip":"ATTACKER_IP"}'
   ```

3. **Review Suspicious Activity**:
   ```bash
   curl http://localhost:5000/api/security/suspicious-ips \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

4. **Tighten Rate Limits** (if needed):
   - Edit `backend/middleware/security.middleware.js`
   - Reduce `max` values
   - Restart: `npm start`

---

## Protection Checklist

- ✅ DDoS Protection (Rate limiting)
- ✅ Brute Force Protection (Auth limits)
- ✅ XSS Protection (Input sanitization)
- ✅ SQL/NoSQL Injection (Sanitization)
- ✅ CSRF Mitigation (SameSite + CORS)
- ✅ Click-jacking (X-Frame-Options)
- ✅ MIME Sniffing (X-Content-Type-Options)
- ✅ Parameter Pollution (HPP middleware)
- ✅ IP-based Blocking (Auto + Manual)
- ✅ Security Logging (All actions tracked)

---

## Key Files

```
backend/
├── middleware/security.middleware.js   # All security logic (485 lines)
├── routes/security.routes.js           # Admin IP management
├── server.js                           # Security middleware stack
├── routes/auth.routes.js               # Protected auth endpoints
├── routes/message.routes.js            # Protected messaging
└── routes/payment.routes.js            # Protected payments
```

---

## Status Codes

- **200**: Success
- **400**: Bad Request (validation failed)
- **401**: Unauthorized (auth failed)
- **403**: Forbidden (IP blocked / not admin)
- **404**: Not Found
- **413**: Payload Too Large (file upload)
- **429**: Too Many Requests (rate limited)
- **500**: Server Error

---

## Environment Variables

```env
FRONTEND_URL=http://localhost:3011
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/connecto
JWT_SECRET=your-secret-key
```

---

## Production Deployment Checklist

- [ ] Set `FRONTEND_URL` to production domain
- [ ] Enable HTTPS (required for HSTS)
- [ ] Configure production CORS origins
- [ ] Set up log rotation
- [ ] Configure log aggregation
- [ ] Set up monitoring alerts
- [ ] Test all security features in staging
- [ ] Review and adjust rate limits
- [ ] Document incident response process
- [ ] Train team on admin security API

---

## Support

**Documentation**:
- SECURITY_IMPLEMENTATION.md - Complete guide
- SECURITY_TESTING_GUIDE.md - Test procedures

**Contact**: For security issues, email admin@connecto.com

---

**Last Updated**: January 2024
**Version**: 1.0.0
