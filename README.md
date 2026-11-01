# Yugal Kunj Inventory Management System

This is a single-organization inventory MVP for Yugal Kunj. It gives staff a shared catalog for tracking products and stock levels. It was built as a working demonstration for a Georgia Governor's Honors Program Computer Science interview.

## Main features

- Email-and-password sign-up and sign-in.
- Create, edit, delete, search, sort, filter, and paginate products.
- Product images, prices, quantities, optional SKUs, custom low-stock thresholds, purchase links, and descriptive details.
- Dashboard statistics, stock alerts, recent products, and recent changes.
- Audit history showing the action, product, acting user, and change details.
- Authenticated CSV and Excel inventory exports.

A product with quantity zero is out of stock. A positive quantity at or below its threshold is low stock. The default threshold is 5; a custom threshold of 0 disables low-stock warnings.

## Technology stack and architecture

The application uses Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Better Auth, and Zod. Server-rendered pages query the database through Prisma. Server actions validate product forms and write products. Each successful product write and its audit entry are committed in the same database transaction. Client components handle interactive forms, search, sorting, and dialogs. A protected API route creates CSV or XLSX exports.

The PostgreSQL schema contains products, audit logs, and Better Auth's user, session, account, and verification tables. All signed-in users share the same inventory; the product creator and audit actor are recorded for attribution. There is no per-user inventory isolation or role system.

## Local installation

1. Install Node.js 22.18 or later, npm, and PostgreSQL. The test command uses Node's built-in TypeScript type stripping, which is enabled by default starting in Node.js 22.18.
2. Run npm ci in the project folder.
3. Create a local .env file containing these environment variable names:
   - DATABASE_URL — PostgreSQL connection string.
   - BETTER_AUTH_SECRET — long random secret for authentication.
   - BETTER_AUTH_URL — application base URL.
4. Run npx prisma migrate deploy to apply the existing migrations.
5. Run npx prisma generate if the Prisma client was not generated during installation.
6. Run npm run dev and open the URL shown in the terminal (normally http://localhost:3000).

Do not commit .env or any real credentials. The existing prisma/seed.ts script is optional. No production migration is required for the changes in this review.

## Commands

- npm run dev — start the development server.
- npm test — run the TypeScript unit tests with Node's built-in test runner.
- npm run lint — run ESLint.
- npm run build — create a production build.
- npm start — serve an existing production build.

Stop the development server before running the production build in the same checkout. Next.js 15 uses .next for both operations, and concurrent runs can interfere with each other.

## Current limitations and future improvements

This MVP stores image data URLs in PostgreSQL. It accepts PNG and JPEG uploads up to 6 MB and checks their file signatures, but it does not fully decode images or strip metadata. Object storage and full image processing would be reasonable future work. Sign-up is open to anyone who can reach the application; there is no account approval workflow. The dashboard and stock-status sort load product data into memory, which suits a small catalog but would need a different approach at larger scale. Duplicate names are checked in application code, so simultaneous requests could create case-insensitive duplicates. The database has a unique constraint on SKU, but that constraint is case-sensitive. Fixing those concurrency and case rules would require a reviewed database migration. Unit tests cover validation, image signatures, stock status, pagination, and CSV cells; authenticated end-to-end flows against a separate test database remain future work.
