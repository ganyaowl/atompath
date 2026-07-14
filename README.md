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

## Docker deployment with automatic HTTPS

Docker Compose runs both Atompath and Caddy. They share a private Compose network,
so Caddy proxies to `app:3000`; no host Caddy installation or manual config copying
is required. SQLite and Caddy certificates are stored in named Docker volumes.

### 1. Prepare DNS and ports

[`Caddyfile`](Caddyfile) currently serves `atompath.ganyaowl.uz`. At the DNS
provider, create an `A` record named `atompath` pointing to the server's public
IPv4 address. Create an `AAAA` record only if the server has working public IPv6.

Check DNS before starting Caddy:

```bash
dig +short A atompath.ganyaowl.uz
dig +short AAAA atompath.ganyaowl.uz
```

TCP ports `80` and `443` must be free and allowed by the firewall. UDP `443` is
optional and enables HTTP/3. Stop any previous host or container reverse proxy
that owns these ports:

```bash
sudo systemctl disable --now caddy 2>/dev/null || true
sudo ss -ltnp | grep -E ':(80|443)\\s' || true
```

### 2. Build and start the stack

```bash
cd /opt/atompath
docker compose up -d --build

curl -I http://127.0.0.1:3001
docker compose ps
docker compose logs --tail=100 caddy
```

Caddy obtains and renews the TLS certificate automatically. Its certificate data
survives container replacement in the `atompath-caddy-data` volume.

To provision a company or regional account inside the running container:

```bash
docker exec -it atompath node scripts/provision-user.mjs \
  --role company \
  --email company@example.com \
  --name "Organization name"
```

Verify the public route:

```bash
curl -I https://atompath.ganyaowl.uz
docker compose logs --tail=100 caddy
```

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
docker compose logs --tail=100 app caddy
docker inspect --format='{{.State.Health.Status}}' atompath
curl -I https://atompath.ganyaowl.uz
```

After editing `Caddyfile`, validate and reload it without replacing containers:

```bash
docker compose exec caddy caddy validate --config /etc/caddy/Caddyfile
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### GitHub Actions deployment

The workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
runs tests and lint on pull requests. A push to `main` builds the application image
on a GitHub-hosted runner, pushes it to GHCR, and deploys it over SSH. The production
server only pulls the finished image, so it does not need enough RAM to run
`next build`.

Add this repository secret under **Settings → Secrets and variables → Actions**:

- `ORACLE_SSH_KEY`: the complete private key from
  `~/.ssh/github_actions_oracle`, including its BEGIN/END lines. Never commit this
  value to the repository.

The public SSH endpoint (`ubuntu@atompath.ganyaowl.uz`) is declared directly in
the workflow; a host or username secret is not required.

The matching public key must be present in the server's `authorized_keys`:

```bash
grep -qFf ~/.ssh/github_actions_oracle.pub ~/.ssh/authorized_keys \
  || cat ~/.ssh/github_actions_oracle.pub >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

No GHCR secret is required. The workflow uses its short-lived `GITHUB_TOKEN` to
push the image and to authenticate the server for the corresponding pull. The
Compose image is `ghcr.io/ganyaowl/atompath:latest`; the workflow also publishes
an immutable tag matching the Git commit SHA.

### Slow build troubleshooting

The warning about `prebuild-install@7.1.3` comes from `sqlite3`; it does not stop
the build. `sqlite3@6.0.1` is already the newest release and still declares that
deprecated installer, so an override is not a safe fix.

If a tiny `sha256:...` layer from `node:24-trixie-slim` takes several minutes,
the delay is between Docker and Docker Hub (or its CDN), not npm and not the size
of the layer. Pull the base image separately to make the failing operation clear:

```bash
docker pull node:24-trixie-slim
docker compose build --progress=plain app
```

After one successful pull, omit `--pull` during normal deployments so Docker can
reuse the cached base image. Use `--pull` only when intentionally checking for a
new base image. If the separate pull still stalls, fix the server's DNS, proxy,
firewall, or Docker Hub connectivity; changing the npm dependency cannot affect
that download.
