This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## COD prepayment

Set `COD_PREPAYMENT_PERCENT=15` in the deployment environment (also configured in local `.env`).
Valid values are greater than 0 and less than 100, with up to two decimal places; the default is 15.
Cash-on-delivery prepayment is calculated after all discounts, rounded up to the next 10 UAH,
with a minimum of 150 UAH. When prepayment reaches the order value, only full card payment is available.
Redeploy after changing the percentage so pre-rendered payment descriptions and checkout use the same setting.

`Order.totalAmount` stores the initial payment, not the full goods value for cash-on-delivery orders.
TTN, Telegram and both Checkbox receipts use this saved amount, so existing orders keep their original
prepayment after configuration changes. The goods value is the sum of saved order item prices × quantities.
No database migration is needed for this setting.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
