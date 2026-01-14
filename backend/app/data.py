from typing import Dict, List, Any

TEAM_DATA: Dict[str, Dict[str, Any]] = {
    "Team A": {
        "mentor_name": "Alice Mentor",
        "members": [
            {"id": "paul_hicks", "name": "Hicks, Paul"},
            {"id": "brenda_johnson", "name": "Johnson, Brenda"},
            {"id": "kayla_ward", "name": "Ward, Kayla"},
        ],
    },
    "Team B": {
        "mentor_name": "Bob Mentor",
        "members": [
            {"id": "sam_lee", "name": "Lee, Sam"},
            {"id": "nina_patel", "name": "Patel, Nina"},
        ],
    },
}

def list_teams() -> List[str]:
    return sorted(TEAM_DATA.keys())

def get_team(team_name: str) -> Dict[str, Any]:
    if team_name not in TEAM_DATA:
        raise KeyError(f"Unknown team: {team_name}")
    return TEAM_DATA[team_name]
