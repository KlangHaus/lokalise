# Complete Workflow Guide

This guide walks you through the complete end-to-end workflow of using Lokalise Self-Hosted, from deployment to seeing live translation updates in your React Native/Expo app.

## What You'll Accomplish

By following this guide, you will:
1. Deploy Lokalise Self-Hosted locally
2. Create a project and add translations in multiple languages
3. Integrate the SDK into a React Native/Expo app (pre-npm publication)
4. Experience hot reload - watch translations update in real-time without restarting your app

## Prerequisites

Before starting, ensure you have:
- Docker >= 20.10 and Docker Compose >= 2.0 (for backend)
- Node.js >= 18 or Bun >= 1.0
- Expo CLI or React Native setup
- Basic knowledge of React Native/Expo
- A mobile device or emulator for testing

## Part 1: Self-Hosting Setup

### Deploy with Docker

Clone the repository and start services:

```bash
git clone https://github.com/allanasp/lokalise.git
cd lokalise
cp .env.example .env
```

Edit `.env` and set required variables:

```bash
# Generate with: openssl rand -hex 32
BETTER_AUTH_SECRET=your_secret_here
DB_PASSWORD=your_secure_password
API_URL=http://localhost:3000
WEB_URL=http://localhost:3001
```

Start all services:

```bash
docker compose up -d
```

### Verify Installation

Check API health:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{"status":"ok"}
```

Open the web UI at http://localhost:3001.

For detailed troubleshooting, see the [Getting Started guide](/guide/getting-started).

## Part 2: Creating Your First Project

### Create Account and Organization

1. Navigate to http://localhost:3001
2. Click "Register" and create your account
3. After login, create your first organization when prompted
4. Enter organization name (e.g., "My Company")

### Create Project

1. Navigate to **Projects** from the sidebar
2. Click **Create Project**
3. Fill in project details:
   - **Name**: "Mobile App" (or your app name)
   - **Description**: "Translations for my React Native app"
4. Click **Create**

### Get Your API Key

1. Open your newly created project
2. Go to **Settings** tab
3. Copy the **API Key** (starts with `lok_`)
4. Save this key - you'll need it for SDK integration

The API key format: `lok_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Part 3: Adding Translations

### Add Locales

Before adding translations, define which languages your app supports:

1. Go to **Locales** tab in your project
2. Click **Add Locale**
3. Select languages (e.g., English, Danish, German)
   - `en` - English
   - `da` - Danish
   - `de` - German
4. Click **Add**

### Create Translation Keys

Translation keys are organized by namespaces for better structure:

1. Go to **Translation Keys** tab
2. Click **Create Key**
3. Enter key details:
   - **Key**: `welcome.title` (use dot notation for grouping)
   - **Namespace**: `default`
   - **Description**: "Main welcome screen title"
4. Click **Create**

Create more keys:
- `welcome.message` - "Welcome message with user name"
- `welcome.subtitle` - "Subtitle text"

### Add Translation Values

For each key, add values in all locales:

1. Click on a translation key (e.g., `welcome.title`)
2. For each locale, add the translation:
   - **English (en)**: "Welcome!"
   - **Danish (da)**: "Velkommen!"
   - **German (de)**: "Willkommen!"
3. Set **Status** to **published** (critical for SDK visibility)
4. Click **Save**

Repeat for `welcome.message` with interpolation:
- **English (en)**: "Hello, {{name}}! Welcome to our app."
- **Danish (da)**: "Hej, {{name}}! Velkommen til vores app."
- **German (de)**: "Hallo, {{name}}! Willkommen in unserer App."

### Understanding Translation Status

Translations have three statuses:

- **draft**: Work in progress, not visible via public API
- **review**: Ready for review, not visible via public API
- **published**: Live and available to SDK clients

**Important**: Only translations with status `published` will appear in your app.

### Bulk Operations

For large-scale translations, use import/export:

1. Go to **Import/Export** tab
2. Download template or export existing translations
3. Edit in Excel/CSV editor
4. Import back with status set to "published"

See [Import & Export guide](/guide/usage/import-export) for details.

## Part 4: Expo App Integration

The SDK can be installed in three ways, depending on your needs and the publication status:

### Installation Options

**Option 1: Official npm Package (When Available)**

Once published, this is the recommended approach:

```bash
npm install @lokalise/sdk-react @react-native-async-storage/async-storage
```

