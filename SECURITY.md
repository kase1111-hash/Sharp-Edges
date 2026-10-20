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
- For development, store your API key in `.env.local` as `ANTHROPIC_API_KEY`
- The key is read only by the Express server (`server/`), which calls the Anthropic API on the
  browser's behalf; it never appears in the client bundle
- Never give the key a `VITE_` prefix: Vite exposes `VITE_` variables to client code

### Architecture

```
[Browser] --> [Express server: /api/analyze] --> [Anthropic API]
                    |
                    +-- API key and system prompt stored server-side
                    +-- Input validation
                    +-- Per-client rate limiting (burst of 3, then 10 requests/minute)
```

### Current Limitations

- There is no user authentication: anyone who can reach the server can request analyses, which
  are billed to the configured API key. Rate limiting bounds how fast each client can do so, but
  monitor your Anthropic usage, and put the app behind authentication if it is publicly reachable.
- Rate limits are tracked per client IP in memory, per server process. Behind a reverse proxy, set
  `TRUST_PROXY` to the number of proxies so the real client IP is used; otherwise all clients share
  the proxy's address and one limit.

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
