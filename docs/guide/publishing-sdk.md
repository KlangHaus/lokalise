# Publishing the React Native SDK

This guide explains how to publish the `@lokalise/sdk-react` package to npm. As Lokalise is self-hosted, you have two options for SDK distribution.

## Two Approaches

### Option 1: Use Official Package (Recommended for Most Users)

Install the official package published by the Lokalise maintainers:

```bash
npm install @lokalise/sdk-react
```

**When to use:**
- You want automatic updates and bug fixes
- You don't need custom modifications to the SDK
- You want the simplest setup
- You trust the official release cycle

### Option 2: Fork and Publish Your Own

Fork the repository and publish your own version under your organization's npm scope:

```bash
npm install @your-company/lokalise-sdk-react
```

**When to use:**
- You need custom modifications to the SDK
- Your organization requires full control over all dependencies
- Compliance/security policies require internal package hosting
- You want to control the release schedule
- You're adding company-specific features to the SDK

## Prerequisites

- npm account (create at [npmjs.com](https://www.npmjs.com))
- Contributor access to the npm organization (if using scoped package)
- Project built and tested locally

## Publishing Your Own Forked Version

If you choose Option 2 (fork and publish your own), follow these steps:

### 1. Fork the Repository

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/lokalise.git
cd lokalise
```

### 2. Update Package Name

Edit `packages/sdk-react/package.json`:

```json
{
  "name": "@your-company/lokalise-sdk-react",
  "version": "0.1.0",
  "description": "Lokalise SDK for React Native (Company fork)",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/lokalise.git",
    "directory": "packages/sdk-react"
  }
}
```

### 3. Make Your Customizations (Optional)

If you're forking to add custom features:

```bash
cd packages/sdk-react/src
# Make your changes
# Add your custom functionality
```

### 4. Build and Test

```bash
cd packages/sdk-react
bun install
bun run build

# Test locally first
npm pack
npm install ./lokalise-sdk-react-0.1.0.tgz
```

### 5. Publish to Your Organization

```bash
npm login
npm publish --access public
```

Your users can now install:

```bash
npm install @your-company/lokalise-sdk-react
```

### 6. Keep Your Fork Updated

Regularly sync with upstream to get bug fixes and features:

```bash
# Add upstream remote (one time)
git remote add upstream https://github.com/allanasp/lokalise.git

# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Rebuild and republish
cd packages/sdk-react
bun run build
npm version patch
npm publish
```

## Package Configuration

The SDK is located at `packages/sdk-react/` with the following configuration:

```json
{
  "name": "@lokalise/sdk-react",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts"
}
```

## Publishing Steps

### 1. Login to npm

```bash
npm login
```

Enter your:
- Username
- Password
- Email
- One-time password (if 2FA enabled)

### 2. Build the Package

```bash
cd packages/sdk-react
bun run build
```

This generates:
- `dist/index.js` (CommonJS)
- `dist/index.mjs` (ES Module)
- `dist/index.d.ts` (TypeScript definitions)

### 3. Test the Build

```bash
# Create a tarball
npm pack

# Test installation
npm install lokalise-sdk-react-0.1.0.tgz
```

### 4. Verify Package Contents

```bash
# See what will be published
npm publish --dry-run
```

Check that only necessary files are included:
- dist/
- package.json
- README.md
- LICENSE

### 5. Publish to npm

For scoped packages (recommended):
```bash
npm publish --access public
```

For unscoped packages:
```bash
npm publish
```

### 6. Verify Publication

```bash
npm info @lokalise/sdk-react
```

Visit: https://www.npmjs.com/package/@lokalise/sdk-react

## Versioning

Follow [Semantic Versioning](https://semver.org):

- **Patch** (0.1.0 -> 0.1.1): Bug fixes
- **Minor** (0.1.0 -> 0.2.0): New features (backwards compatible)
- **Major** (0.1.0 -> 1.0.0): Breaking changes

Update version:
```bash
npm version patch
npm version minor
npm version major
```

This automatically:
- Updates package.json
- Creates a git tag
- Commits the change

## Publishing Updates

```bash
# Update version
npm version patch

# Build
bun run build

# Publish
npm publish

# Push to GitHub
git push --follow-tags
```

## Automation with GitHub Actions

Create `.github/workflows/publish-sdk.yml`:

```yaml
name: Publish SDK

on:
  push:
    tags:
      - 'sdk-v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1

      - run: bun install

      - run: bun run build
        working-directory: packages/sdk-react

      - uses: JS-DevTools/npm-publish@v3
        with:
          token: ${{ secrets.NPM_TOKEN }}
          package: packages/sdk-react/package.json
```

To publish:
```bash
git tag sdk-v0.1.0
git push --tags
```

## npm Scopes

**Option 1: Scoped Package** (recommended)
- Name: `@yourusername/sdk-react` or `@lokalise/sdk-react`
- Requires organization or user scope
- Can be private or public

**Option 2: Unscoped Package**
- Name: `lokalise-sdk-react`
- Always public
- Name must be unique across all of npm

## Package.json Updates

Before publishing, update:

```json
{
  "name": "@your-npm-username/sdk-react",
  "author": "Your Name <email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/allanasp/lokalise.git",
    "directory": "packages/sdk-react"
  },
  "homepage": "https://github.com/allanasp/lokalise#readme",
  "bugs": {
    "url": "https://github.com/allanasp/lokalise/issues"
  }
}
```

## Best Practices

1. **Always test before publishing**
   - Run builds locally
   - Test in a sample React Native app
   - Check bundle size

2. **Use npm pack first**
   - Test the exact package that will be published
   - Verify file contents

3. **Semantic versioning**
   - Follow semver strictly
   - Document breaking changes

4. **Changelog**
   - Maintain CHANGELOG.md
   - Document all changes

5. **Git tags**
   - Tag releases in git
   - Keep tags and npm versions in sync

## Troubleshooting

### "Package name already taken"

Choose a different name:
- Add scope: `@yourusername/lokalise-sdk`
- Make it unique: `lokalise-selfhosted-sdk`

### "Forbidden - must be logged in"

```bash
npm logout
npm login
```

### "402 Payment Required"

Scoped packages are private by default. Use:
```bash
npm publish --access public
```

### "Version already published"

Bump the version:
```bash
npm version patch
npm publish
```

## Understanding Self-Hosted + npm SDK

**Important Clarification:**

The SDK and the backend are separate concerns:

**SDK (Published to npm):**
- Published once to npm (by you or users)
- Installed via `npm install @lokalise/sdk-react`
- Same code for all users
- Gets bug fixes and updates via npm

**Backend (Self-Hosted):**
- Each organization deploys their own instance
- Runs on their infrastructure
- Contains their translation data
- Independent of SDK version

**How They Connect:**

```typescript
// User installs SDK from npm (same for everyone)
import { LokaliseProvider } from "@lokalise/sdk-react";

// But configures it to point to THEIR backend
<LokaliseProvider
  baseUrl="https://translations.company-a.com"  // Company A's server
  apiKey="lok_company_a_key"
/>

// Another user with same SDK, different backend
<LokaliseProvider
  baseUrl="https://lokalise.company-b.internal"  // Company B's server
  apiKey="lok_company_b_key"
/>
```

This is the same pattern as:
- **Supabase**: npm SDK + self-hosted Postgres/API
- **Minio**: npm SDK + self-hosted object storage
- **Parse**: npm SDK + self-hosted Parse Server

## After Publishing

1. Update main README with actual installation instructions
2. Update documentation to reflect published package
3. Announce on GitHub Discussions
4. Create a GitHub release
5. Update project website
6. Remind users: SDK install via npm, backend stays self-hosted

## Unpublishing (Emergency Only)

**Warning:** Only unpublish within 72 hours, and never if anyone depends on it.

```bash
npm unpublish @lokalise/sdk-react@0.1.0
```

Better approach: Deprecate instead:
```bash
npm deprecate @lokalise/sdk-react@0.1.0 "Deprecated, use 0.1.1 instead"
```

## Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org)
- [npm Scopes](https://docs.npmjs.com/cli/v9/using-npm/scope)
