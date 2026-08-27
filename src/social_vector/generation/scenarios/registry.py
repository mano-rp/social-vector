"""Scenario discovery, registration, and inspection registry."""

from __future__ import annotations

from typing import Dict, List, Type

from social_vector.generation.scenarios.base import BaseScenario, ScenarioMetadata

_SCENARIO_REGISTRY: Dict[str, Type[BaseScenario]] = {}


def register_scenario(scenario_cls: Type[BaseScenario]) -> Type[BaseScenario]:
    """Decorator to register a scenario class."""
    name = scenario_cls.metadata.name.lower()
    _SCENARIO_REGISTRY[name] = scenario_cls
    return scenario_cls


def get_scenario(name: str) -> Type[BaseScenario]:
    """Retrieve a registered scenario class by name or alias."""
    clean_name = name.lower().strip().replace("-", "_")
    
    # Aliases
    aliases = {
        "organic": "organic_activity",
        "coordinated": "coordinated_campaign",
        "paraphrased": "paraphrased_coordination",
        "subtle": "paraphrased_coordination",
        "false_positive": "organic_topical_similarity",
        "similarity": "organic_topical_similarity",
    }
    resolved = aliases.get(clean_name, clean_name)

    if resolved not in _SCENARIO_REGISTRY:
        available = ", ".join(sorted(_SCENARIO_REGISTRY.keys()))
        raise ValueError(f"Unknown scenario '{name}'. Available scenarios: {available}")
    return _SCENARIO_REGISTRY[resolved]


def list_scenarios() -> List[ScenarioMetadata]:
    """Return metadata for all registered scenarios."""
    return [cls.metadata for cls in _SCENARIO_REGISTRY.values()]
