# Security Policy

## Supported Versions

The following table shows which versions of the 3D Inventory API are currently
supported with security updates:

| Version | Supported | Notes |

| ------- | ------------------ | ------------------------ |

| 0.96.x | :white_check_mark: | Current stable release |

| 0.95.x | :white_check_mark: | Previous stable release |

| 0.94.x | :x: | End of life |

| < 0.94 | :x: | No longer supported |

## Security Features

This project implements comprehensive security measures:

### 🔐 Authentication & Authorization

- JWT-based authentication with refresh tokens

- Role-based access control (RBAC)

- Secure password hashing with bcrypt

- Session management with secure cookies

### 🛡️ Input Validation & Sanitization

- MongoDB injection prevention

- XSS protection with sanitize-html

- SQL injection protection

- Request rate limiting

- Input validation with AJV schemas

### 🔒 Transport Security

- HTTPS/TLS enforcement

- Security headers (HSTS, CSP, X-Frame-Options)

- CORS configuration

- Cookie security flags

### 📊 Monitoring & Logging

- Security event logging

- Failed authentication monitoring

- Request tracking and audit trails

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security
issue, please follow these steps:

### 📧 Contact Information

- **Primary Contact**: [Create a GitHub Security Advisory](https://github.com/karol-preiskorn/3d-inventory-mongo-api/security/advisories/new)

- **Email**: For sensitive issues, email the maintainer directly

- **Response Time**: We aim to acknowledge reports within 48 hours

### 📝 What to Include

When reporting a vulnerability, please provide:

1. **Description**: Clear description of the vulnerability

2. **Impact**: Potential impact and affected components

3. **Reproduction**: Steps to reproduce the issue

4. **Environment**: System details and configuration

5. **Proof of Concept**: If applicable, include PoC code

### 🔄 Process

1. **Initial Report**: Submit via GitHub Security Advisory

2. **Acknowledgment**: We'll confirm receipt within 48 hours

3. **Investigation**: We'll investigate and assess the impact

4. **Fix Development**: We'll develop and test a fix

5. **Disclosure**: Coordinated disclosure after fix is available

6. **Credit**: Reporter will be credited in release notes (if desired)

### 📅 Timeline Expectations

- **Critical vulnerabilities**: Fix within 72 hours

- **High severity**: Fix within 1 week

- **Medium/Low severity**: Fix in next regular release

### 🏆 Recognition

Security researchers who responsibly disclose vulnerabilities will be:

- Credited in our security hall of fame (with permission)

- Mentioned in release notes and changelog

- Invited to test fixes before public release

## Security Best Practices

For users deploying this API:

### 🔧 Configuration

- Use strong, unique JWT secrets

- Enable HTTPS in production

- Configure proper CORS policies

- Set secure cookie flags

- Use environment variables for sensitive data

### 🗄️ Database Security

- Use MongoDB authentication

- Implement network-level access controls

- Enable MongoDB audit logging

- Regular security updates

### 🔄 Operational Security

- Regular dependency updates

- Security scanning in CI/CD

- Log monitoring and alerting

- Backup encryption

## Compliance

This project aims to follow:

- OWASP Top 10 security guidelines

- NIST Cybersecurity Framework

- Industry standard secure coding practices

## Contact

For security-related questions or concerns:

- **GitHub Issues**: For general security questions (not vulnerabilities)

- **Security Advisories**: For vulnerability reports

- **Documentation**: See our security implementation in `SECURITY-FIXES.md`
