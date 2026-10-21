# Fullpagecapture

A Manifest V3 Chrome extension starter that captures a long webpage by scrolling through it, collecting viewport screenshots, stitching them into one PNG, and downloading the result.

## Current features
- Full-page capture for ordinary HTTP/HTTPS pages
- Automatic scrolling and screenshot stitching
- PNG download
- Basic/Premium comparison and pricing display
- Mobile-friendly source editing

## Premium pricing shown in the UI
- 6 months: $0.50
- 12 months: $1.00

**Important:** The payment system and premium entitlements are not implemented. These prices are display-only. Do not advertise paid premium access until you implement a backend, checkout provider, server-side payment verification, and subscription expiration checks.

## Install in Chrome (desktop)
1. Extract `Fullpagecapture.zip`.
2. Open Chrome and visit `chrome://extensions`.
3. Turn on **Developer mode**.
4. Choose **Load unpacked**.
5. Select the extracted `Fullpagecapture` folder (the folder containing `manifest.json`).
6. Open a normal website, click the extension icon, then click **Capture full page**.

## Android workflow
You can edit the files on Android using a text/code editor and store the project in GitHub. Standard Chrome for Android does not support installing unpacked desktop extensions through `chrome://extensions`; test the extension in desktop Chrome or a suitable remote Chromium environment.

## Limitations in this starter
- Some pages use sticky headers, lazy-loaded content, animations, or complex nested scroll areas; the stitched image may show repeated headers or gaps.
- Extremely long pages can exceed browser canvas limits.
- Browser-internal pages (`chrome://...`), Chrome Web Store pages, and some protected pages cannot be captured.
- Crop, PDF page splitting, blur/text/highlight annotation, account login, payment checkout, license validation, and priority support are not implemented yet.
- The extension currently asks Chrome for the `activeTab` permission after you invoke it. It does not send page contents to an external server.

## Project files
- `manifest.json` — extension configuration
- `popup.html` — popup interface
- `popup.css` — styling
- `popup.js` — capture, stitch, and download logic
