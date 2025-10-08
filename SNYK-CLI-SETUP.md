# Snyk CLI Setup & Troubleshooting

## Issue: Unable to Download Snyk CLI

**Error**: "Unable to download the Snyk CLI. This could be caused by connectivity issues or the CLI not being available on the selected release channel."

## Solution: Install via npm (Recommended)

### ✅ Quick Fix (Already Applied)

```bash
# Install Snyk CLI globally via npm
npm install -g snyk

# Verify installation
snyk --version
# Output: 1.1300.0

# Check installation location
which snyk
# Output: /home/karol/.nvm/versions/node/v24.7.0/bin/snyk
```

### Why npm Installation Works Better

1. **More Reliable**: Uses npm's robust package management
2. **No Connectivity Issues**: Works through standard npm registry
3. **Easy Updates**: Simple `npm update -g snyk` to update
4. **Version Control**: Pin to specific versions if needed

## Snyk CLI Usage

### Authentication

```bash
# Authenticate with Snyk (required for scanning)
snyk auth

# Check authentication status
snyk auth status
```

### Security Scanning Commands

#### 1. Code Analysis (SAST)

```bash
# Scan source code for vulnerabilities
snyk code test

# Scan specific directory
snyk code test /path/to/src
```

#### 2. Open Source Dependencies (SCA)

```bash
# Scan package.json for vulnerabilities
snyk test

# Scan with detailed output
snyk test --all-projects

# Test and monitor
snyk monitor
```

#### 3. Container Scanning

```bash
# Scan Docker image
snyk container test your-image:tag

# Scan Dockerfile
snyk container test --file=Dockerfile your-image:tag
```

#### 4. Infrastructure as Code (IaC)

```bash
# Scan Terraform files
snyk iac test terraform/

# Scan Kubernetes manifests
snyk iac test kubernetes/

# Scan with specific severity threshold
snyk iac test --severity-threshold=high
```

## VS Code Snyk Extension Configuration

### Update Extension Settings

If you're using the Snyk VS Code extension, configure it to use the npm-installed CLI:

1. Open VS Code Settings (Ctrl+,)
2. Search for "snyk"
3. Set **Snyk: Path** to: `/home/karol/.nvm/versions/node/v24.7.0/bin/snyk`

Or add to `.vscode/settings.json`:

```json
{
  "snyk.advanced.cliPath": "/home/karol/.nvm/versions/node/v24.7.0/bin/snyk"
}
```

### Alternative: Disable Automatic CLI Download

```json
{
  "snyk.advanced.autoUpdate": false,
  "snyk.advanced.cliPath": "/home/karol/.nvm/versions/node/v24.7.0/bin/snyk"
}
```

## Common Issues & Solutions

### Issue 1: VS Code Extension Can't Find CLI

**Solution**: Set explicit path in VS Code settings (see above)

### Issue 2: Permission Denied

```bash
# Fix npm global permissions
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Re-install Snyk
npm install -g snyk
```

### Issue 3: Old Version

```bash
# Update Snyk CLI
npm update -g snyk

# Or force reinstall
npm uninstall -g snyk
npm install -g snyk
```

### Issue 4: Connectivity Issues

```bash
# Test Snyk download server connectivity
curl -I https://downloads.snyk.io/cli/stable/snyk-linux

# Test Snyk API connectivity
curl -I https://api.snyk.io

# Configure proxy if needed
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

## Integration with Project

### Add to package.json Scripts

```json
{
  "scripts": {
    "snyk:test": "snyk test",
    "snyk:code": "snyk code test",
    "snyk:monitor": "snyk monitor",
    "security:scan": "snyk test && snyk code test"
  }
}
```

### Pre-commit Hook (Husky)

```bash
# .husky/pre-commit
#!/bin/sh
npm run snyk:test
npm run snyk:code
```

### CI/CD Integration

```yaml
# GitHub Actions
- name: Run Snyk Security Scan
  run: |
    npm install -g snyk
    snyk auth ${{ secrets.SNYK_TOKEN }}
    snyk test --all-projects
    snyk code test
```

## Environment Variables

```bash
# Set Snyk API token
export SNYK_TOKEN=your-api-token-here

# Set custom API endpoint (if needed)
export SNYK_API=https://api.snyk.io

# Disable analytics
export SNYK_DISABLE_ANALYTICS=true
```

## Verification Checklist

- [x] Snyk CLI installed via npm
- [x] Version 1.1300.0 confirmed
- [x] CLI accessible in PATH
- [ ] Authenticated with `snyk auth`
- [ ] VS Code extension configured (if using)
- [ ] Security scans working

## Quick Reference

### Most Common Commands

```bash
snyk auth                    # Authenticate
snyk test                    # Scan dependencies
snyk code test              # Scan source code
snyk monitor                # Monitor project
snyk iac test               # Scan IaC files
snyk container test IMAGE   # Scan container
```

### Help & Documentation

```bash
snyk --help                 # General help
snyk test --help           # Command-specific help
snyk code test --help      # Code scanning help
```

### Official Resources

- **Documentation**: https://docs.snyk.io
- **CLI Reference**: https://docs.snyk.io/snyk-cli
- **Support**: https://support.snyk.io
- **GitHub**: https://github.com/snyk/cli

---

## Status

✅ **FIXED** - Snyk CLI 1.1300.0 installed via npm

- Installation Method: `npm install -g snyk`
- Location: `/home/karol/.nvm/versions/node/v24.7.0/bin/snyk`
- Date: 2025-10-08

**Next Steps**:

1. Run `snyk auth` to authenticate
2. Configure VS Code extension (optional)
3. Run security scans on your projects
