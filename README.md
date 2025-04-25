# Data Listing Portal

A monorepo with three Next.js applications using Turborepo and Supabase.

## Project Structure

- `apps/web_app`: Main web application (runs on port 3000)
- `apps/data_operator_panel`: Panel for data operators (runs on port 3001)
- `apps/super_admin_panel`: Panel for administrators (runs on port 3002)
- `packages/ui`: Shared UI components

## Prerequisites

- Node.js (v14 or newer)
- npm (v8 or newer)

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Data_listing_portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Each application already has a `.env.local` file configured with Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://kjhgbrywkzhnjqziofvq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqaGdicnl3a3pobmpxemlvZnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MTQ2ODYsImV4cCI6MjA2MTE5MDY4Nn0._EgFJRs_-vJvJALd5oM0tFl14BTxpI08hfy5je_TjP4
```

### Running the Project

To run all applications in development mode:

```bash
npm run dev
```

This will start the development servers for all applications. The ports may vary based on what's available on your system, but typically:
- Web App: http://localhost:3000
- Data Operator Panel: http://localhost:3001
- Super Admin Panel: http://localhost:3002

### Running Individual Applications

To run a specific application:

```bash
# Run web_app
cd apps/web_app
npm run dev

# Run data_operator_panel
cd apps/data_operator_panel
npm run dev

# Run super_admin_panel
cd apps/super_admin_panel
npm run dev
```

### Building

To build all applications:

```bash
npm run build
```

## Features

- Monorepo structure using Turborepo
- Three Next.js applications
- Shared UI package
- Supabase integration for database and authentication

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed correctly:
   ```bash
   npm install
   ```

2. If you see errors related to missing SWC dependencies, try reinstalling Next.js in the specific app:
   ```bash
   cd apps/<app-name>
   npm uninstall next
   npm install next
   ```

3. Ensure your Node.js and npm versions meet the requirements (Node.js v14+ and npm v8+).

## Notes

- Each application is configured with the same Supabase account
- The UI package is shared across all applications
- TypeScript is used for type safety
- Tailwind CSS is used for styling
