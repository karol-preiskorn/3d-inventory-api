# GitHub Secrets Setup for GCP Deployment

## Overview

This guide explains how to set up the required GitHub secrets for the GCP deployment workflow.

## Required Secrets

The `deploy-gcp.yml` workflow requires the following GitHub secrets:

### 1. GCP_SA_KEY (Required)

**Description**: JSON service account key for Google Cloud authentication

**How to create:**

```bash
# 1. Create a service account in GCP
gcloud iam service-accounts create github-actions-deployer \
  --display-name="GitHub Actions Deployer" \
  --project=d-inventory-406007

# 2. Grant necessary permissions
gcloud projects add-iam-policy-binding d-inventory-406007 \
  --member="serviceAccount:github-actions-deployer@d-inventory-406007.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding d-inventory-406007 \
  --member="serviceAccount:github-actions-deployer@d-inventory-406007.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding d-inventory-406007 \
  --member="serviceAccount:github-actions-deployer@d-inventory-406007.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

# 3. Create and download the JSON key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions-deployer@d-inventory-406007.iam.gserviceaccount.com

# 4. Copy the entire contents of key.json
cat key.json
```

**Add to GitHub:**

1. Go to your repository settings
2. Navigate to **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `GCP_SA_KEY`
5. Value: Paste the **entire JSON content** from `key.json`
6. Click **Add secret**

**⚠️ Security Note:** Delete the local `key.json` file after adding to GitHub:

```bash
rm key.json
```

### 2. GCP_PROJECT_ID (Required)

**Description**: Your Google Cloud project ID

**How to find:**

```bash
gcloud config get-value project
```

**Add to GitHub:**

1. Go to repository settings → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `GCP_PROJECT_ID`
4. Value: Your project ID (e.g., `my-project-12345`)
5. Click **Add secret**

### 3. Cloud Run Application Secrets

These secrets are injected into the Cloud Run service at runtime:

#### ATLAS_URI (Required)

**Description**: MongoDB Atlas connection string

**Format:**

```
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

**Add to GCP Secret Manager:**

```bash
# Create secret in GCP Secret Manager
echo -n "mongodb+srv://user:50731BTLjF2wTKMA@cluster.mongodb.net/" | \
  gcloud secrets create atlas-uri \
  --data-file=- \
  --project=d-inventory-406007

# Grant Cloud Run service account access
gcloud secrets add-iam-policy-binding atlas-uri \
  --member="serviceAccount:github-actions-deployer@d-inventory-406007.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=d-inventory-406007
```

#### DBNAME (Required)

**Description**: MongoDB database name

**Add to GCP Secret Manager:**

```bash
echo -n "3d-inventory" | \
  gcloud secrets create dbname \
  --data-file=- \
  --project=d-inventory-406007

gcloud secrets add-iam-policy-binding dbname \
  --member="serviceAccount:github-actions-deployer@d-inventory-406007.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=d-inventory-406007

```

#### JWT_SECRET (Required)

**Description**: Secret key for JWT token signing

**Generate secure random secret:**

```bash
# Generate a secure random string
openssl rand -base64 32

# Create secret in GCP
echo -n "YOUR_GENERATED_SECRET" | \
  gcloud secrets create jwt-secret \
  --data-file=- \
  --project=d-inventory-406007

gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:github-actions-deployer@d-inventory-406007.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=d-inventory-406007
```

## Verification

### Verify GitHub Secrets

```bash
# GitHub CLI (if installed)
gh secret list

# Or check in GitHub UI:
# https://github.com/YOUR_USERNAME/3d-inventory-api/settings/secrets/actions
```

You should see:

- ✅ GCP_SA_KEY
- ✅ GCP_PROJECT_ID

### Verify GCP Secrets

```bash
# List all secrets
gcloud secrets list --project=d-inventory-406007

# Verify specific secrets exist
gcloud secrets describe atlas-uri --project=d-inventory-406007
gcloud secrets describe dbname --project=d-inventory-406007
gcloud secrets describe jwt-secret --project=d-inventory-406007

# Verify IAM permissions
gcloud secrets get-iam-policy atlas-uri --project=d-inventory-406007
```

## Troubleshooting

### Error: "the GitHub Action workflow must specify exactly one of workload_identity_provider or credentials_json"

**Solution:** Ensure `GCP_SA_KEY` secret is set in GitHub and contains valid JSON.

**Verify:**

```bash
# Check if secret exists
gh secret list | grep GCP_SA_KEY

