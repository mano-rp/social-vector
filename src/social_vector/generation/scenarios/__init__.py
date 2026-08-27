"""Scenario definitions and registry for SocialVector."""

from social_vector.generation.scenarios.base import BaseScenario, ScenarioMetadata
from social_vector.generation.scenarios.registry import get_scenario, list_scenarios, register_scenario
from social_vector.generation.scenarios.organic import OrganicActivityScenario
from social_vector.generation.scenarios.coordinated_campaign import CoordinatedCampaignScenario
from social_vector.generation.scenarios.paraphrased_coordination import ParaphrasedCoordinationScenario
from social_vector.generation.scenarios.false_positive import OrganicTopicalSimilarityScenario
from social_vector.generation.scenarios.extreme_campaign import ExtremeInformationOperationScenario

__all__ = [
    "BaseScenario",
    "ScenarioMetadata",
    "get_scenario",
    "list_scenarios",
    "register_scenario",
    "OrganicActivityScenario",
    "CoordinatedCampaignScenario",
    "ParaphrasedCoordinationScenario",
    "OrganicTopicalSimilarityScenario",
    "ExtremeInformationOperationScenario",
]
