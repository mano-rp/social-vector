"""Scenario definitions and registry for SocialVector."""

from social_vector.generation.scenarios.base import BaseScenario, ScenarioMetadata
from social_vector.generation.scenarios.registry import get_scenario, list_scenarios, register_scenario
from social_vector.generation.scenarios.organic import OrganicActivityScenario
from social_vector.generation.scenarios.false_positive import OrganicTopicalSimilarityScenario

__all__ = [
    "BaseScenario",
    "ScenarioMetadata",
    "get_scenario",
    "list_scenarios",
    "register_scenario",
    "OrganicActivityScenario",
    "OrganicTopicalSimilarityScenario",
]