This gives you automatic updates and official support.

**Option 2: Forked Version (Custom Package)**

If your organization has forked and published their own version:

```bash
npm install @your-company/lokalise-sdk-react @react-native-async-storage/async-storage
```

This gives you full control over customizations and release schedule. See [Publishing SDK guide](/guide/publishing-sdk) for forking instructions.

**Option 3: Local Installation (Pre-Publication)**

If the SDK isn't yet published to npm, install it locally:

### Option 3A: Local Path Installation

Build the SDK:

```bash
# From the lokalise repository root
cd packages/sdk-react
bun install
bun run build
```

Install in your Expo project:

```bash
# In your Expo project directory
npm install /path/to/lokalise/packages/sdk-react @react-native-async-storage/async-storage
```

### Option 3B: npm pack Installation

Create a package tarball:

```bash
# From the SDK directory
cd packages/sdk-react
npm pack
# Creates: lokalise-sdk-react-0.1.0.tgz
```

Install in your Expo project:

```bash
# In your Expo project directory
npm install /path/to/lokalise/packages/sdk-react/lokalise-sdk-react-0.1.0.tgz
npm install @react-native-async-storage/async-storage
```

### Configure the Provider

Edit your `App.tsx` or `app/_layout.tsx` (for Expo Router):

```typescript
import { LokaliseProvider } from "@lokalise/sdk-react";
import { View } from "react-native";

export default function App() {
  return (
    <LokaliseProvider
      apiKey="lok_YOUR_API_KEY_HERE"
      baseUrl="http://192.168.1.100:3000"  // Use your machine's IP
      defaultLocale="en"
      namespaces={["default"]}
      pollInterval={30000}  // Poll every 30 seconds
    >
      <YourAppContent />
    </LokaliseProvider>
  );
}
```

**Critical Configuration Notes**:

- **baseUrl**: Use your machine's local IP address (e.g., `192.168.1.100:3000`), NOT `localhost` or `127.0.0.1`
  - Find your IP on Mac: `ipconfig getifaddr en0`
  - Find your IP on Linux: `ip addr show`
  - Find your IP on Windows: `ipconfig`
- **apiKey**: The project API key from Part 2 (starts with `lok_`)
- **namespaces**: Array of namespaces to load (must match your translation keys)
- **pollInterval**: How often to check for updates (milliseconds)

### Using Translations in Components

Create a component that uses translations:

```typescript
import { useTranslation } from "@lokalise/sdk-react";
import { View, Text, ActivityIndicator } from "react-native";

function HomeScreen() {
  const { t, isReady } = useTranslation("default");

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading translations...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        {t("welcome.title")}
      </Text>
      <Text style={{ fontSize: 16, marginTop: 10 }}>
        {t("welcome.message", { name: "John" })}
      </Text>
    </View>
  );
}
```

### Verify Network Connectivity

Before running your app, verify the SDK can reach the API:

```bash
# From your development machine
curl http://YOUR_IP:3000/api/health

# Test the public API endpoint
curl http://YOUR_IP:3000/api/public/v1/translations?locale=en&namespace=default \
  -H "X-API-Key: lok_YOUR_KEY"
```

Both should return successful responses.

## Part 5: Testing Hot Reload

Now for the exciting part - see translations update in real-time.

### Step 1: Start Your App

```bash
expo start
```

Open your app on a physical device or emulator. You should see:

```
Welcome!
Hello, John! Welcome to our app.
```

### Step 2: Keep App Running

**Important**: Keep your app open and running. Don't close it or navigate away.

### Step 3: Edit a Translation

