# Unlimited Landing Page Website Backup

sajibenterprise.online
এই ওয়েবসাইট এর মত আমাকে একটা ইকমার্স ওয়েবসাট বানিয়ে দিবে
তবে এটার থেকে আমাদের অনেক অ্যাডভান্স ফিচার থাকবে
হোম পেজে অফার কাউন্ট ডাউন লাগবে না আমার ওয়েবসাইট এ

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://unlimited-landing-page-website-backup.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/be4551c6-860f-447d-b6f8-989ce8b44b40).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

This project runs on Cloudflare Pages Functions, D1, R2 and custom JWT.
Use Node 24 and npm:

```sh
npm ci
npm run setup:local
npm run build
npm run dev:api
```

For frontend hot reload, run `npm run dev` in a second terminal. Vite proxies
API requests to the Pages Functions server. See [Cloudflare setup](docs/cloudflare.md)
for bindings, schema, authentication, admin enrollment and validation commands.

The complete new-database schema is [cloudflare/schema.sql](cloudflare/schema.sql).
Existing databases must use the incremental migration runner described in the docs.
