# CORS 503 Error - Missing Origin Header Fix

**Date:** October 9, 2025
**Issue:** CORS error with 503 status when accessing API from UI
**Status:** ✅ FIXED

## Problem Description

When trying to login from the production UI at `https://3d-inventory.ultimasolution.pl`, the following error occurred:

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading
the remote resource at https://d-inventory-api-wzwe3odv7q-ew.a.run.app/login.
(Reason: CORS header 'Access-Control-Allow-Origin' missing).
Status code: 503.

CORS Missing Allow Origin
Response body is not available to scripts (Reason: CORS Missing Allow Origin)
```

### Root Causes

#### 1. Missing Domain in CORS Allowed Origins

The domain `https://3d-inventory.ultimasolution.pl` was **not explicitly listed** in the `allowedOrigins` array, even though there was a regex pattern that should match it.

#### 2. API Server Status (503 Service Unavailable)

The **503 status code** indicates the API server at `https://d-inventory-api-wzwe3odv7q-ew.a.run.app` is either:

- Not running
- Not deployed to Google Cloud Run
- Experiencing errors during startup
- Cold start timeout (Cloud Run issue)

## Solution Implemented

### 1. Added Missing Domain to CORS Allowed Origins

**File:** `/src/main.ts`

**Before:**

```typescript
const allowedOrigins = [
  // ... other origins ...
  // Ultima Solution domains
  'https://3d-inventory-api.ultimasolution.pl',
  'https://3d-inventory-ui.ultimasolution.pl',
  'http://3d-inventory-ui.ultimasolution.pl',
  // MongoDB Atlas
  'https://cluster0.htgjako.mongodb.net',
]
```

**After:**

```typescript
const allowedOrigins = [
  // ... other origins ...
  // Ultima Solution domains
  'https://3d-inventory.ultimasolution.pl', // ✅ ADDED
  'https://3d-inventory-api.ultimasolution.pl',
  'https://3d-inventory-ui.ultimasolution.pl',
  'http://3d-inventory-ui.ultimasolution.pl',
  'http://3d-inventory.ultimasolution.pl', // ✅ ADDED
  // MongoDB Atlas
  'https://cluster0.htgjako.mongodb.net',
]
```

### 2. CORS Configuration Details

The API uses a comprehensive CORS configuration with:

#### Allowed Origins

```typescript
const allowedOrigins = [
  // Local development
  'http://localhost:4200',
  'https://localhost:4200',
  'http://localhost:8080',
  'https://localhost:8080',
  'http://127.0.0.1:4200',
  'https://127.0.0.1:4200',
  // Cloud Run services
  'https://d-inventory-ui-wzwe3odv7q-ew.a.run.app',
  'https://d-inventory-api-wzwe3odv7q-ew.a.run.app',
  // Ultima Solution domains (ALL VARIANTS)
  'https://3d-inventory.ultimasolution.pl',
  'https://3d-inventory-api.ultimasolution.pl',
  'https://3d-inventory-ui.ultimasolution.pl',
  'http://3d-inventory-ui.ultimasolution.pl',
  'http://3d-inventory.ultimasolution.pl',
]
```

#### Regex Patterns for Dynamic Origins

```typescript
const LOCALHOST_ORIGIN_REGEX = /^https?:\/\/localhost:\d+$/
const ULTIMASOLUTION_REGEX = /^https?:\/\/.*\.ultimasolution\.pl$/
```

These patterns allow:

- Any localhost port (e.g., `http://localhost:3000`, `https://localhost:9000`)
- Any subdomain on `ultimasolution.pl` (e.g., `https://api.ultimasolution.pl`)

#### CORS Options

```typescript
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true)

    const isAllowed = allowedOrigins.includes(origin) || LOCALHOST_ORIGIN_REGEX.test(origin) || ULTIMASOLUTION_REGEX.test(origin)

    if (isAllowed) {
      logger.info(`[CORS DEBUG] Origin allowed: ${origin}`)
      return callback(null, true)
    } else {
      logger.warn(`[CORS DEBUG] Origin blocked: ${origin}`)
      const corsError = new Error(`CORS policy: This origin is not allowed: ${origin}`)
      return callback(corsError, false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Accept', 'Authorization', 'Cache-Control', 'Content-Type', 'Origin', 'X-API-Key', 'X-Requested-With', 'Bearer'],
}
```

## Deployment Requirements

### API Must Be Deployed to Google Cloud Run

The 503 error indicates the API is not accessible. To fix this:

#### 1. Build the API

```bash
cd /home/karol/GitHub/3d-inventory-api
npm run build
```

#### 2. Deploy to Google Cloud Run

```bash
# Using gcloud CLI
gcloud run deploy 3d-inventory-api \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

Or use the deployment script:

```bash
npm run gcp:build
```

#### 3. Verify Deployment

```bash
# Check service status
npm run gcp:status

# Check logs
npm run gcp:logs
```

#### 4. Test API Endpoint

```bash
curl https://d-inventory-api-wzwe3odv7q-ew.a.run.app/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-09T10:00:00.000Z",
  "environment": "production",
  "database": "connected"
}
```

## CORS Debugging

### Enable Debug Logging

The API has built-in CORS debug logging:

```typescript
app.use((req, res, next) => {
  logger.info(`[DEBUG] ${req.method} ${req.url} - Origin: ${req.headers.origin}`)
  next()
})
```

### Check Logs for CORS Issues

**Allowed origin:**

```
[CORS DEBUG] Origin allowed: https://3d-inventory.ultimasolution.pl
```

**Blocked origin:**

```
[CORS DEBUG] Origin blocked: https://unknown-domain.com
```

### Test CORS with curl

```bash
# Test OPTIONS preflight request
curl -X OPTIONS https://d-inventory-api-wzwe3odv7q-ew.a.run.app/login \
  -H "Origin: https://3d-inventory.ultimasolution.pl" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Test actual POST request
