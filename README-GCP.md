# Google Cloud Deployment Guide

This guide explains how to deploy your 3D Inventory API to Google Cloud Platform.

## Quick Start

### Prerequisites

1. **Google Cloud Account**: Sign up at <https://cloud.google.com>
2. **Google Cloud CLI**: Install from <https://cloud.google.com/sdk/docs/install>
3. **Project Setup**: Create or select a Google Cloud project

### Step 1: Authentication and Project Setup

```bash
# Login to Google Cloud
gcloud auth login

# Set your project (replace with your actual project ID)
gcloud config set project your-project-id

# Or export as environment variable
export GOOGLE_CLOUD_PROJECT=your-project-id
```

### Step 2: Deploy to Cloud Run (Recommended)

```bash
# Deploy using the deployment script
./deploy.sh

# Or using npm script
npm run gcp:deploy
```

### Step 3: Access Your API

After deployment, your API will be available at:

- Your API URL will look like: `https://3d-inventory-api-<region>-<hash>.run.app`
  Replace `<region>` and `<hash>` with the values shown after deployment.
- Health check: `https://3d-inventory-api-<region>-<hash>.run.app/health`

## Deployment Options

### Option 1: Cloud Run (Recommended)

Cloud Run is serverless and scales automatically:

```bash
# Simple deployment
gcloud run deploy 3d-inventory-api \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --port 8080

# With environment variables
gcloud run deploy 3d-inventory-api \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars "NODE_ENV=production,PORT=8080,ATLAS_URI=your-connection-string"
    --set-env-vars "NODE_ENV=production,PORT=8080"
```

### Option 2: App Engine

App Engine provides a fully managed platform:

```bash
# Deploy to App Engine
gcloud app deploy app.yaml

# View your application
gcloud app browse
```

### Option 3: Using Docker and Cloud Run

```bash
# Build and push to Container Registry
# Replace 'your-project-id' with your actual Google Cloud project ID in the
# commands below.
docker build -t gcr.io/your-project-id/3d-inventory-api .
docker push gcr.io/your-project-id/3d-inventory-api

# Deploy to Cloud Run
gcloud run deploy 3d-inventory-api \
    --image gcr.io/your-project-id/3d-inventory-api \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
```

## Environment Variables

For production deployment, set these environment variables:

### Required

- `NODE_ENV=production`
- `PORT=8080`
- `HOST=0.0.0.0`

### Database (MongoDB Atlas recommended)

- `DBNAME`: Database name (default: inventory)
- `DBNAME`: Database name (default: 3d-inventory)

### Optional

- `API_YAML_FILE=api.yaml`
- `CORS_ORIGINS`: Comma-separated list of allowed origins
- `COOKIE_EXPIRESIN=24h`

## Setting Environment Variables

### Cloud Run

```bash
gcloud run services update 3d-inventory-api \
    --set-env-vars "ATLAS_URI=your-connection-string,DBNAME=3d-inventory"
```

### App Engine

Update the `env_variables` section in `app.yaml`:

```yaml
env_variables:
  ATLAS_URI: 'your-connection-string'
  DBNAME: '3d-inventory'
```

## Database Setup (MongoDB Atlas)

1. Create MongoDB Atlas account at <https://cloud.mongodb.com>
2. Create a cluster
3. Create a database user
4. Get connection string
5. Set as environment variable:

```bash
gcloud run services update 3d-inventory-api \
    --set-env-vars "ATLAS_URI=mongodb+srv://user:pass@cluster.mongodb.net/3d-inventory"
```

## Monitoring and Logs

### View Logs

```bash
# Using npm script
npm run gcp:logs

gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=3d-inventory-api" \
  --limit=50
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=3d-inventory-api" --limit=50
```

### Check Status

```bash
# Using npm script
npm run gcp:status

# Or directly with gcloud
gcloud run services describe 3d-inventory-api --region=us-central1
```

### Monitoring Dashboard

Visit <https://console.cloud.google.com/run> to see:

- Request metrics
- Error rates
- Response times
- Resource usage

## Custom Domain (Optional)

To use a custom domain:

1. **Verify domain ownership**:

   ```bash
   gcloud domains verify your-domain.com
   ```

2. **Map domain to service**:

   ```bash
   gcloud run domain-mappings create \
       --service 3d-inventory-api \
       --domain api.your-domain.com \
       --region us-central1
   ```

3. **Update DNS records** as instructed by Google Cloud

## Security Considerations

### Authentication

For production, consider adding authentication:

```bash
# Remove public access
gcloud run services remove-iam-policy-binding 3d-inventory-api \
    --member="allUsers" \
    --role="roles/run.invoker"

# Add specific users
gcloud run services add-iam-policy-binding 3d-inventory-api \
    --member="user:email@example.com" \
    --role="roles/run.invoker"
```

### HTTPS

### Secret Management

Use Google Secret Manager for sensitive data:

### Environment Variables

Use Google Secret Manager for sensitive data:

```bash
# Create secret
echo -n "your-secret-value" | gcloud secrets create my-secret --data-file=-

# Use in Cloud Run
gcloud run services update 3d-inventory-api \
    --set-secrets="ATLAS_URI=my-secret:latest"
```

> **Note:** Using `--set-secrets` makes the secret available as an environment variable.
> Ensure your application reads the secret from the environment variable (e.g., `process.env.ATLAS_URI`).
> See [Using secrets with Cloud Run](https://cloud.google.com/run/docs/configuring/secrets)
> for more details.

## Troubleshooting

### Common Issues

1. **Build failures**: Check build logs and ensure all dependencies are in package.json
2. **Port issues**: Ensure your app listens on `process.env.PORT || 8080`

   ```js
   // Example for Express.js
   const PORT = process.env.PORT || 8080
   app.listen(PORT, () => {
     console.log(`Server listening on port ${PORT}`)
   })
   ```

## Local Testing

Ensure your application is configured to read the NODE_ENV and PORT environment variables

NODE_ENV=production PORT=8080 npm start

# Ensure your application is configured to read the NODE_ENV and PORT environment variables.

NODE_ENV=production PORT=8080 npm start

```bash
# Check service status

gcloud run services describe 3d-inventory-api --region=us-central1

# View recent logs

gcloud logging read "resource.type=cloud_run_revision" --limit=100

# Test locally with environment

NODE_ENV=production PORT=8080 npm start
```

## Cost Optimization

### Cloud Run Pricing

- Pay only for requests and compute time
- First 2 million requests per month are free
- Scales to zero when not in use

### Cost-saving tips

1. Set appropriate CPU and memory limits
2. Use appropriate concurrency settings
3. Monitor usage in Cloud Console
4. Consider App Engine for consistent traffic

## Scaling

Cloud Run automatically scales based on incoming requests:

```bash
# Set scaling limits
gcloud run services update 3d-inventory-api \
    --min-instances 0 \
    --max-instances 10 \
    --concurrency 80
```

## Updates and Rollbacks

### Deploy Updates

Simply run the deployment command again:

```bash
./deploy.sh
```

### Rollback

```bash
# List revisions
gcloud run revisions list --service=3d-inventory-api

# Rollback to specific revision
gcloud run services update-traffic 3d-inventory-api \
    --to-revisions=3d-inventory-api-00001-abc=100
```

## Support

For issues:

1. Check Google Cloud Status: <https://status.cloud.google.com>
2. Google Cloud Documentation: <https://cloud.google.com/run/docs>
3. Stack Overflow: Tag questions with `google-cloud-run`
