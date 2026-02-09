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

## Intake Edit Link + SES Email

Set these environment variables to send edit links via AWS SES:

- `SES_SENDER_EMAIL`: Verified SES sender email address.
- `AWS_REGION` or `SES_REGION`: AWS region for SES (e.g. `us-east-1`).
- `INTAKE_EDIT_BASE_URL`: Base URL for edit links (e.g. `http://3.91.188.75:5173/clientinfo`).

Example:

```sh
SES_SENDER_EMAIL="kv133@duke.edu"
AWS_REGION="us-east-1"
INTAKE_EDIT_BASE_URL="http://3.91.188.75:5173/clientinfo"
```
