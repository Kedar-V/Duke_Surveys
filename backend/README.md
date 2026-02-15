# Backend Configuration

## Postgres RDS

Set the following environment variables for Postgres connections:

- `DATABASE_URL`: SQLAlchemy Postgres URL (driver included).

Example:

```sh
DATABASE_URL="postgresql+psycopg2://postgres:postgresduke@duke-capstone.cnwm886wwadv.us-east-1.rds.amazonaws.com:5432/postgres"
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
