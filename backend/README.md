# Backend Configuration

## AWS DocumentDB

Set the following environment variables for DocumentDB connections:

- `MONGO_URL`: DocumentDB connection string (with username/password/replica set params).
- `MONGO_DB`: Database name.
- `MONGO_TLS`: `true` to enable TLS (required for DocumentDB).
- `MONGO_TLS_CA_FILE`: Path to the AWS DocumentDB CA bundle in the container.
- `MONGO_TLS_ALLOW_INVALID_HOSTNAMES`: `true` only for non-production testing.
- `MONGO_RETRY_WRITES`: `false` for DocumentDB (recommended).

Example:

```sh
MONGO_URL="mongodb://user:pass@docdb-cluster.cluster-xxxxxx.us-east-1.docdb.amazonaws.com:27017/?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false"
MONGO_DB="surveydb"
MONGO_TLS="true"
MONGO_TLS_CA_FILE="/app/certs/rds-combined-ca-bundle.pem"
MONGO_RETRY_WRITES="false"
```

## Intake Edit Link + Gmail SMTP

Set these environment variables to send edit links via Gmail SMTP:

- `SMTP_HOST`: SMTP host (default: `smtp.gmail.com`).
- `SMTP_PORT`: SMTP port (default: `587`).
- `SMTP_USER`: Gmail address or SMTP username.
- `SMTP_PASSWORD`: Gmail App Password (recommended) or SMTP password.
- `SMTP_SENDER_EMAIL`: Sender email shown in the message (defaults to `SMTP_USER`).
- `INTAKE_EDIT_BASE_URL`: Base URL for edit links (e.g. `http://3.91.188.75:5173/clientinfo`).

Example:

```sh
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="kv133@duke.edu"
SMTP_PASSWORD="<app-password>"
SMTP_SENDER_EMAIL="kv133@duke.edu"
INTAKE_EDIT_BASE_URL="http://3.91.188.75:5173/clientinfo"
```
