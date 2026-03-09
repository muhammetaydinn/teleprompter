# Teleprompter Desktop

Cross-platform desktop teleprompter built with Electron.

## Features

- Lightweight desktop teleprompter UI
- Adjustable speed and reading controls
- Always-on-top support
- Cross-platform packaging (Linux, Windows, macOS)
- Auto-generated app icons from `build/icon.svg`

## Requirements

- Node.js 20+
- npm 10+

## Development

```bash
npm install
npm start
```

## Code Quality

```bash
npm run lint
npm run format:check
```

## Build Releases

Generate icons only:

```bash
npm run icons:generate
```

Build per platform:

```bash
npm run release:linux
npm run release:win
npm run release:mac
```

Build all targets:

```bash
npm run release:all
```

Build outputs are written to `release/`.

Automated release with GitHub Actions:

```bash
git tag v0.1.2
git push origin v0.1.2
```

This triggers `.github/workflows/release.yml` and uploads build artifacts to the GitHub Release automatically.

## Linux Installation (AppImage)

```bash
cd release
chmod +x "Teleprompter Desktop-0.1.0.AppImage"
./Teleprompter\ Desktop-0.1.0.AppImage
```

If it does not start, install FUSE:

```bash
sudo apt update
sudo apt install -y libfuse2 || sudo apt install -y libfuse2t64
```

## Signing & Notarization

See [RELEASE_SIGNING.md](RELEASE_SIGNING.md) for Windows signing and macOS notarization environment variables.
