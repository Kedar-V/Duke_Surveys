import os
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ServerSelectionTimeoutError

_client: MongoClient | None = None

def get_mongo():
    """
    Returns a handle to the Mongo database.
    Uses a single global MongoClient (connection pool) per process.
    """
    global _client
    if _client is None:
        # IMPORTANT:
        # - In docker compose, backend must connect to hostname "mongodb"
        # - On host (no docker), localhost is fine
        url = os.environ.get("MONGO_URL", "mongodb://mongodb:27017")

        _client = MongoClient(
            url,
            serverSelectionTimeoutMS=3000,
            connectTimeoutMS=3000,
            socketTimeoutMS=10000,
            maxPoolSize=50,
            minPoolSize=5,
            retryWrites=True,
        )

    dbname = os.environ.get("MONGO_DB", "surveydb")
    return _client[dbname]

def ping() -> bool:
    try:
        get_mongo().command("ping")
        return True
    except ServerSelectionTimeoutError:
        return False

def ensure_indexes():
    db = get_mongo()

    # survey sessions (idempotent)
    db.survey_sessions.create_index([("session_id", ASCENDING)], unique=True)
    db.survey_sessions.create_index([("team_key", ASCENDING), ("submitted_at", DESCENDING)])
    db.survey_sessions.create_index([("status", ASCENDING), ("updated_at", DESCENDING)])

    # teams (idempotent)
    db.teams.create_index([("team_key", ASCENDING)], unique=True)
    db.teams.create_index([("team_name", ASCENDING)])

    # client intake forms (idempotent)
    db.client_intake_forms.create_index([("created_at", DESCENDING)])
    db.client_intake_forms.create_index([("company_name", ASCENDING)])

    # TTL index (restart-safe)
    desired_ttl = 1200  # 20 minutes
    index_name = "ttl_in_progress_sessions"
    desired_filter = {"status": "IN_PROGRESS"}

    existing = {idx["name"]: idx for idx in db.survey_sessions.list_indexes()}
    idx = existing.get(index_name)

    if idx is None:
        # Create only if it does not exist
        db.survey_sessions.create_index(
            [("updated_at", ASCENDING)],
            expireAfterSeconds=desired_ttl,
            partialFilterExpression=desired_filter,
            name=index_name,
        )
        return

    # OPTIONAL (recommended): if it exists but differs, do NOT crash; fix it deterministically
    existing_ttl = idx.get("expireAfterSeconds")
    existing_filter = idx.get("partialFilterExpression")

    if existing_ttl != desired_ttl or existing_filter != desired_filter:
        db.survey_sessions.drop_index(index_name)
        db.survey_sessions.create_index(
            [("updated_at", ASCENDING)],
            expireAfterSeconds=desired_ttl,
            partialFilterExpression=desired_filter,
            name=index_name,
        )

