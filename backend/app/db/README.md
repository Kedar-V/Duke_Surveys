# Projects Website Schema

This folder contains the PostgreSQL schema used for the projects website tables.

## Apply schema

Run the schema file against your database:

```sh
psql "$DATABASE_URL" -f schema.sql
```

## Docker Compose

If you are using the provided `docker-compose.yml`, you can run:

```sh
docker compose exec -T postgres psql -U webapp -d webapp -f /app/app/db/schema.sql
```

## Seed dummy data (frontend catalog)

Generate SQL from `frontend/src/data/projectsCatalog.js`:

```sh
python /app/app/db/seed_projects.py
```

Apply it to Postgres:

```sh
docker compose exec -T postgres psql -U webapp -d webapp -f /app/app/db/seed_projects.sql
```

## Notes

- Tables are namespaced alongside the existing survey tables.
- UUIDs are expected to be generated in the application layer.
