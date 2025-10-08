# How to Find Workload Identity Provider (WIF_PROVIDER)

## 🎯 Quick Answer

Your **WIF_PROVIDER** should be in this format:

```
projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_NAME/providers/PROVIDER_NAME
```

Example:

```
projects/123456789012/locations/global/workloadIdentityPools/github-pool/providers/github-provider
```

---

## 🚀 Method 1: Using the Automated Script (EASIEST)

```bash
cd /home/karol/GitHub/3d-inventory-api
./find-wif-provider.sh
```

This script will:

- ✅ Automatically find your project number
- ✅ List all workload identity pools
- ✅ List all providers
- ✅ Construct the correct WIF_PROVIDER format
- ✅ Optionally set it as GitHub secret

---

## 🔍 Method 2: Using GCP Console (Web UI)

### Step 1: Go to Workload Identity Federation

1. Open GCP Console: https://console.cloud.google.com
2. Select your project
3. Navigate to: **IAM & Admin** → **Workload Identity Federation**
   - Direct link: https://console.cloud.google.com/iam-admin/workload-identity-pools

### Step 2: Find Your Pool

- You'll see a list of Workload Identity Pools
- Look for a pool named something like:
  - `github-pool`
  - `github-actions-pool`
  - `gh-pool`

### Step 3: Find Your Provider

- Click on the pool name
- You'll see a list of **Providers**
- Look for a provider named something like:
  - `github-provider`
  - `github-actions-provider`
  - `gh-provider`

### Step 4: Get the Full Resource Name

- Click on the provider name
- Look for **"Resource name"** or **"Provider name"**
- It will show the full path like:
  ```
  projects/123456789012/locations/global/workloadIdentityPools/github-pool/providers/github-provider
  ```
- **THIS IS YOUR WIF_PROVIDER VALUE!**

---

## 💻 Method 3: Using gcloud CLI Commands

### List All Workload Identity Pools

```bash
gcloud iam workload-identity-pools list \
  --location=global \
  --project=YOUR_PROJECT_ID \
  --format="table(name, state, displayName)"
```

### List Providers in a Pool

```bash
gcloud iam workload-identity-pools providers list \
  --workload-identity-pool=POOL_NAME \
  --location=global \
  --project=YOUR_PROJECT_ID \
  --format="table(name, state, displayName)"
```

### Get Full Provider Details

```bash
gcloud iam workload-identity-pools providers describe PROVIDER_NAME \
  --workload-identity-pool=POOL_NAME \
  --location=global \
  --project=YOUR_PROJECT_ID \
  --format="value(name)"
```

### Complete Command to Get WIF_PROVIDER

```bash
# Set your project ID
export PROJECT_ID="your-project-id"

# Get project number
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# List pools and select one
export POOL_NAME="github-pool"  # Replace with your actual pool name

# List providers and select one
export PROVIDER_NAME="github-provider"  # Replace with your actual provider name

# Construct WIF_PROVIDER
echo "projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"
```

---

## 🔎 Method 4: If You Don't Have a Pool/Provider Yet

If you get errors saying "No pools found" or "No providers found", you need to create them first.

### Create Workload Identity Pool

```bash
export PROJECT_ID="your-project-id"
export POOL_NAME="github-pool"

gcloud iam workload-identity-pools create $POOL_NAME \
  --location="global" \
  --display-name="GitHub Actions Pool" \
  --description="Workload Identity Pool for GitHub Actions" \
  --project=$PROJECT_ID
```

### Create OIDC Provider for GitHub

```bash
export PROVIDER_NAME="github-provider"
export REPO_OWNER="karol-preiskorn"

gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
  --location="global" \
  --workload-identity-pool=$POOL_NAME \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-condition="assertion.repository_owner == '${REPO_OWNER}'" \
  --project=$PROJECT_ID
```

### Get the WIF_PROVIDER Value

```bash
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

echo "WIF_PROVIDER:"
echo "projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"
```

---

## 📋 What Each Part Means

Given this example:

```
projects/123456789012/locations/global/workloadIdentityPools/github-pool/providers/github-provider
```

- **`projects/123456789012`** = Your GCP project number (NOT project ID)
- **`locations/global`** = Always "global" for Workload Identity Federation
- **`workloadIdentityPools/github-pool`** = Your pool name
- **`providers/github-provider`** = Your provider name

---

## ✅ Quick Verification Commands

### 1. Check if you have gcloud installed

```bash
gcloud --version
```

### 2. Check current project

```bash
gcloud config get-value project
```

### 3. List your pools

```bash
gcloud iam workload-identity-pools list --location=global
```

### 4. Check if pool exists

```bash
gcloud iam workload-identity-pools describe github-pool \
  --location=global \
  --format="value(name)"
```

### 5. Get full provider name

```bash
gcloud iam workload-identity-pools providers describe github-provider \
  --workload-identity-pool=github-pool \
  --location=global \
  --format="value(name)"
```

---

## 🎯 Final Step: Set GitHub Secret

Once you have your WIF_PROVIDER value:

### Using GitHub CLI

```bash
gh secret set WIF_PROVIDER \
  --body "projects/123456789012/locations/global/workloadIdentityPools/github-pool/providers/github-provider" \
  --repo karol-preiskorn/3d-inventory-api
```

### Using GitHub Web UI

1. Go to: https://github.com/karol-preiskorn/3d-inventory-api/settings/secrets/actions
2. Click **"New repository secret"**
3. Name: `WIF_PROVIDER`
4. Value: `projects/YOUR_NUMBER/locations/global/workloadIdentityPools/YOUR_POOL/providers/YOUR_PROVIDER`
5. Click **"Add secret"**

---

## 🆘 Common Issues

### Issue: "Project number not found"

**Solution**: Make sure you're using the project NUMBER (digits), not project ID (letters)

```bash
gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)"
```

### Issue: "Pool not found"

**Solution**: List all pools to see what's available

```bash
gcloud iam workload-identity-pools list --location=global
```

### Issue: "Permission denied"

**Solution**: Make sure you have IAM permissions

```bash
# You need roles/iam.workloadIdentityPoolAdmin or roles/owner
gcloud projects get-iam-policy YOUR_PROJECT_ID --flatten="bindings[].members" --filter="bindings.members:user:YOUR_EMAIL"
```

---

## 📚 Resources

- **GCP Console WIF**: https://console.cloud.google.com/iam-admin/workload-identity-pools
- **GCP Documentation**: https://cloud.google.com/iam/docs/workload-identity-federation
- **GitHub Actions OIDC**: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect

---

**Quick Start**: Just run `./find-wif-provider.sh` and it will find everything for you! 🚀
