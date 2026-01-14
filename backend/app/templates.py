from typing import Dict, Any, List

def intro_block(teams: List[str]) -> Dict[str, Any]:
    return {
        "block_id": "intro",
        "title": "Intro and Project Selection",
        "elements": [
            {
                "type": "display",
                "text": (
                    "Thank you for working with our students! This survey is designed to gather feedback on "
                    "overall team performance as well as individual contributions. The results will be "
                    "incorporated into each student’s grade for the Capstone course. If you are mentoring "
                    "more than one project, please complete a separate survey for each project."
                ),
            },
            {
                "type": "select",
                "question_id": "ProjectTeam",
                "label": "Please select the project team you are evaluating today.",
                "required": True,
                "options": [{"value": t, "label": t} for t in teams],
            },
        ],
    }

def mentor_confirmation_block(team_name: str, mentor_name: str) -> Dict[str, Any]:
    return {
        "block_id": "mentor_confirmation",
        "title": "Mentor Confirmation",
        "elements": [
            {
                "type": "display",
                "text": f'Our records show that you are the mentor for "{team_name}":\n{mentor_name}.',
            },
            {
                "type": "text",
                "question_id": "MentorNameOverride",
                "label": "If this name is not correct, please enter your name here.",
                "required": False,
            },
        ],
    }

def overall_performance_block(team_name: str) -> Dict[str, Any]:
    return {
        "block_id": "overall_performance",
        "title": "Overall Performance",
        "elements": [
            {"type": "display", "text": "Section 1: Overall team performance"},
            {
                "type": "slider",
                "question_id": "OverallSatisfaction",
                "label": (
                    "Please rate the team’s overall productivity and your satisfaction with their "
                    "performance on a scale of 1–10 (10 = very satisfied; scores of 7 or below indicate some level of concern)."
                ),
                "min": 1,
                "max": 10,
                "required": True,
            },
            {
                "type": "number",
                "question_id": "ClientMeetings",
                "label": "How many client meetings have you attended?",
                "required": True,
            },
            {
                "type": "number",
                "question_id": "HoursPerWeek",
                "label": "Approximately how many hours per week, on average, did you spend working with the team this semester?",
                "required": True,
            },
        ],
    }

def client_communication_block(team_name: str) -> Dict[str, Any]:
    qs = [
        ("CommWithClient", "How effectively did the students communicate their progress to the client(s) throughout the semester?"),
        ("AlignWithClient", "How well did the students’ work align with the clients’ interests, needs, and stated goals?"),
        ("CriticalThinking", "To what extent did the students demonstrate critical thinking about their problem, for example, by asking thoughtful, clarifying questions or raising important issues?"),
        ("Independence", "To what extent did the students independently propose solutions (score = 10) versus relying on your guidance to determine detailed next steps (score = 0)?"),
    ]
    return {
        "block_id": "client_communication",
        "title": "Client Communication",
        "elements": (
            [{"type": "display", "text": "Section 2: Communication with client and problem solving"}]
            + [
                {
                    "type": "slider",
                    "question_id": k,
                    "label": v,
                    "min": 0,
                    "max": 10,
                    "required": True,
                }
                for k, v in qs
            ]
        ),
    }

def member_evaluation_block(member_name: str) -> Dict[str, Any]:
    return {
        "block_id": "member_evaluation",
        "title": f"Member – {member_name}",
        "elements": [
            {"type": "display", "text": f"Now thinking specifically about {member_name}:"},
            {
                "type": "slider",
                "question_id": "MemberCommunication",
                "label": f"How would you rate {member_name}'s Communication skills",
                "min": 0,
                "max": 10,
                "required": True,
            },
            {
                "type": "slider",
                "question_id": "MemberTechnical",
                "label": f"How would you rate {member_name}'s Technical contribution",
                "min": 0,
                "max": 10,
                "required": True,
            },
            {
                "type": "slider",
                "question_id": "MemberReliability",
                "label": f"How would you rate {member_name}'s Reliability and accountability",
                "min": 0,
                "max": 10,
                "required": True,
            },
            {
                "type": "text",
                "question_id": "MemberFeedback",
                "label": f"Open-ended feedback for {member_name}",
                "required": False,
            },
        ],
    }

def director_comment_block(team_name: str) -> Dict[str, Any]:
    return {
        "block_id": "director_comment",
        "title": "Director Comment",
        "elements": [
            {
                "type": "text",
                "question_id": "DirectorComment",
                "label": "Additional comment to Capstone Director only",
                "required": False,
            }
        ],
    }
