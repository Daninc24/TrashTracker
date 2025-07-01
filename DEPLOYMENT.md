# Deployment Guide - Render

## Common Render Deployment Issues & Solutions

### 1. **Build Failures**

**Issue:** Build command fails
**Solution:** 
- Ensure `package.json` has correct `main` field pointing to `src/server.js`
- Check that all dependencies are in `dependencies` (not `devDependencies`)
- Verify Node.js version compatibility (>=18.0.0)

### 2. **Start Command Failures**

**Issue:** Application crashes on start
**Solution:**
- Check that `npm start` script exists and points to correct file
- Ensure all environment variables are set in Render dashboard
- Verify MongoDB connection string is valid
- Check logs in Render dashboard for specific error messages

### 3. **Health Check Failures**

**Issue:** Render can't verify service is healthy
**Solution:**
- Ensure `/api/health` endpoint returns 200 status
- Check that health check path in `render.yaml` matches your endpoint
- Verify the endpoint doesn't require authentication

### 4. **CORS Errors**

**Issue:** Frontend can't connect to backend
**Solution:**
- Update CORS configuration in `backend/src/middleware/security.js`
- Add your frontend URL to `allowedOrigins` array
- For Render: add `https://your-app-name.onrender.com`

### 5. **Environment Variables**

**Issue:** Missing or incorrect environment variables
**Solution:**
- Set all required variables in Render dashboard
- Use production-ready services:
  - MongoDB Atlas for database
  - Redis Cloud for caching
  - Elastic Cloud for search
- Ensure `NODE_ENV=production`

### 6. **Database Connection Issues**

**Issue:** Can't connect to MongoDB
**Solution:**
- Use MongoDB Atlas connection string
- Ensure IP whitelist includes Render's IPs
- Check that username/password are correct
- Verify database name exists

### 7. **Memory/Performance Issues**

**Issue:** Application runs out of memory
**Solution:**
- Upgrade to paid plan for more resources
- Optimize database queries
- Implement proper caching
- Monitor memory usage in Render dashboard

## Render-Specific Configuration

### Environment Variables Checklist

```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rashtrackr
JWT_SECRET=your_very_long_random_secret
SESSION_SECRET=your_session_secret
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@rashtrackr.com
ELASTICSEARCH_URL=your_elasticsearch_url
ELASTICSEARCH_USERNAME=your_es_user
ELASTICSEARCH_PASSWORD=your_es_password
NODE_ENV=production
```

### Health Check Endpoint

Your app should have a health check endpoint at `/api/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2025-07-01T03:34:47.155Z",
  "version": "1.0.0",
  "uptime": 123.456,
  "memory": {...},
  "environment": "production"
}
```

## Troubleshooting Steps

1. **Check Render Logs**
   - Go to your service dashboard
   - Click on "Logs" tab
   - Look for error messages

2. **Test Locally**
   - Set `NODE_ENV=production`
   - Use production environment variables
   - Test with `npm start`

3. **Verify Dependencies**
   - Ensure all required packages are in `dependencies`
   - Remove any unused packages
   - Check for version conflicts

4. **Database Connection**
   - Test MongoDB connection string locally
   - Verify network access and credentials
   - Check if database exists

5. **Environment Variables**
   - Double-check all variables are set in Render
   - Ensure no typos in variable names
   - Verify values are correct

## Support

If issues persist:
1. Check Render documentation: https://render.com/docs
2. Review your application logs
3. Test with minimal configuration
4. Contact Render support if needed 