# JobOnFire

## Quick start

Prerequisites:

- `node >= 22.9.0`
- `pnpm >= 9.12.2`

Run mariadb database - you can use provided docker-compose.yml script (just run
`docker-compose up`, or any other `docker-compose` implementation).

Install dependencies:

```console
pnpm i
```

Run backend:

```console
cd app-server
pnpm prisma db push
pnpm dev
```

Run frontend:

```console
cd app-client
pnpm dev
```

## Database management

```console
cd zerowaste-server
pnpm prisma studio
```