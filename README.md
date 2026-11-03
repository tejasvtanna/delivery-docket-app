# Delivery Docket App

A modern Next.js application to create, print, and track delivery dockets with automated customer pricing, driver allocation, and seamless export to Xero for invoicing.

## Features

- **Delivery Docket Management:** Create, view, search, and delete delivery dockets.
- **Printable Dockets:** Print formatted PDF delivery dockets with customizable terms and conditions.
- **Xero Integration:** One-click batch invoice generation directly into Xero without duplicate billing.
- **Customer & Product Management:** Maintain customer records, customized price overrides, and product inventory.
- **Modern Stack:** Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma ORM, and PostgreSQL.

## Getting Started

1. Clone repository:
   ```bash
   git clone https://github.com/tejasvtanna/delivery-docket-app.git
   cd delivery-docket-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env`:
   ```env
   DATABASE_URL="your-postgres-connection-string"
   XERO_CLIENT_ID="your-xero-client-id"
   XERO_CLIENT_SECRET="your-xero-client-secret"
   XERO_REDIRECT_URI="http://localhost:3000/api/xero-callback"
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## License

[MIT](LICENSE.md)
