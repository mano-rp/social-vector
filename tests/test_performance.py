"""Performance and scalability test for large local dataset generation."""

import time
from social_vector.generation.engine import DatasetGenerator, GenerationConfig


def test_large_dataset_generation_efficiency():
    """Verify that a 1,000-user dataset generates efficiently locally."""
    start_time = time.time()
    config = GenerationConfig(
        scenario="coordinated_campaign",
        user_count=1000,
        posts_per_user=4,
        seed=42,
        campaign_ratio=0.10,
    )
    generator = DatasetGenerator(config)
    dataset = generator.generate()
    elapsed = time.time() - start_time

    assert len(dataset.users) == 1000
    assert len(dataset.posts) >= 3000
    # Must generate 1000 users and thousands of posts in under 5.0 seconds locally
    assert elapsed < 5.0, f"Generation took {elapsed:.2f}s, expected < 5.0s"
