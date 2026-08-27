"""Deep validation tests for referential integrity, entity boundaries, and edge cases."""

import pytest
from social_vector.generation.engine import DatasetGenerator, GenerationConfig
from social_vector.schema.validation import validate_dataset


def test_all_scenarios_pass_strict_validation():
    scenarios = [
        "organic_activity",
        "coordinated_campaign",
        "paraphrased_coordination",
        "organic_topical_similarity",
    ]
    for sc in scenarios:
        config = GenerationConfig(scenario=sc, user_count=25, posts_per_user=4, seed=42)
        dataset = DatasetGenerator(config).generate()
        errors = validate_dataset(dataset)
        assert len(errors) == 0, f"Scenario '{sc}' failed validation: {errors}"


def test_invalid_scenario_name_raises_error():
    with pytest.raises(ValueError, match="Unknown scenario"):
        config = GenerationConfig(scenario="non_existent_scenario_123")
        DatasetGenerator(config).generate()
