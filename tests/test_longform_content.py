"""Tests for long-form content generation and content profile length distributions."""

from social_vector.generation.engine import DatasetGenerator, GenerationConfig
from social_vector.generation.profiles import ContentProfile, PostLengthTier
from social_vector.generation.seed import DeterministicRNG
from social_vector.generation.templates import (
    compose_organic_post,
    compose_viral_organic_post,
    sample_length_tier,
)


def test_content_profile_resolution():
    assert ContentProfile.from_str("realistic") == ContentProfile.REALISTIC
    assert ContentProfile.from_str("rich") == ContentProfile.REALISTIC
    assert ContentProfile.from_str("extreme") == ContentProfile.EXTREME
    assert ContentProfile.from_str("standard") == ContentProfile.STANDARD
    assert ContentProfile.from_str("concise") == ContentProfile.STANDARD


def test_organic_post_length_tiers():
    rng = DeterministicRNG(42)

    # Test short tier
    short_body, short_ent = compose_organic_post(rng, length_tier=PostLengthTier.SHORT)
    assert len(short_body.split(". ")) <= 3

    # Test long tier
    long_body, long_ent = compose_organic_post(rng, length_tier=PostLengthTier.LONG)
    assert len(long_body.split(". ")) >= 3
    assert len(long_body) > len(short_body)

    # Test very long tier
    very_long_body, very_long_ent = compose_organic_post(rng, length_tier=PostLengthTier.VERY_LONG)
    assert "\n\n" in very_long_body
    assert len(very_long_body) > 200


def test_viral_organic_post_multi_sentence():
    rng = DeterministicRNG(99)
    body, ent = compose_viral_organic_post(rng, length_tier=PostLengthTier.LONG)
    assert len(body.split(". ")) >= 2
    assert "SolarEclipse2026" in ent.hashtags or len(ent.hashtags) > 0


def test_dataset_post_length_distribution():
    config = GenerationConfig(scenario="organic_activity", user_count=20, posts_per_user=5, seed=1234, content_profile="realistic")
    dataset = DatasetGenerator(config).generate()

    post_lengths = [len(p.content) for p in dataset.posts]
    avg_length = sum(post_lengths) / len(post_lengths)

    # Realistic profile should have substantial multi-sentence posts with average character length > 120
    assert avg_length > 120
    assert max(post_lengths) > 250