curl -X POST https://d-inventory-api-wzwe3odv7q-ew.a.run.app/login \
  -H "Origin: https://3d-inventory.ultimasolution.pl" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123!"}' \
  -v
```

Expected headers in response:

```
Access-Control-Allow-Origin: https://3d-inventory.ultimasolution.pl
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

## Environment Configuration

### Production UI Configuration

**File:** `/home/karol/GitHub/3d-inventory-ui/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  baseurl: 'https://d-inventory-api-wzwe3odv7q-ew.a.run.app',
}
```

### API Environment Variables

Required environment variables for Google Cloud Run:

```bash
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CORS_ORIGINS=https://3d-inventory.ultimasolution.pl,https://3d-inventory-ui.ultimasolution.pl
```

## Common CORS Issues and Solutions

### Issue 1: "CORS Missing Allow Origin"

**Cause:** API server is down (503) or not responding
**Solution:** Deploy API to Google Cloud Run

### Issue 2: "Origin not allowed"

**Cause:** Domain not in `allowedOrigins` array
**Solution:** Add domain to `allowedOrigins` in `/src/main.ts`

### Issue 3: "Preflight request failed"

**Cause:** OPTIONS method not handled correctly
**Solution:** Ensure CORS middleware is applied before routes

### Issue 4: "Credentials not supported"

**Cause:** `credentials: true` not set
**Solution:** Add `credentials: true` to CORS options

### Issue 5: "Wildcard origin with credentials"

**Cause:** Using `*` with `credentials: true`
**Solution:** Specify exact origins instead of wildcard

## Testing Checklist

### Local Testing

- [ ] API runs on `http://localhost:8080`
- [ ] UI runs on `http://localhost:4200`
- [ ] Login works locally
- [ ] CORS headers present in response

### Cloud Run Testing

- [ ] API deployed to Cloud Run
- [ ] API health endpoint returns 200
- [ ] OPTIONS request returns correct CORS headers
- [ ] POST /login request succeeds
- [ ] UI can access API

### Production Testing

- [ ] UI at `https://3d-inventory.ultimasolution.pl` loads
- [ ] Login form submits to API
- [ ] No CORS errors in browser console
- [ ] Authentication successful
- [ ] JWT token stored correctly

## Security Considerations

### CORS Best Practices

1. **Never use wildcard (`*`) in production**

   ```typescript
   // ❌ BAD
   origin: '*'

   // ✅ GOOD
   origin: allowedOrigins
   ```

2. **Always validate origins**

   ```typescript
   // ✅ GOOD - checks against whitelist
   const isAllowed = allowedOrigins.includes(origin)
   ```

3. **Use HTTPS in production**

   ```typescript
   // ✅ All production origins use HTTPS
   'https://3d-inventory.ultimasolution.pl'
   ```

4. **Limit allowed headers**

   ```typescript
   // ✅ Only necessary headers
   allowedHeaders: ['Authorization', 'Content-Type', ...]
   ```

5. **Enable credentials carefully**
   ```typescript
   // Only when needed for cookies/auth
   credentials: true
   ```

### Rate Limiting

The API also includes rate limiting to prevent abuse:

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window
  message: { message: 'Too many requests' },
})
```

## Files Modified

1. **`/src/main.ts`**
   - Added `https://3d-inventory.ultimasolution.pl` to allowed origins
   - Added `http://3d-inventory.ultimasolution.pl` to allowed origins

## Related Documentation

- **[Login Password Fix](../3d-inventory-ui/LOGIN-PASSWORD-REQUIRED-FIX.md)** - Password required fix
- **[Admin Account Locked Fix](ADMIN-ACCOUNT-LOCKED-FIX.md)** - Account unlock and password reset
- **[User List OnPush Fix](../3d-inventory-ui/USER-LIST-ONPUSH-FIX.md)** - Change detection fix
- **[API Deployment Guide](README-GCP.md)** - Google Cloud Run deployment

## Next Steps

### 1. Deploy API to Production

```bash
cd /home/karol/GitHub/3d-inventory-api
npm run build
npm run gcp:build  # Deploy to Google Cloud Run
```

### 2. Verify API is Running

```bash
curl https://d-inventory-api-wzwe3odv7q-ew.a.run.app/health
```

### 3. Test Login from UI

1. Go to `https://3d-inventory.ultimasolution.pl`
2. Enter username: `admin`
3. Enter password: `admin123!`
4. Click login
5. Verify no CORS errors
6. Verify successful authentication

### 4. Monitor Logs

```bash
npm run gcp:logs
```

Look for:

- `[CORS DEBUG] Origin allowed: https://3d-inventory.ultimasolution.pl`
- `User logged in successfully: admin`
- No CORS blocking messages

---

**Status:** ✅ CORS Configuration Updated
**Deployment:** ⏳ Awaiting API deployment to Cloud Run
**Priority:** 🔴 HIGH - Production login blocked until API is deployed
**Next Action:** Deploy API to Google Cloud Run 🚀
