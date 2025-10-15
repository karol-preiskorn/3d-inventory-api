# CodeQL Security Analysis Setup

## Current Configuration

This repository uses **GitHub's default CodeQL setup** for code scanning instead of a custom workflow.

### Why Default Setup?

GitHub's default CodeQL setup provides:

- ✅ **Automatic maintenance** - GitHub manages updates and improvements
- ✅ **Simplified configuration** - No workflow file needed for CodeQL
- ✅ **Optimized performance** - GitHub optimizes scan frequency and resource usage
- ✅ **Same security coverage** - Identical analysis capabilities as custom workflows

### Accessing CodeQL Results

To view CodeQL security scanning results:

1. Go to your repository on GitHub
2. Navigate to **Security** tab
3. Click **Code scanning** in the sidebar
4. View alerts from **CodeQL**

**Direct link**: https://github.com/karol-preiskorn/3d-inventory-api/security/code-scanning

### CodeQL Coverage

Default setup scans:

- ✅ TypeScript files (134 out of 135)
- ✅ JavaScript files (10 out of 11)
- ✅ GitHub Actions workflows (12 out of 12)

### Custom Security Workflow

The repository maintains a custom `security.yml` workflow for:

- 🔍 **Dependency Security** - npm audit for vulnerable packages
- 🐳 **Container Security** - Trivy scans for Docker images
- 🔐 **Secret Detection** - TruffleHog for exposed credentials
- 📋 **License Compliance** - License checker for dependencies
- 📊 **OSSF Scorecard** - Security best practices scoring

## Conflict Resolution

**Previous Issue**: Custom CodeQL workflow conflicted with default setup

**Error**: `CodeQL analyses from advanced configurations cannot be processed when the default setup is enabled`

**Solution**: Removed custom CodeQL job from `security.yml` workflow to use GitHub's default setup

## Advanced Configuration (Optional)

If you need custom CodeQL configuration in the future:

### Option 1: Keep Default Setup (Recommended)

- Current configuration
- Managed by GitHub
- Automatic updates

### Option 2: Switch to Advanced Setup

1. Go to **Settings** > **Code security and analysis**
2. Under **Code scanning**, disable "Default setup"
3. Re-enable the CodeQL job in `.github/workflows/security.yml`
4. Customize CodeQL configuration as needed

**Workflow snippet for advanced setup**:

```yaml
codeql-analysis:
  name: CodeQL Security Analysis
  runs-on: ubuntu-latest

  steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: typescript, javascript
        # Custom queries (optional)
        # queries: security-extended

    - name: Autobuild
      uses: github/codeql-action/autobuild@v3

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3
```

## Monitoring

### CodeQL Scan Frequency

Default setup scans occur:

- 📅 **Automatically on push** to default branch
- 📅 **Weekly scheduled scans**
- 📅 **On pull requests** (for changed files)

### Viewing Scan Status

Check overall coverage and status:
https://github.com/karol-preiskorn/3d-inventory-api/security/code-scanning/tools/CodeQL/status/

## Related Documentation

- **[AGENTS.md](AGENTS.md)** - AI-assisted development and automation
- **[SECURITY.md](SECURITY.md)** - Security policies and guidelines
- **[security.yml](.github/workflows/security.yml)** - Custom security workflow

## Troubleshooting

### CodeQL not scanning all files?

**Common reasons**:

- Build failures preventing analysis
- Files excluded by `.gitignore`
- Unsupported file types or languages
- Analysis timeout (increase timeout in advanced setup)

**Check status page**: https://github.com/karol-preiskorn/3d-inventory-api/security/code-scanning/tools/CodeQL/status/

### Need custom CodeQL queries?

Switch to advanced setup (Option 2 above) and add:

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: typescript, javascript
    queries: security-and-quality # or security-extended
```

### Want to exclude certain paths?

Create `.github/codeql/codeql-config.yml`:

```yaml
name: 'CodeQL Config'

paths-ignore:
  - 'node_modules/**'
  - 'dist/**'
  - 'build/**'
  - '**/*.test.ts'
  - '**/*.spec.ts'
```

Then reference in advanced workflow:

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    config-file: ./.github/codeql/codeql-config.yml
```

---

**Last Updated**: October 15, 2025
**Status**: Using GitHub Default CodeQL Setup ✅
