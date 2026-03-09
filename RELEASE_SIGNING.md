# Release Signing Setup

This project is configured for optional Windows code signing and macOS notarization.

## Icons

Source icon: `build/icon.svg`

Generate platform icons:

```bash
npm run icons:generate
```

Generated files are written to `build/icons`.

## Windows Code Signing

Electron Builder uses these environment variables automatically:

- `CSC_LINK`: Path or base64 data of `.p12` certificate
- `CSC_KEY_PASSWORD`: Password for the `.p12` certificate

Build command:

```bash
npm run release:win
```

## macOS Signing and Notarization

The notarization hook is `scripts/notarize.js` and runs only for macOS builds.

Required environment variables:

- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

Build command:

```bash
npm run release:mac
```

## Full Release Build

```bash
npm run release:all
```

On Linux, macOS signing is skipped unless credentials and signing identity are available.
