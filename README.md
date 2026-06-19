# Herstellen Field Capture Mobile App

This folder is a standalone installable mobile web app for capturing inspection findings in the field.

## Setup

### Google Apps Script

1. Deploy the Google Apps Script as a Web App.
2. Use these deployment settings:
   - Execute as: Me
   - Who has access: Anyone with Google account
3. Copy the Web App URL ending in `/exec`.

### GitHub Pages

1. Create a new public GitHub repository, for example `herstellen-field-capture`.
2. Upload all files from this `mobile-field-capture` folder to the repository root.
3. In the repository, open `Settings -> Pages`.
4. Under `Build and deployment`, choose `Deploy from a branch`.
5. Select `main` and `/(root)`, then click `Save`.
6. Wait for GitHub Pages to publish the site.
7. Open the published URL on the phone.
8. Open settings and enter:
   - Apps Script Web App URL ending in `/exec`
9. Tap `Start New Inspection`.
10. Enter the client and property details.
11. Tap `Create Inspection & Use Report Number`.

The app creates the inspection row in Google Sheets, receives the generated report number, and sets it as the active report number on the phone.

## Field Workflow

1. Start a new inspection or enter an existing active report number in settings.
2. Take or choose a photo.
3. Select the category.
4. Enter the component, finding, location and notes.
5. Save the finding.
6. Sync when online.

The app keeps findings on the device until they are synced. Photos are compressed before saving so mobile sync is more reliable.

## Google Sheets Workflow

Synced rows land in the `PWA Findings` sheet. Use the spreadsheet menu:

`HERSTELLEN PWA -> Import PWA Findings`

That moves unsent rows into `Inspection Findings`, including the uploaded Drive photo URL.
