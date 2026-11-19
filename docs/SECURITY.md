# Security notes

This edition deliberately removes public profile submissions and has no `doPost()` handler. The only public operation is `doGet?action=all`.

Before deployment:

- Keep the spreadsheet private and share it only with trusted editors.
- Keep private data out of the four public tabs.
- Review the `PUBLIC_FIELDS` allowlist before adding fields.
- Verify Apps Script is bound to the correct spreadsheet and review the OAuth scopes.
- Treat the deployed `/exec` response as public information.
- Do not publish real RSVP exports, phone numbers, personal email addresses, internal notes, or credentials.
- Back up the Sheet and restrict who can edit the Netlify site and source repository.

The API's approval filter is a publishing control, not authentication. Anyone can read the fields returned by the public endpoint.
