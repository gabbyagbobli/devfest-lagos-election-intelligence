"""
ADK Root Agent module (`app/election_intelligence/agent.py`).
Allows participants to run:
    adk run app/election_intelligence
    adk web app
"""

from app.agents.coordinator import (
    COORDINATOR_INSTRUCTION,
    MODEL_NAME,
    election_intelligence_coordinator,
    root_agent,
)
from app.agents.specialists import (
    claim_verification_agent,
    election_information_analyst,
    election_research_agent,
)

__all__ = [
    "COORDINATOR_INSTRUCTION",
    "MODEL_NAME",
    "claim_verification_agent",
    "election_information_analyst",
    "election_intelligence_coordinator",
    "election_research_agent",
    "root_agent",
]
