"""Tests for Extreme Information Operation scenario and multi-stage campaign generation."""

from social_vector.cli.main import main
from social_vector.generation.engine import DatasetGenerator, GenerationConfig
from social_vector.generation.geopolitical import CampaignStage
from social_vector.schema.validation import validate_dataset


def test_extreme_scenario_generation():
    config = GenerationConfig(
        scenario="extreme_information_operation",
        user_count=30,
        posts_per_user=4,
        seed=42,
        campaign_ratio=0.30,
    )
    generator = DatasetGenerator(config)
    dataset = generator.generate()

    assert dataset.metadata.scenario == "extreme_information_operation"
    assert len(dataset.users) == 30
    assert len(dataset.posts) > 0

    # Ground truth checks
    gt = dataset.ground_truth
    assert gt is not None
    assert gt.has_coordination is True
    assert len(gt.campaigns) == 1

    camp = gt.campaigns[0]
    assert camp.campaign_id == "cmp_kestrel_operation_01"
    assert camp.coordination_type == "multi_tier_hybrid_io"
    assert len(camp.participating_user_ids) == 9  # 30 * 0.30 = 9
    assert len(camp.affiliated_post_ids) > 0

    # Check that all 6 campaign stages are tracked in temporal windows
    stages_in_gt = [w.get("stage") for w in camp.temporal_windows]
    for expected_stage in CampaignStage:
        assert expected_stage.value in stages_in_gt


def test_fictional_entity_consistency():
    config = GenerationConfig(
        scenario="extreme_information_operation",
        user_count=25,
        posts_per_user=4,
        seed=101,
    )
    dataset = DatasetGenerator(config)
    ds = dataset.generate()

    campaign_posts = [p for p in ds.posts if p.post_id in ds.ground_truth.campaigns[0].affiliated_post_ids]
    all_campaign_text = " ".join([p.content for p in campaign_posts])

    # Verify consistent presence of fictional universe entities
    assert "Kestrel" in all_campaign_text or "Asteria" in all_campaign_text
    assert "Velmora" in all_campaign_text or "AMMS" in all_campaign_text


def test_extreme_scenario_seed_determinism():
    config1 = GenerationConfig(scenario="extreme_information_operation", user_count=20, seed=777)
    config2 = GenerationConfig(scenario="extreme_information_operation", user_count=20, seed=777)

    ds1 = DatasetGenerator(config1).generate()
    ds2 = DatasetGenerator(config2).generate()

    assert [u.user_id for u in ds1.users] == [u.user_id for u in ds2.users]
    assert [p.content for p in ds1.posts] == [p.content for p in ds2.posts]
    assert [p.created_at for p in ds1.posts] == [p.created_at for p in ds2.posts]


def test_extreme_scenario_no_ground_truth_leakage():
    config = GenerationConfig(scenario="extreme_information_operation", user_count=25, seed=555)
    ds = DatasetGenerator(config).generate()

    errors = validate_dataset(ds)
    assert len(errors) == 0

    for user in ds.users:
        assert "is_bot" not in user.custom_attributes
        assert "campaign_id" not in user.custom_attributes
        assert "role" not in user.custom_attributes

    for post in ds.posts:
        assert "campaign_id" not in post.custom_attributes
        assert "is_coordinated" not in post.custom_attributes
        assert "stage" not in post.custom_attributes


def test_cli_extreme_content_profile_execution(tmp_path, capsys):
    out_file = tmp_path / "cli_extreme_dataset.json"
    ret = main([
        "generate-dataset",
        "--scenario", "coordinated_campaign",
        "--content-profile", "extreme",
        "--users", "20",
        "--seed", "99",
        "--output", str(out_file),
    ])
    assert ret == 0
    assert out_file.is_file()

    inspect_ret = main(["inspect-dataset", str(out_file)])
    assert inspect_ret == 0
    captured = capsys.readouterr()
    assert "Integrity Status:  VALID" in captured.out
    assert "Operation Kestrel Sound Disinformation" in captured.out
