# Setting up GCP Workload Identity Federation for GitHub Actions

This guide shows you how to configure Workload Identity Federation (WIF) for secure GitHub Actions authentication with Google Cloud Platform.

## 📋 Prerequisites

- GCP Project with billing enabled
- GitHub repository
- `gcloud` CLI installed and authenticated
- `gh` (GitHub CLI) installed

---

## 🔧 Step 1: Set Up Workload Identity Federation in GCP

### 1.1 Set Environment Variables

```bash
export PROJECT_ID="your-gcp-project-id"
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
export REPO_OWNER="karol-preiskorn"
export REPO_NAME="3d-inventory-api"
export SERVICE_ACCOUNT_NAME="github-actions"
export POOL_NAME="github-pool"
export PROVIDER_NAME="github-provider"
```

### 1.2 Enable Required APIs

```bash
gcloud services enable \
  iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com \
  sts.googleapis.com \
  --project=$PROJECT_ID
```

### 1.3 Create Service Account

```bash
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
  --display-name="GitHub Actions Service Account" \
  --description="Service account for GitHub Actions deployments" \
  --project=$PROJECT_ID
```

### 1.4 Grant Required Permissions

```bash
# Cloud Run Admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Artifact Registry Writer
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Service Account User (for Cloud Run)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Secret Manager Secret Accessor
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 1.5 Create Workload Identity Pool

```bash
gcloud iam workload-identity-pools create $POOL_NAME \
  --location="global" \
  --display-name="GitHub Actions Pool" \
  --description="Workload Identity Pool for GitHub Actions" \
  --project=$PROJECT_ID
```

### 1.6 Create Workload Identity Provider

```bash
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
  --location="global" \
  --workload-identity-pool=$POOL_NAME \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-condition="assertion.repository_owner == '${REPO_OWNER}'" \
  --project=$PROJECT_ID
