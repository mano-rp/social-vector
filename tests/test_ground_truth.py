"""Tests for GroundTruthBuilder."""

from social_vector.generation.ground_truth import GroundTruthBuilder


def test_ground_truth_builder():
    builder = GroundTruthBuilder(scenario_type="coordinated_campaign")
    c = builder.register_campaign(
        campaign_id="cmp_001",
        campaign_name="Astroturf Operation",
        narrative_theme="Energy Disinformation",
        coordination_type="exact_repetition",
        targeted_entities=["GridEmergency"],
    )
    builder.add_user_to_campaign("cmp_001", "usr_000001")
    builder.add_user_to_campaign("cmp_001", "usr_000002")
    builder.add_post_to_campaign("cmp_001", "pst_000001")
    builder.add_noise_user("usr_000003")
    builder.set_benchmark("expected_campaigns", 1)

    gt = builder.build()

    assert gt.has_coordination is True
    assert gt.scenario_type == "coordinated_campaign"
    assert len(gt.campaigns) == 1
    assert gt.campaigns[0].campaign_id == "cmp_001"
    assert gt.campaigns[0].participating_user_ids == ["usr_000001", "usr_000002"]
    assert gt.campaigns[0].affiliated_post_ids == ["pst_000001"]
    assert gt.noise_user_ids == ["usr_000003"]
    assert gt.evaluation_benchmarks["expected_campaigns"] == 1
