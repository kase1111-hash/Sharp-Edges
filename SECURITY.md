# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Sharp-Edges seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do not** create a public GitHub issue for security vulnerabilities
2. Email the maintainer directly with details of the vulnerability
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

### What to Expect

- Acknowledgment of your report within 48 hours
- An assessment of the vulnerability and its severity
- Regular updates on the progress of addressing the issue
- Credit in the release notes (if desired) once the issue is resolved

## Security Considerations

### API Key Handling

This application uses the Anthropic API and requires an API key. Important security notes:

- **Never commit API keys** to version control
- The `.env` and `.env.local` files are included in `.gitignore`
- For development, store your API key in `.env.local`
- **For production**: Implement a backend proxy to avoid exposing API keys in client-side code

### Current Limitations

The current implementation exposes the API key to the client-side JavaScript. This is acceptable for:
- Local development
- Personal use
- Demo purposes

For production deployments with multiple users, implement a server-side proxy to:
- Keep the API key secure on the server
- Add rate limiting
- Implement user authentication

### Recommended Production Architecture

```
[Client] --> [Your Backend Server] --> [Anthropic API]
                    |
                    +-- API key stored securely
                    +-- Rate limiting
                    +-- Authentication
```

## Dependencies

We regularly monitor dependencies for known vulnerabilities. To check for vulnerabilities:

```bash
npm audit
```

To automatically fix issues where possible:

```bash
npm audit fix
```

## Best Practices for Users

1. Keep your API key confidential
2. Rotate your API key if you suspect it has been compromised
3. Monitor your Anthropic API usage for unexpected activity
4. Keep dependencies updated with `npm update`
5. Review the Anthropic API usage policy for compliance
