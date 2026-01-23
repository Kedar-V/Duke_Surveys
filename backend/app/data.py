from typing import Dict, List, Any
import pandas as pd
import re
from pathlib import Path


BASE_DIR = Path(__file__).parent
print(BASE_DIR)
ROSTER_CSV = BASE_DIR / "data/roster.csv"
MENTORS_CSV = BASE_DIR / "data/mentor.csv"


def _slugify_member_id(name: str) -> str:
    if "," in name:
        last, first = [x.strip() for x in name.split(",", 1)]
        first = first.split()[0]
        base = f"{first}_{last}"
    else:
        parts = name.split()
        base = "_".join(parts[:2])

    base = base.lower()
    base = re.sub(r"[^a-z0-9_]+", "_", base)
    return base.strip("_")


def load_team_data() -> Dict[str, Dict[str, Any]]:
    roster = pd.read_csv(ROSTER_CSV)
    mentors = pd.read_csv(MENTORS_CSV)

    roster = roster.dropna(subset=["group_name", "name"])
    mentors = mentors.dropna(subset=["group_name", "mentor_name"])

    roster["group_name"] = roster["group_name"].astype(str).str.strip()
    mentors["group_name"] = mentors["group_name"].astype(str).str.strip()

    df = roster.merge(mentors, on="group_name", how="left")

    TEAM_DATA: Dict[str, Dict[str, Any]] = {}

    for group, g in df.groupby("group_name", sort=True):
        team_name = f"Team {group}"
        mentor_name = g["mentor_name"].iloc[0]

        members = []
        seen = set()

        for _, row in g.sort_values("name").iterrows():
            mid = _slugify_member_id(row["name"])
            if mid in seen:
                mid = f"{mid}_{row['user_id']}"
            seen.add(mid)

            members.append(
                {"id": mid, "name": row["name"]}
            )

        TEAM_DATA[team_name] = {
            "mentor_name": mentor_name,
            "members": members,
        }

    return TEAM_DATA


# Load once at import time (cached)
TEAM_DATA = load_team_data()


def list_teams() -> List[str]:
    return sorted(TEAM_DATA.keys())


def get_team(team_name: str) -> Dict[str, Any]:
    if team_name not in TEAM_DATA:
        raise KeyError(f"Unknown team: {team_name}")
    return TEAM_DATA[team_name]


# from typing import Dict, List, Any

# TEAM_DATA: Dict[str, Dict[str, Any]] = {
#     "Team A": {
#         "mentor_name": "Alice",
#         "members": [
#             {"id": "paul_hicks", "name": "Hicks, Paul"},
#             {"id": "brenda_johnson", "name": "Johnson, Brenda"},
#             {"id": "kayla_ward", "name": "Ward, Kayla"},
#         ],
#     },
#     "Team B": {
#         "mentor_name": "Bob",
#         "members": [
#             {"id": "sam_lee", "name": "Lee, Sam"},
#             {"id": "nina_patel", "name": "Patel, Nina"},
#         ],
#     },
# }

# def list_teams() -> List[str]:
#     return sorted(TEAM_DATA.keys())

# def get_team(team_name: str) -> Dict[str, Any]:
#     if team_name not in TEAM_DATA:
#         raise KeyError(f"Unknown team: {team_name}")
#     return TEAM_DATA[team_name]
