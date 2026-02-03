# @lokalise/sdk-react

React Native SDK for Lokalise Self-Hosted with OTA translation updates.

## Status

**In Development** - Not yet published to npm

## Features

- Over-the-air translation updates
- Offline-first with AsyncStorage caching
- React hooks API
- TypeScript support
- Automatic polling for updates
- ETag optimization

## Publishing to npm

To publish this package to npm:

### 1. Setup npm Account

```bash
npm login
```

### 2. Update package.json

Make sure these fields are correct:
- `name`: Should be scoped `@yourusername/sdk-react` or unscoped `lokalise-sdk-react`
- `version`: Start with `0.1.0`
- `author`: Your name
- `repository`: GitHub URL
- `homepage`: Project homepage

### 3. Build the Package

```bash
bun run build
```

### 4. Test Locally

```bash
npm pack
# This creates a .tgz file you can test with
npm install /path/to/lokalise-sdk-react-0.1.0.tgz
```

### 5. Publish

```bash
# Dry run to see what will be published
npm publish --dry-run

# Publish for real
npm publish

# Or if scoped package, make it public
npm publish --access public
```

### 6. Future Updates

```bash
# Update version
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0

# Publish new version
npm publish
```

## Installation (after publishing)

```bash
npm install @lokalise/sdk-react @react-native-async-storage/async-storage
```

## Usage

See main [documentation](../../docs/sdk/react-native.md) for detailed usage instructions.

## License

MIT
