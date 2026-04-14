# Doctor Appointment Monorepo

This repository is organized as an npm workspaces monorepo with shared packages and a Next.js app.

## Structure

```
apps/
  web/                  # Next.js app
packages/
  ui-components/        # Reusable UI components
  utils/                # Shared utilities
  feature-appointments/ # Appointment system (feature-x)
  feature-patients/     # Patient management system (feature-y)
```

## Setup

1. Install dependencies from the repo root:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

The app runs at http://localhost:3000.

## Packages

- `ui-components`: Buttons, inputs, cards used by features and the app.
- `utils`: Date formatting, string helpers, and small utilities.
- `feature-appointments`: Appointment booking, reschedule, and availability UI.
- `feature-patients`: Patient registration and patient listing UI.

## Ownership / Assignments

- Brook: packages/ui-components
- Sami: packages/utils
- Piv: packages/feature-appointments
- Aman: packages/feature-patients
- Sol: apps/web integration and demo pages
- Yoni: root monorepo docs and structure

## Notes

- Feature packages are imported into the Next.js app using workspace dependencies.
- If you change packages, restart the dev server to see updates.
