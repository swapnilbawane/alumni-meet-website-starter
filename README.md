# Alumni Meetup Website Starter

A lightweight, read-only website template for alumni meetups and community events. It uses a static HTML site, Google Sheets as the content source, Google Apps Script as a read-only JSON API, and Netlify for hosting.

**The public website cannot write to Google Sheets.** Organisers maintain the Sheet directly. Only rows marked `approved` are returned, and the API exposes only explicitly whitelisted public fields.

## Architecture

```text
Organisers
    | edit
    v
Private Google Sheet (profiles, updates, guests, students)
    |
    v
Apps Script (GET-only, approved rows, public-field allowlist)
    |
    v
Static website (Netlify)
```

There is no public profile submission form, no `doPost()` handler, and no anonymous write endpoint. RSVP registration, if required, should use your existing registration system and be configured separately.

## Repository layout

```text
website/                         Static website
  index.html                     Main page
  netlify.toml                   Netlify publish and security headers
  images/README.md               Image guidance
apps-script/website-backend/     Read-only website API
  Code.gs
  appsscript.json
docs/                            Additional documentation
LICENSE                          MIT license for the code
.gitignore
```

## 1. Create the Google Sheet

Create a Google Sheet and add four tabs with these exact names and headers in row 1.

**profiles**

`timestamp | status | name | year | branch | role | want | experience | guide | linkedin | photo`

**updates**

`timestamp | status | title | body`

**guests**

`timestamp | status | name | note | sortOrder | photo`

**students**

`timestamp | status | name | role | linkedin | sortOrder | photo`

The `status` column is used for moderation. Only `approved` rows are returned by the public API. Do not put private contact details, internal notes, or sensitive information in public fields.

## 2. Install the read-only Apps Script

1. Open the Google Sheet.
2. Choose **Extensions → Apps Script** to create a script bound to the Sheet.
3. Replace `Code.gs` with `apps-script/website-backend/Code.gs`.
4. In Project Settings, enable **Show appsscript.json manifest file in editor**.
5. Replace the manifest with `apps-script/website-backend/appsscript.json`.
6. Save, then choose **Deploy → New deployment → Web app**.
7. Execute as **Me** and set access to **Anyone** so public visitors can read published content.
8. Authorise and copy the `/exec` URL.

The manifest requests `spreadsheets.currentonly`. Keep the script bound to the intended Sheet and verify the OAuth consent screen and scopes before authorising. Do not change `getBook()` to `openById()` without reviewing the permissions implications.

### Test the endpoint

Open `YOUR_WEB_APP_EXEC_URL?action=all`. It should return JSON containing `profiles`, `updates`, `guests`, and `students`. If an array is empty, check the tab name, headers, and `status = approved`.

## 3. Connect the website

Open `website/index.html` and search for `PASTE_YOUR_APPS_SCRIPT_EXEC_URL_HERE`. Replace it with your deployed `/exec` URL. Update the organisation name, logo, event date, venue, copy, RSVP link, and contact details. Search for `YOUR-` placeholders.

## 4. Deploy to Netlify

1. Push the repository to your Git hosting account.
2. In Netlify, choose **Add new site → Import an existing project**.
3. Select this repository. Set the publish directory to `website`. No build command is required.
4. Deploy.

## 5. Day-to-day content management

- **Profiles:** Add or update rows in `profiles`. Set `status` to `approved` to publish.
- **Updates:** Add rows to `updates`, fill `title` and `body`, and set `status` to `approved`.
- **Guests:** Add rows to `guests`, set `status` to `approved`, and use `sortOrder` to control display order (lower first).
- **Students:** Add rows to `students`, set `status` to `approved`, and use `sortOrder` to control display order. Obtain permission before publishing names, photos, or LinkedIn links.

The website caches data in the visitor's session for five minutes. A hard refresh or a new session can fetch updated content sooner.

## Security model and limitations

- The public API is read-only. There is no public write handler in this edition.
- The API returns only rows with `status = approved`.
- The API returns only fields listed in `PUBLIC_FIELDS` in `Code.gs`. Add a field to that allowlist only after deciding it is safe for public display.
- Anything returned by the public API should be treated as public and can be copied by visitors.
- Keep the Google Sheet private. Share editor access only with trusted organisers.
- Do not commit real RSVP exports, attendee lists, personal contact details, credentials, or private deployment configuration.
- This is a lightweight template, not a substitute for a security review or a dedicated backend for high-risk or high-volume use.

## Optional RSVP synchronisation

An organiser may add a separate, private Apps Script project to import confirmed RSVP records into the master Sheet. Keep that automation separate from the public website backend. Do not add credentials, real attendee data, or private source-system mappings to this repository.

## License

The original source code is released under the MIT License. Logos, photographs, fonts, icons, and other third-party assets added by adopters remain subject to their respective owners’ terms and are not automatically covered by this repository’s code license. See `ASSET-LICENSE.md`.
