"""Tests for SocialVector schema models, serialization, and validation."""

import json
from social_vector.schema import (
    CampaignGroundTruth,
    DatasetMetadata,
    GroundTruth,
    PostEntities,
    PostMetrics,
    PostRecord,
    SocialDataset,
    UserMetrics,
    UserRecord,
    dataset_to_dict,
    dataset_to_json,
    dict_to_dataset,
    json_to_dataset,
    validate_dataset,
)


def test_schema_roundtrip_serialization():
    metadata = DatasetMetadata(
        dataset_id="ds_test_001",
        schema_version="1.0.0",
        scenario="organic",
        seed=12345,
        created_at="2026-08-27T22:00:00Z",
    )
    user = UserRecord(
        user_id="usr_0001",
        username="alice_test",
        display_name="Alice Test",
        bio="Researcher in renewable systems.",
        created_at="2025-01-10T12:00:00Z",
        location="San Francisco, CA",
        metrics=UserMetrics(followers_count=150, following_count=80, posts_count=12, listed_count=2),
        verified=False,
        account_type="individual",
        language="en",
        device_client="Web Client",
    )
    post = PostRecord(
        post_id="pst_0001",
        author_id="usr_0001",
        created_at="2026-08-27T20:00:00Z",
        content="Testing clean energy grid simulation results #RenewableEnergy",
        language="en",
        entities=PostEntities(hashtags=["RenewableEnergy"], mentions=[], urls=["https://example.com/report"], media_urls=[]),
        metrics=PostMetrics(likes_count=10, reposts_count=3, replies_count=1, quotes_count=0, impressions_count=120),
        client_source="Web Client",
    )
    gt = GroundTruth(
        has_coordination=True,
        scenario_type="coordinated_campaign",
        campaigns=[
            CampaignGroundTruth(
                campaign_id="cmp_001",
                campaign_name="Test Campaign",
                narrative_theme="Energy Disinformation",
                coordination_type="exact_repetition",
                participating_user_ids=["usr_0001"],
                affiliated_post_ids=["pst_0001"],
                targeted_entities=["RenewableEnergy"],
                temporal_windows=[{"start": "2026-08-27T20:00:00Z", "end": "2026-08-27T21:00:00Z"}],
                coordination_signatures=["shared_seed_template"],
                notes="Synthetic test fixture",
            )
        ],
        noise_user_ids=[],
        evaluation_benchmarks={"expected_campaigns": 1},
    )

    dataset = SocialDataset(
        metadata=metadata,
        users=[user],
        posts=[post],
        ground_truth=gt,
    )

    # Validate dataset
    errors = validate_dataset(dataset)
    assert len(errors) == 0, f"Validation errors: {errors}"

    # JSON round-trip
    json_str = dataset_to_json(dataset)
    restored = json_to_dataset(json_str)

    assert restored.metadata.dataset_id == "ds_test_001"
    assert len(restored.users) == 1
    assert restored.users[0].username == "alice_test"
    assert restored.users[0].metrics.followers_count == 150
    assert len(restored.posts) == 1
    assert restored.posts[0].content == "Testing clean energy grid simulation results #RenewableEnergy"
    assert restored.posts[0].entities.hashtags == ["RenewableEnergy"]
    assert restored.ground_truth is not None
    assert restored.ground_truth.campaigns[0].campaign_id == "cmp_001"


def test_schema_validation_detects_inconsistencies():
    metadata = DatasetMetadata(dataset_id="", schema_version="1.0.0")
    user = UserRecord(user_id="usr_001", username="user1", display_name="User 1", bio="", created_at="invalid-date")
    post = PostRecord(post_id="pst_001", author_id="usr_unknown", created_at="2026-08-27T22:00:00Z", content="Hello")
    dataset = SocialDataset(metadata=metadata, users=[user], posts=[post])

    errors = validate_dataset(dataset)
    assert any("missing 'dataset_id'" in e for e in errors)
    assert any("invalid created_at timestamp" in e for e in errors)
    assert any("references unknown author_id" in e for e in errors)


def test_schema_prevents_ground_truth_leaks():
    metadata = DatasetMetadata(dataset_id="ds_01", schema_version="1.0.0", created_at="2026-08-27T22:00:00Z")
    user = UserRecord(
        user_id="usr_001",
        username="leaky_user",
        display_name="Leaky",
        bio="Test",
        created_at="2026-08-27T22:00:00Z",
        custom_attributes={"is_bot": True},
    )
    dataset = SocialDataset(metadata=metadata, users=[user], posts=[])
    errors = validate_dataset(dataset)
    assert any("contains leaked ground-truth metadata" in e for e in errors)
