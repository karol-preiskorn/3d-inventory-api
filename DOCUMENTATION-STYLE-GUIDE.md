# Documentation Style Guide

## Overview

This guide ensures consistent, accessible, and professional documentation
across the 3D Inventory project.

## Markdown Standards

### Line Length
- Maximum 80 characters per line
- Break at word boundaries
- Exceptions: URLs, tables, code blocks

### Headings
- Use ATX-style headings (`#`)
- Add blank lines before and after headings
- Use sentence case for headings

### Images and Badges
- Always include descriptive alt text
- Use meaningful descriptions, not just filenames
- Format: `![Alt text](URL "Optional title")`

Example:
```markdown
// Good
![3D Inventory Architecture Diagram](./architecture.png "System architecture overview")

// Bad  
![](./architecture.png)
```

### Lists
- Add blank lines before and after lists
- Use consistent bullet style (`-` for unordered)
- Use proper indentation (2 spaces)

### Tables
- Add blank lines before and after tables
- Align columns for readability
- Keep tables under 80 characters when possible

### Links
- Use descriptive link text
- Avoid "click here" or bare URLs
- Format: `[Description](URL)`

## Content Guidelines

### Writing Style
- Use clear, concise language
- Write in active voice
- Use present tense
- Include examples where helpful

### Accessibility
- All images must have alt text
- Use proper heading hierarchy
- Provide context for code examples
- Include keyboard shortcuts where applicable

### Security Documentation
- Customize generic templates
- Include specific project details
- Provide clear contact information
- List supported versions accurately

## File Structure

### README.md
- Brief project description
- Installation instructions
- Usage examples
- Contributing guidelines
- License information

### SECURITY.md
- Supported versions
- Vulnerability reporting process
- Security features overview
- Contact information

### API Documentation
- Endpoint descriptions
- Authentication requirements
- Request/response examples
- Error handling

## Quality Checks

Run these commands to maintain quality:

```bash
# Fix markdown issues
npm run lint:md

# Check only (no fixes)
npm run lint:md:check

# Full quality check
npm run quality:report
```

## Tools

- **markdownlint-cli2**: Markdown linting
- **prettier**: Code formatting
- **Documentation fixer**: Custom quality script

## Contributing

When updating documentation:

1. Follow this style guide
2. Run quality checks before committing
3. Include relevant examples
4. Update table of contents if needed
5. Test all links and references

---

For questions about documentation standards, please create an issue with the
`documentation` label.
