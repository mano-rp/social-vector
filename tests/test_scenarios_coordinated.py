"""Tests for overt coordinated campaign and subtle paraphrased coordination scenarios."""

from social_vector.generation.engine import DatasetGenerator, GenerationConfig


def test_coordinated_campaign_scenario_generation():
    config = GenerationConfig(scenario="coordinated_campaign", user_count=20, posts_per_user=4, seed=42, campaign_ratio=0.25)
    generator = DatasetGenerator(config)
    dataset = generator.generate()

    assert dataset.metadata.scenario == "coordinated_campaign"
    assert len(dataset.users) == 20
    assert len(dataset.posts) > 0
    assert dataset.ground_truth is not None
    assert dataset.ground_truth.has_coordination is True
    assert len(dataset.ground_truth.campaigns) == 1

    camp = dataset.ground_truth.campaigns[0]
    assert camp.coordination_type == "exact_repetition"
    assert len(camp.participating_user_ids) == 5  # 20 * 0.25 = 5
    assert len(camp.affiliated_post_ids) > 0
    assert len(camp.temporal_windows) > 0


def test_paraphrased_coordination_scenario_generation():
    config = GenerationConfig(scenario="paraphrased_coordination", user_count=25, posts_per_user=4, seed=77, campaign_ratio=0.20)
    generator = DatasetGenerator(config)
    dataset = generator.generate()

    assert dataset.metadata.scenario == "paraphrased_coordination"
    assert len(dataset.users) == 25
    assert dataset.ground_truth is not None
    assert dataset.ground_truth.has_coordination is True
    assert len(dataset.ground_truth.campaigns) == 1

    camp = dataset.ground_truth.campaigns[0]
    assert camp.coordination_type == "paraphrased_semantic"
    assert len(camp.participating_user_ids) == 5  # 25 * 0.20 = 5
    assert len(camp.affiliated_post_ids) > 0