```

### 1.7 Bind Service Account to Workload Identity

```bash
gcloud iam service-accounts add-iam-policy-binding \
  ${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/${REPO_OWNER}/${REPO_NAME}" \
  --project=$PROJECT_ID
```

---

## 🔑 Step 2: Get the Required Values

### 2.1 Get WIF_PROVIDER

```bash
echo "WIF_PROVIDER:"
echo "projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"
```

**Copy this value** - you'll need it for GitHub secrets.

### 2.2 Get WIF_SERVICE_ACCOUNT

```bash
echo "WIF_SERVICE_ACCOUNT:"
echo "${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
```

**Copy this value** - you'll need it for GitHub secrets.

### 2.3 Get GCP_PROJECT_ID

```bash
echo "GCP_PROJECT_ID:"
echo "$PROJECT_ID"
```

---

## 🎯 Step 3: Add Secrets to GitHub

### Option A: Using GitHub CLI (Recommended)

```bash
# Make the script executable
chmod +x setup-github-secrets.sh

# Run the interactive script
./setup-github-secrets.sh
```

### Option B: Manual GitHub CLI Commands

```bash
# Set GCP_PROJECT_ID
gh secret set GCP_PROJECT_ID \
  --body "your-project-id" \
  --repo karol-preiskorn/3d-inventory-api

# Set WIF_PROVIDER
gh secret set WIF_PROVIDER \
  --body "projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github-provider" \
  --repo karol-preiskorn/3d-inventory-api

# Set WIF_SERVICE_ACCOUNT
gh secret set WIF_SERVICE_ACCOUNT \
  --body "github-actions@your-project-id.iam.gserviceaccount.com" \
  --repo karol-preiskorn/3d-inventory-api
```

### Option C: Using GitHub Web UI

1. Go to: `https://github.com/karol-preiskorn/3d-inventory-api/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add each secret:
   - Name: `GCP_PROJECT_ID`, Value: `your-project-id`
   - Name: `WIF_PROVIDER`, Value: `projects/.../providers/...`
   - Name: `WIF_SERVICE_ACCOUNT`, Value: `github-actions@....iam.gserviceaccount.com`

---

## 🧪 Step 4: Verify Setup

### 4.1 List GitHub Secrets

```bash
gh secret list --repo karol-preiskorn/3d-inventory-api
```

Expected output:

```
GCP_PROJECT_ID       Updated 2024-XX-XX
WIF_PROVIDER         Updated 2024-XX-XX
WIF_SERVICE_ACCOUNT  Updated 2024-XX-XX
```

### 4.2 Test Workload Identity Federation

Create a test workflow file `.github/workflows/test-auth.yml`:

```yaml
name: Test GCP Authentication
on: workflow_dispatch

jobs:
  test:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Test gcloud access
        run: |
          gcloud config list
          gcloud projects describe ${{ secrets.GCP_PROJECT_ID }}
```

Run the workflow manually from GitHub Actions tab to verify authentication works.

---

## 📊 Complete Setup Script

For a fully automated setup, use this comprehensive script:

```bash
#!/bin/bash
# complete-gcp-setup.sh

set -e

# Configuration
export PROJECT_ID="your-gcp-project-id"
export REPO_OWNER="karol-preiskorn"
export REPO_NAME="3d-inventory-api"
export SERVICE_ACCOUNT_NAME="github-actions"
export POOL_NAME="github-pool"
export PROVIDER_NAME="github-provider"
export REGION="us-central1"

# Get project number
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

echo "🚀 Starting GCP Workload Identity Federation setup..."

# 1. Enable APIs
echo "📦 Enabling required APIs..."
gcloud services enable \
  iamcredentials.googleapis.com \
  cloudresourcemanager.googleapis.com \
  sts.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  --project=$PROJECT_ID

# 2. Create Service Account
echo "👤 Creating service account..."
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
  --display-name="GitHub Actions Service Account" \
  --project=$PROJECT_ID

# 3. Grant Permissions
echo "🔐 Granting permissions..."
for role in \
  "roles/run.admin" \
  "roles/artifactregistry.writer" \
  "roles/iam.serviceAccountUser" \
  "roles/secretmanager.secretAccessor"
do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="$role"
done

# 4. Create Workload Identity Pool
echo "🏊 Creating workload identity pool..."
gcloud iam workload-identity-pools create $POOL_NAME \
  --location="global" \
  --display-name="GitHub Actions Pool" \
  --project=$PROJECT_ID

# 5. Create Provider
echo "🔗 Creating OIDC provider..."
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
  --location="global" \
  --workload-identity-pool=$POOL_NAME \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-condition="assertion.repository_owner == '${REPO_OWNER}'" \
  --project=$PROJECT_ID

# 6. Bind Service Account
echo "🔗 Binding service account to workload identity..."
gcloud iam service-accounts add-iam-policy-binding \
  ${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/${REPO_OWNER}/${REPO_NAME}" \
  --project=$PROJECT_ID

# 7. Create Artifact Registry Repository
echo "📦 Creating Artifact Registry repository..."
gcloud artifacts repositories create 3d-inventory \
  --repository-format=docker \
  --location=$REGION \
  --description="3D Inventory Docker images" \
  --project=$PROJECT_ID || echo "Repository may already exist"

# 8. Output values for GitHub Secrets
echo ""
echo "✅ Setup complete! Add these secrets to GitHub:"
echo ""
echo "GCP_PROJECT_ID:"
echo "$PROJECT_ID"
echo ""
echo "WIF_PROVIDER:"
echo "projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"
echo ""
echo "WIF_SERVICE_ACCOUNT:"
echo "${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
echo ""

# 9. Optionally set GitHub secrets automatically
read -p "Do you want to set GitHub secrets automatically? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  gh secret set GCP_PROJECT_ID --body "$PROJECT_ID" --repo "${REPO_OWNER}/${REPO_NAME}"
  gh secret set WIF_PROVIDER --body "projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}" --repo "${REPO_OWNER}/${REPO_NAME}"
  gh secret set WIF_SERVICE_ACCOUNT --body "${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com" --repo "${REPO_OWNER}/${REPO_NAME}"
  echo "✅ GitHub secrets set successfully!"
fi
```

---

## 🔍 Troubleshooting

### Issue: "Permission denied" when running workflow

**Solution**: Verify service account has required roles:

```bash
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
```

### Issue: "Workload Identity Pool not found"

**Solution**: Verify pool and provider exist:

```bash
gcloud iam workload-identity-pools describe $POOL_NAME \
  --location="global" \
  --project=$PROJECT_ID

gcloud iam workload-identity-pools providers describe $PROVIDER_NAME \
  --location="global" \
  --workload-identity-pool=$POOL_NAME \
  --project=$PROJECT_ID
```

### Issue: "Invalid audience in token"

**Solution**: Check attribute condition in provider matches your repository owner exactly.

---

## 📚 Additional Resources

- [Google Cloud Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [google-github-actions/auth](https://github.com/google-github-actions/auth)

---

**Created**: December 2024
**For Project**: 3D Inventory API - GCP Deployment
