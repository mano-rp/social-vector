"""Comprehensive reproducibility and determinism tests across all scenarios."""

from social_vector.generation.engine import DatasetGenerator, GenerationConfig
from social_vector.schema.serialization import dataset_to_json


def test_full_scenario_reproducibility():
    scenarios = [
        "organic_activity",
        "coordinated_campaign",
        "paraphrased_coordination",
        "organic_topical_similarity",
    ]

    for scenario in scenarios:
        config1 = GenerationConfig(scenario=scenario, user_count=20, posts_per_user=3, seed=8888)
        config2 = GenerationConfig(scenario=scenario, user_count=20, posts_per_user=3, seed=8888)

        gen1 = DatasetGenerator(config1)
        gen2 = DatasetGenerator(config2)

        ds1 = gen1.generate()
        ds2 = gen2.generate()

        # Metadata created_at will differ by milliseconds, so compare core contents
        assert len(ds1.users) == len(ds2.users)
        assert len(ds1.posts) == len(ds2.posts)

        for u1, u2 in zip(ds1.users, ds2.users):
            assert u1.user_id == u2.user_id
            assert u1.username == u2.username
            assert u1.created_at == u2.created_at
            assert u1.bio == u2.bio

        for p1, p2 in zip(ds1.posts, ds2.posts):
            assert p1.post_id == p2.post_id
            assert p1.author_id == p2.author_id
            assert p1.created_at == p2.created_at
            assert p1.content == p2.content
            assert p1.entities.hashtags == p2.entities.hashtags
            assert p1.entities.urls == p2.entities.urls


def test_seed_differentiation():
    config1 = GenerationConfig(scenario="organic_activity", user_count=15, posts_per_user=3, seed=111)
    config2 = GenerationConfig(scenario="organic_activity", user_count=15, posts_per_user=3, seed=222)

    ds1 = DatasetGenerator(config1).generate()
    ds2 = DatasetGenerator(config2).generate()

    assert [u.username for u in ds1.users] != [u.username for u in ds2.users]
    assert [p.content for p in ds1.posts] != [p.content for p in ds2.posts]