# Test JSON validity locally (don't commit key.json!)
cat key.json | jq .
```

### Error: "Permission denied" during deployment

**Solution:** Ensure service account has required roles:

```bash
# Check current roles
gcloud projects get-iam-policy d-inventory-406007 \
  --flatten="bindings[].members" \
  --filter="bindings.members:github-actions-deployer@d-inventory-406007.iam.gserviceaccount.com"

# Add missing roles
gcloud projects add-iam-policy-binding d-inventory-406007 \
  --member="serviceAccount:github-actions-deployer@d-inventory-406007.iam.gserviceaccount.com" \
  --role="roles/run.admin"
```

### Error: "Secret not found" in Cloud Run

**Solution:** Ensure secrets exist in Secret Manager and have proper IAM:

```bash
# Create missing secret
echo -n "SECRET_VALUE" | \
  gcloud secrets create SECRET_NAME \
  --data-file=- \
  --project=YOUR_PROJECT_ID

# Grant access to Cloud Run
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=YOUR_PROJECT_ID
```

## Alternative: Workload Identity Federation (Advanced)

For enhanced security without managing JSON keys, you can use Workload Identity Federation:

### Setup WIF

```bash
# 1. Create Workload Identity Pool
gcloud iam workload-identity-pools create github \
  --location="global" \
  --display-name="GitHub Actions Pool"

# 2. Create Workload Identity Provider
gcloud iam workload-identity-pools providers create-oidc github \
  --location="global" \
  --workload-identity-pool="github" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-condition="assertion.repository_owner=='karol-preiskorn'"

# 3. Create Service Account
gcloud iam service-accounts create github-actions-wif \
  --display-name="GitHub Actions WIF"

# 4. Grant roles
gcloud projects add-iam-policy-binding d-inventory-406007 \
  --member="serviceAccount:github-actions-wif@d-inventory-406007.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding d-inventory-406007 \
  --member="serviceAccount:github-actions-wif@d-inventory-406007.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding d-inventory-406007 \
  --member="serviceAccount:github-actions-wif@d-inventory-406007.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

# 5. Allow GitHub to impersonate service account
gcloud iam service-accounts add-iam-policy-binding github-actions-wif@d-inventory-406007.iam.gserviceaccount.com \
  --member="principalSet://iam.googleapis.com/projects/82629838360/locations/global/workloadIdentityPools/github/attribute.repository/karol-preiskorn/3d-inventory-api" \
  --role="roles/iam.workloadIdentityUser"
```

### Update GitHub Secrets for WIF

Instead of `GCP_SA_KEY`, add:

1. **WIF_PROVIDER**

   ```
   projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github/providers/github
   ```

2. **WIF_SERVICE_ACCOUNT**
   ```
   github-actions-wif@d-inventory-406007.iam.gserviceaccount.com
   ```

### Update Workflow

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
    service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}
```

## Security Best Practices

1. **Rotate Keys Regularly**

   ```bash
   # Create new key
   gcloud iam service-accounts keys create new-key.json \
     --iam-account=github-actions-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com

   # Update GitHub secret
   # Delete old key after verification
   gcloud iam service-accounts keys delete OLD_KEY_ID \
     --iam-account=github-actions-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

2. **Use Least Privilege**
   - Only grant necessary roles
   - Use custom roles if needed for fine-grained control

3. **Monitor Access**

   ```bash
   # View service account activity
   gcloud logging read "protoPayload.authenticationInfo.principalEmail=github-actions-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --limit 50 \
     --format json
   ```

4. **Enable Secret Versioning**
   ```bash
   # Secrets are versioned automatically
   # List versions
   gcloud secrets versions list atlas-uri --project=YOUR_PROJECT_ID
   ```

## Quick Setup Script

```bash
#!/bin/bash
set -e

PROJECT_ID="YOUR_PROJECT_ID"
SA_NAME="github-actions-deployer"

echo "Creating service account..."
gcloud iam service-accounts create $SA_NAME \
  --display-name="GitHub Actions Deployer" \
  --project=$PROJECT_ID

echo "Granting permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

echo "Creating key..."
gcloud iam service-accounts keys create key.json \
  --iam-account=$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com

echo "✅ Service account created!"
echo "📋 Add the contents of key.json to GitHub secret GCP_SA_KEY"
echo "⚠️  Remember to delete key.json after adding to GitHub!"
```

## References

- [Google Cloud IAM Documentation](https://cloud.google.com/iam/docs)
- [Cloud Run Authentication](https://cloud.google.com/run/docs/authenticating/overview)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)

---

**Last Updated**: November 14, 2025
**Status**: ✅ Production Ready
