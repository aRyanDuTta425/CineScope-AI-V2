# Google Cloud Run Deployment Guide for CineScope AI

## Prerequisites

1. **Google Cloud CLI**: Install and authenticate
   ```bash
   # Install gcloud CLI (if not already installed)
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   
   # Authenticate with Google Cloud
   gcloud auth login
   gcloud auth configure-docker
   ```

2. **Create a Google Cloud Project** (if you don't have one)
   ```bash
   gcloud projects create your-project-id --name="CineScope AI"
   gcloud config set project your-project-id
   ```

## Environment Variables Setup

Before deploying, you'll need to set up your environment variables securely in Cloud Run:

```bash
# Replace 'cinescope-ai' with your service name and set your actual values
gcloud run services update cinescope-ai \
  --set-env-vars "MONGODB_URI=your-mongodb-atlas-connection-string" \
  --set-env-vars "GEMINI_API_KEY=your-gemini-api-key" \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "PORT=8080" \
  --region us-central1
```

## Deployment Options

### Option 1: Automated Deployment (Recommended)

1. **Update the deployment script**:
   ```bash
   # Edit deploy.sh and replace 'your-gcp-project-id' with your actual project ID
   nano deploy.sh
   ```

2. **Make it executable and run**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Option 2: Manual Step-by-Step Deployment

1. **Set your project**:
   ```bash
   gcloud config set project your-gcp-project-id
   ```

2. **Enable required APIs**:
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

3. **Build and push the image**:
   ```bash
   gcloud builds submit --tag gcr.io/your-gcp-project-id/cinescope-ai .
   ```

4. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy cinescope-ai \
     --image gcr.io/your-gcp-project-id/cinescope-ai \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8080 \
     --memory 1Gi \
     --cpu 1 \
     --min-instances 0 \
     --max-instances 10 \
     --timeout 300
   ```

5. **Set environment variables** (as shown above)

## Local Testing with Docker

Before deploying, test your container locally:

1. **Build the Docker image**:
   ```bash
   docker build -t cinescope-ai .
   ```

2. **Run locally** (create a `.env.local` file for testing):
   ```bash
   docker run -p 8080:8080 --env-file .env.local cinescope-ai
   ```

3. **Test the application**:
   - Frontend: http://localhost:8080
   - API: http://localhost:8080/api/health (if you have a health endpoint)

## Important Notes

### Server Configuration
Make sure your Express server in `server/server.js` includes:

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', yourApiRoutes);

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Use Cloud Run's PORT environment variable
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Health Check Endpoint (Recommended)
Add a health check endpoint for better monitoring:

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});
```

## Monitoring and Logs

- **View logs**: `gcloud run services logs read cinescope-ai --region us-central1`
- **Monitor metrics**: Go to Google Cloud Console > Cloud Run > your-service
- **Custom domain**: Configure in Cloud Run console under "Manage Custom Domains"

## Troubleshooting

1. **Build fails**: Check your `package.json` files and dependencies
2. **Container crashes**: Check logs with `gcloud run services logs read`
3. **Environment variables**: Verify they're set correctly in Cloud Run console
4. **MongoDB connection**: Ensure your MongoDB Atlas cluster allows connections from `0.0.0.0/0` or add Cloud Run IPs to whitelist

## Cost Optimization

- **Set minimum instances to 0** for cost savings (cold starts acceptable)
- **Adjust memory/CPU** based on actual usage
- **Use regional deployment** instead of global for lower costs
- **Monitor usage** in Google Cloud Console billing section
