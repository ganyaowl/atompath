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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Fast Docker deployment with host Caddy

This setup does not claim ports `80` or `443`. The application container listens on
`127.0.0.1:3001`, and the Caddy instance already serving the host proxies the public
domain to that address. SQLite data is stored in the named Docker volume
`atompath-data`.

### 1. Build and start the application

```bash
cd /opt/atompath
docker compose up -d --build

curl -I http://127.0.0.1:3001
docker compose ps
```

To provision a company or regional account inside the running container:

```bash
docker exec -it atompath node scripts/provision-user.mjs \
  --role company \
  --email company@example.com \
  --name "Organization name"
```

### 2. Attach it to the existing Caddy service

Point the `ganyaowl.uz` DNS `A`/`AAAA` record at the server and install the
included site configuration:

```bash
sudo install -d -m 0755 /etc/caddy/sites
sudo install -m 0644 Caddyfile /etc/caddy/sites/atompath.caddy
sudo grep -qF 'import /etc/caddy/sites/*.caddy' /etc/caddy/Caddyfile \
  || echo 'import /etc/caddy/sites/*.caddy' | sudo tee -a /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy obtains and renews TLS certificates automatically once DNS resolves and the
existing Caddy service can receive public traffic on ports `80` and `443`.

### 3. Fast update

```bash
cd /opt/atompath
git pull --ff-only
docker compose up -d --build
```

The named volume survives container replacement. Before an important update, back
up SQLite with:

```bash
docker cp atompath:/app/data/database.db "./database.db.backup-$(date +%F-%H%M%S)"
```

Useful checks:

```bash
docker compose logs --tail=100 app
docker inspect --format='{{.State.Health.Status}}' atompath
curl -I https://ganyaowl.uz
```
