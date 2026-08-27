"""Tests for post composition and template engines."""

from social_vector.generation.seed import DeterministicRNG
from social_vector.generation.templates import (
    compose_coordinated_exact_post,
    compose_organic_post,
    compose_paraphrased_campaign_post,
    compose_viral_organic_post,
)


def test_compose_organic_post_determinism():
    rng1 = DeterministicRNG(42)
    rng2 = DeterministicRNG(42)

    c1, e1 = compose_organic_post(rng1, include_url=True, include_hashtag=True)
    c2, e2 = compose_organic_post(rng2, include_url=True, include_hashtag=True)

    assert c1 == c2
    assert e1.hashtags == e2.hashtags
    assert e1.urls == e2.urls
    assert len(e1.urls) == 1
    assert len(e1.hashtags) == 1


def test_compose_paraphrased_post_structure():
    rng = DeterministicRNG(123)
    content, entities, narrative = compose_paraphrased_campaign_post(rng, frame_key="grid_disinformation")

    assert narrative == "grid_disinformation"
    assert len(entities.urls) == 1
    assert len(entities.hashtags) >= 1
    assert any(tag in ["GridEmergency", "PowerAuditNow", "UtilityScandal", "BlackoutWatch", "EnergyAccountability"] for tag in entities.hashtags)
    assert entities.urls[0].startswith("https://")


def test_compose_viral_organic_post():
    rng = DeterministicRNG(555)
    content, entities = compose_viral_organic_post(rng, frame_key="organic_viral_eclipse")

    assert "SolarEclipse2026" in entities.hashtags or "Totality" in entities.hashtags or len(entities.hashtags) > 0
    assert len(entities.urls) == 0
