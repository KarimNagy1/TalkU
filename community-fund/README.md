# TalkU Community Fund — Local Prototype

A no-dependency bilingual (English/Arabic) website prototype for tracking community donations and spending.

## Run on Windows

1. Extract the ZIP.
2. Open the `talku-community-fund` folder.
3. Double-click `index.html` to open it in a modern browser.

No Node.js, server, payment provider, or hosting account is required for this local prototype.

## Features

- English / Arabic language switch, with right-to-left layout in Arabic.
- Monthly donation goal, donations received, money spent, and money left at month end.
- Public record of donations and spending, showing only the name approved for public display.
- Separate private donor name and public display name, with permission required before showing a real name publicly.
- Separate “paid to” field for spending records.
- Monthly history and month settings.
- Local browser storage, public records CSV download, and private JSON backup.
- Delete/reset controls for testing.

## Important limitations

- This is a local prototype, not a secure online service.
- Records are stored in this browser on this device. They do not sync to another device or to other administrators.
- The management screen has no login. Do not use it for real donor information or real financial records.
- Local storage and exported backups are not protected. The JSON backup contains private donor names. Keep it private.
- An online version needs a server-side database, secure administrator login, access controls, a history of changes, backups, and server-side protection of private donor details.
- The amount brought forward from the previous month is editable in this prototype. The online version should calculate it from the previous month’s final amount, with any correction clearly recorded.
- The example records and amounts are fictional and must be replaced before launch.