In the Lokalise web UI (http://localhost:3001):

1. Navigate to your project
2. Go to **Translation Keys**
3. Click on `welcome.title`
4. Change the English value from "Welcome!" to "Hello There!"
5. **Set status to "published"** (critical step)
6. Click **Save**

### Step 4: Wait for Polling

The SDK polls for updates every 30 seconds (your configured `pollInterval`). Watch your app screen.

### Step 5: See the Magic

After approximately 30 seconds, the text will automatically update from "Welcome!" to "Hello There!" without any app restart or manual refresh.

### What Happens Under the Hood

Here's the complete flow:

```
Initial Load
├─ LokaliseProvider initializes
├─ Fetch manifest: GET /api/public/v1/manifest
│  └─ Returns: { locales: ["en", "da", "de"], namespaces: ["default"] }
├─ Fetch translations: GET /api/public/v1/translations?locale=en&namespace=default
│  └─ Returns: { "welcome.title": "Welcome!", ... }
├─ Store in AsyncStorage with ETag
└─ Render components with translations

Polling Cycle (every 30s)
├─ Fetch manifest again
├─ Compare with cached version
├─ If changed → Fetch translations with If-None-Match header (ETag)
│  ├─ Server checks ETag against latest updatedAt timestamp
│  ├─ If unchanged → Return 304 Not Modified (0 bytes transferred)
│  └─ If changed → Return 200 + updated translations
├─ Update AsyncStorage cache
└─ Notify all useTranslation hooks → Components re-render

After You Edit in Web UI
├─ Translation saved with new updatedAt timestamp
├─ ETag changes (based on max updatedAt)
├─ Next poll detects change
├─ SDK fetches new data
└─ App re-renders with "Hello There!"
```

### Performance Optimization

The SDK is designed for efficiency:

- **ETag caching**: Only downloads when translations actually change
- **304 responses**: When nothing changed, server returns 304 (minimal bandwidth)
- **AsyncStorage**: Translations cached locally, instant offline access
- **Selective polling**: Only checks manifest first, fetches translations if needed

## Part 6: Advanced Features

### Changing Languages Dynamically

Allow users to switch languages at runtime:

```typescript
import { useTranslation } from "@lokalise/sdk-react";
import { View, Button } from "react-native";

function LanguageSwitcher() {
  const { setLocale, locale } = useTranslation("default");

  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <Button
        title="English"
        onPress={() => setLocale("en")}
        disabled={locale === "en"}
      />
      <Button
        title="Dansk"
        onPress={() => setLocale("da")}
        disabled={locale === "da"}
      />
      <Button
        title="Deutsch"
        onPress={() => setLocale("de")}
        disabled={locale === "de"}
      />
    </View>
  );
}
```

When the user switches languages:
1. SDK fetches translations for the new locale
2. All components using `useTranslation` re-render
3. Entire app updates to the new language instantly

### Using Multiple Namespaces

Organize translations by feature or domain:

```typescript
// Configure provider with multiple namespaces
<LokaliseProvider
  apiKey="lok_xxx"
  baseUrl="http://192.168.1.100:3000"
  defaultLocale="en"
  namespaces={["default", "errors", "common", "onboarding"]}
  pollInterval={30000}
/>
```

Use in components:

```typescript
function ErrorDisplay() {
  const { t } = useTranslation("errors");

  return (
    <View>
      <Text>{t("network.timeout")}</Text>
      <Text>{t("network.offline")}</Text>
    </View>
  );
}

function CommonUI() {
  const { t } = useTranslation("common");

  return <Button title={t("actions.save")} />;
}
```

### Interpolation and Variables

Pass dynamic values to translations:

```typescript
// Translation: "You have {{count}} unread messages"
const { t } = useTranslation("default");

<Text>{t("inbox.unread", { count: 5 })}</Text>
// Output: "You have 5 unread messages"

// Multiple variables
// Translation: "Hello, {{firstName}} {{lastName}}!"
<Text>{t("greeting.full", { firstName: "John", lastName: "Doe" })}</Text>
// Output: "Hello, John Doe!"
```

### Checking Load Status

Handle loading states gracefully:

```typescript
function MyComponent() {
  const { t, isReady, error } = useTranslation("default");

  if (error) {
    return <Text>Error loading translations: {error.message}</Text>;
  }

  if (!isReady) {
    return <ActivityIndicator />;
  }

  return <Text>{t("content.title")}</Text>;
}
```

### Manual Refresh

Force an immediate refresh instead of waiting for polling:

```typescript
import { useLokalise } from "@lokalise/sdk-react";

function RefreshButton() {
  const { refresh, isRefreshing } = useLokalise();

  return (
    <Button
      title="Refresh Translations"
      onPress={refresh}
      disabled={isRefreshing}
    />
  );
}
```

## Part 7: Troubleshooting

### App Can't Connect to API

**Symptoms**: App shows loading forever, or error "Network request failed"

**Solutions**:

1. **Verify you're using your machine's IP, not localhost**:
   ```typescript
   // Wrong
   baseUrl: "http://localhost:3000"

   // Correct
   baseUrl: "http://192.168.1.100:3000"
   ```

2. **Check API is accessible from your device**:
   ```bash
   # From your phone (using Termux) or emulator
   curl http://YOUR_IP:3000/api/health
   ```

3. **Verify firewall settings**:
   - Make sure your firewall allows connections on port 3000
   - On Mac: System Settings > Network > Firewall
   - On Linux: `sudo ufw allow 3000`

4. **Ensure both devices are on the same network**:
   - Your development machine and phone must be on the same WiFi
   - Corporate/public WiFi may block device-to-device communication

5. **Check Docker port binding**:
   ```bash
   docker compose ps
   # Verify API is bound to 0.0.0.0:3000, not 127.0.0.1:3000
   ```

### Translations Not Updating

**Symptoms**: You edit translations but app doesn't update after 30 seconds

**Solutions**:

1. **Verify translation status is "published"**:
   - Open translation key in web UI
   - Check status is "published", not "draft" or "review"
   - Only published translations are visible to the SDK

2. **Check poll interval isn't too long**:
   ```typescript
   pollInterval={30000}  // 30 seconds - should update within this time
   ```

3. **Verify API key is correct**:
   - Copy key directly from project settings
   - Ensure it starts with `lok_`
   - No extra spaces or quotes

4. **Check network errors in Expo logs**:
   ```bash
   # Look for failed API calls
   expo start
   # Press 'j' to open debugger
   ```

5. **Manually trigger refresh**:
   ```typescript
   const { refresh } = useLokalise();
   refresh(); // Force immediate check
   ```

6. **Verify API server is running**:
   ```bash
   docker compose ps
   curl http://localhost:3000/api/health
   ```

### Translations Showing Keys Instead of Values

**Symptoms**: App displays "welcome.title" instead of "Welcome!"

**Solutions**:

1. **Check the key exists in your project**:
   - Go to Translation Keys in web UI
   - Verify exact key name matches (case-sensitive)

2. **Verify namespace is correct**:
   ```typescript
   // In provider
   namespaces={["default"]}

   // In component
   useTranslation("default")  // Must match
   ```

3. **Ensure locale is supported**:
   - Check locale exists in project (Locales tab)
   - Verify defaultLocale in provider matches

4. **Check translation is published**:
   - Status must be "published", not "draft"

5. **Clear cache and reload**:
   ```typescript
   // Add this temporarily to force cache clear
   import AsyncStorage from '@react-native-async-storage/async-storage';

   await AsyncStorage.clear();
   // Then restart app
   ```

### App Crashes on Startup

**Symptoms**: App crashes immediately when starting

**Solutions**:

1. **Verify AsyncStorage is installed**:
   ```bash
   npm install @react-native-async-storage/async-storage
   expo prebuild  # If using Expo
   ```

2. **Check API key format**:
   ```typescript
   apiKey="lok_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  // Should start with lok_
   ```

3. **Verify baseUrl is valid**:
   ```typescript
   baseUrl="http://192.168.1.100:3000"  // Valid URL format
   ```

4. **Check for missing provider**:
   ```typescript
   // LokaliseProvider must wrap components using useTranslation
   <LokaliseProvider {...config}>
     <App />  {/* Components inside can use useTranslation */}
   </LokaliseProvider>
   ```

5. **Check console for specific error**:
   ```bash
   expo start
   # Look for error details in terminal
   ```

### Slow Performance or High Data Usage

**Symptoms**: App uses too much data or feels slow

**Solutions**:

1. **Increase poll interval**:
   ```typescript
   pollInterval={300000}  // 5 minutes instead of 30 seconds
   ```

2. **Reduce namespaces**:
   ```typescript
   // Only load namespaces you actually use
   namespaces={["default"]}  // Not all namespaces
   ```

3. **Check ETag is working**:
   - Look in network tab for 304 responses
   - If always receiving 200, ETags may not be working

4. **Verify AsyncStorage is working**:
   ```typescript
   import AsyncStorage from '@react-native-async-storage/async-storage';

   AsyncStorage.getAllKeys().then(console.log);
   // Should see lokalise:* keys
   ```

### Network Errors on iOS Simulator

**Symptoms**: Works on Android but not iOS simulator

**Solutions**:

1. **iOS requires HTTPS in production or localhost exception**:
   ```xml
   <!-- In ios/YourApp/Info.plist -->
   <key>NSAppTransportSecurity</key>
   <dict>
     <key>NSAllowsLocalNetworking</key>
     <true/>
   </dict>
   ```

2. **Use your machine's IP, not localhost**:
   ```typescript
   baseUrl: "http://192.168.1.100:3000"  // Not localhost
   ```

## Part 8: Next Steps

### Choosing Your SDK Distribution Strategy

As a self-hosted solution, Lokalise offers flexibility in how you distribute the SDK:

**Scenario 1: Using Official Package**

Best for most users who want a simple, maintained solution:

```bash
# Install official package
npm install @lokalise/sdk-react

# Configure to point to YOUR self-hosted instance
<LokaliseProvider
  baseUrl="https://translations.your-company.com"  // Your server
  apiKey="lok_your_key"
/>
```

**Scenario 2: Fork and Customize**

Ideal for enterprises with specific needs:

1. Fork the repository on GitHub
2. Make your custom modifications to the SDK
3. Publish under your organization's npm scope
4. Teams install your version: `@your-company/lokalise-sdk-react`

Benefits:
- Full control over features and release schedule
- Add company-specific functionality
- Meet compliance requirements
- Internal support and maintenance

**Scenario 3: Monorepo Integration**

For advanced teams who want the SDK directly in their codebase:

1. Copy `packages/sdk-react` into your monorepo
2. Manage as an internal package
3. No external npm dependency

### Publishing SDK to npm

Whether publishing the official package or your own fork:

1. Follow the [Publishing SDK guide](/guide/publishing-sdk)
2. Choose between official or custom scope
3. Set up automated releases with GitHub Actions
4. Update your apps to use the published package

**Important**: The SDK is just the client library. Your self-hosted backend remains independent.

### Production Deployment

For production environments:

1. Deploy Lokalise to a production server
2. Use HTTPS with valid SSL certificate
3. Configure proper CORS origins
4. Set up database backups
5. Use environment-specific API keys

See:
- [Production Setup guide](/guide/installation/production)
- [Docker Compose deployment](/guide/deployment/docker-compose)
- [Kubernetes deployment](/guide/deployment/kubernetes)

### CI/CD for Translations

Automate your translation workflow:

1. Export translations to version control
2. Run validation checks in CI
3. Auto-import on deployment
4. Notify team of missing translations

### Translation Workflow Best Practices

Optimize your team's workflow:

1. **Use draft status** for work-in-progress translations
2. **Use review status** for peer review before going live
3. **Publish** only when translations are final
4. **Use namespaces** to organize translations by feature
5. **Add descriptions** to translation keys for context
6. **Test on device** before publishing to all users
7. **Version your translations** using git export/import

### Monitoring and Analytics

Track translation usage and performance:

1. Monitor API response times in production
2. Track 304 vs 200 responses (cache hit rate)
3. Analyze which translations are most frequently updated
4. Monitor error rates for missing translations

### Security Considerations

Protect your translation infrastructure:

1. **API keys**: Treat as secrets, don't commit to version control
2. **Rate limiting**: Configure on API server to prevent abuse
3. **CORS**: Set proper origins in production
4. **HTTPS**: Always use HTTPS in production
5. **Database**: Regular backups and access controls

## Summary

You've now completed the full workflow:

1. Self-hosted Lokalise locally with Docker
2. Created a project and added multi-language translations
3. Integrated the SDK into a React Native/Expo app
4. Experienced real-time hot reload of translations

The power of this system is that **your content team can update translations at any time**, and users will see changes within minutes, **without requiring an app update** through the App Store or Play Store.

This is particularly valuable for:
- **Time-sensitive updates**: Promotional messages, event announcements
- **A/B testing**: Try different copy to see what resonates
- **Bug fixes**: Correct typos or errors immediately
- **Seasonal content**: Update greetings, offers, or themes
- **Regulatory compliance**: Update legal text quickly when needed

## Additional Resources

- [Getting Started](/guide/getting-started) - Detailed setup guide
- [React Native SDK](/sdk/react-native) - Full SDK documentation
- [API Reference](/api/overview) - REST API documentation
- [Import & Export](/guide/usage/import-export) - Bulk translation management
- [Publishing SDK](/guide/publishing-sdk) - Publish SDK to npm
- [GitHub Repository](https://github.com/allanasp/lokalise) - Source code and issues
