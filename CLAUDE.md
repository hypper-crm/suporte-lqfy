# Support & Implementation Board: Web App

## Goal

A professional internal tool for the support team to track clients through two kanban boards: "Support" and "Implementation". Built as a web app with PWA support.

## Tech stack

- React + Vite + TypeScript
- vite-plugin-pwa for the web app manifest and app shell service worker
- Tailwind CSS
- @dnd-kit/core and @dnd-kit/sortable for drag and drop
- @supabase/supabase-js for auth, database, realtime and storage
- The database schema is already applied in Supabase (see schema.sql)

## Naming conventions

- All code, identifiers, file names, UI labels and comments in English.
- Clear, descriptive names. No abbreviations.
- Database columns are snake_case.
- TypeScript types and components are PascalCase. Variables and functions are camelCase.

## Database reference

Tables: `profiles`, `clients`, `board_columns`, `cards`, `card_attachments`.

- `profiles`: id, full_name, created_at
- `clients`: id, name, email, niche, pay_in_rate, pay_out_rate, created_at, updated_at
- `board_columns`: id, board ('support' | 'implementation'), name, position
- `cards`: id, board, column_id, title, description, client_id, assignee_id, start_date, position, created_by, created_at, updated_at
- `card_attachments`: id, card_id, storage_path, file_name, mime_type, file_size, uploaded_by, created_at

Storage bucket: `card-attachments` (private, 20 MB max).

## Functional requirements

### Authentication

- Sign up and sign in with email and password through Supabase Auth.
- Sign up asks for full name, sent as user metadata under `full_name`.
- Email confirmation is disabled in Supabase, so no confirmation step is needed.
- Protected routes: unauthenticated users see only the login screen.
- Sign out button available in the header.

### Navigation

- Two screens: "Support" and "Implementation", switchable from a header tab bar.
- Also a "Clients" screen (see Clients).
- Each board loads its columns from `board_columns`, filtered by `board`, ordered by `position`.

### Kanban board

- Drag and drop cards between columns and reorder cards within a column.
- On drop, update `column_id` and `position` in `cards`.
- "Add card" button at the bottom of each column.
- Card fields: `title`, `client_id` (single-select client), `start_date`, `description`.
- Each card shows: title, client name, start date, and the assignee's initials.

### Card details (opened by clicking a card)

- Client information panel: name, email, niche, pay-in rate, pay-out rate, read from the linked client.
- Editable fields: title, description, start date, client (single select), assignee.
- Assignee: select a team member from `profiles` to assign or delegate the card. Allow unassigned.
- Attachments:
  - Upload files to the `card-attachments` bucket and register each one in `card_attachments`, saving `file_name`, `mime_type` and `file_size`.
  - Accepted types: PNG, JPG, WEBP, GIF, PDF, DOC/DOCX, XLS/XLSX, CSV, TXT, ZIP. Validate the type and the 20 MB limit before uploading and show a clear message if rejected.
  - Images show as thumbnails in a gallery. Opening an image shows it at full size.
  - Other files show a type icon, the file name and the size.
  - Actions for every attachment: open or download (using a signed URL from Supabase Storage) and delete.
- Delete the card with a confirmation step.

### Clients

- Screen to list, create, edit and delete clients: name, email, niche, pay-in rate, pay-out rate.
- Rates are stored as numbers and displayed with a percentage sign and two decimal places.
- Clients are picked in cards from this list.

### Realtime

- Subscribe to changes on `cards`, `board_columns`, `clients` and `card_attachments`, so every team member sees updates without refreshing.

## Security rules

- Use only the Supabase anon key, loaded from environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Never include the service role key in the app.
- Do not store application data in localStorage. The Supabase session may use its default storage.
- Never log tokens or user data to the console.

## ## Delivery in stages

1. Project setup. (done)

2. Authentication. (done)

3. Kanban boards. (done)

4. Clients. (done)

5. Card details and attachments. (done)

6. Cancelled.

7. Design: visual polish for all screens.

## Code quality

- Keep components small and focused.
- Put all Supabase calls in a `src/services` folder, not inside components.
- Define shared types in `src/types`, mirroring the database schema.
- Every data operation shows loading and error states with a clear message.
- Add a `.gitignore` that excludes `.env` and `node_modules`.
- Write a README with setup steps, environment variables, and how to deploy the app.

## Reporting rules

- Do not write summaries, recaps or "how to test" guides at the end of a stage.
- At the end of a stage, report only:
  1. The result of `npm run build` (pass or fail).
  2. Any error that remains unresolved, with the exact message.
  3. The line: "Waiting for confirmation before stage N+1."
- Do not explain what was implemented unless I ask.

## Design rules (until stage 6)

- Use simple, functional layout with Tailwind utility classes.
- Do not spend effort on visual polish, animations, colors or spacing refinement.
- Keep markup readable and componentized so styling can be changed later.