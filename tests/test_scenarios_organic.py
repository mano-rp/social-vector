"""Tests for organic activity and false-positive scenario generation."""

from social_vector.generation.engine import DatasetGenerator, GenerationConfig


def test_organic_scenario_generation():
    config = GenerationConfig(scenario="organic_activity", user_count=10, posts_per_user=3, seed=42)
    generator = DatasetGenerator(config)
    dataset = generator.generate()

    assert dataset.metadata.scenario == "organic_activity"
    assert len(dataset.users) == 10
    assert len(dataset.posts) > 0
    assert dataset.ground_truth is not None
    assert dataset.ground_truth.has_coordination is False
    assert len(dataset.ground_truth.campaigns) == 0
    assert len(dataset.ground_truth.noise_user_ids) == 10


def test_false_positive_scenario_generation():
    config = GenerationConfig(scenario="organic_topical_similarity", user_count=12, posts_per_user=3, seed=99)
    generator = DatasetGenerator(config)
    dataset = generator.generate()

    assert dataset.metadata.scenario == "organic_topical_similarity"
    assert len(dataset.users) == 12
    assert dataset.ground_truth is not None
    assert dataset.ground_truth.has_coordination is False
    assert dataset.ground_truth.evaluation_benchmarks["expected_campaigns"] == 0
