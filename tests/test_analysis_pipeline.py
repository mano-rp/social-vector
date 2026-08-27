"""End-to-end integration tests for the SocialVector analysis pipeline."""

from social_vector.analysis.models import AnalysisConfig, AnalysisScope
from social_vector.analysis.pipeline import AnalysisPipeline


def test_pipeline_on_extreme_geopolitical_dataset():
    pipeline = AnalysisPipeline(AnalysisConfig())
    res = pipeline.run("datasets/sample_extreme_geopolitical_operation.json")

    assert res.total_posts_analyzed > 100
    assert res.total_users_analyzed > 50
    assert res.overall_coordination_score > 0.50
    assert res.confidence_assessment == "high_confidence_coordinated_operation"
    assert len(res.clusters) > 0
    assert len(res.evidence) > 0
    assert res.graph is not None
    assert res.graph.node_count > 10


def test_pipeline_on_organic_similarity_dataset():
    pipeline = AnalysisPipeline(AnalysisConfig())
    res = pipeline.run("datasets/sample_false_positive_organic.json")

    assert res.total_posts_analyzed == 200
    assert res.total_users_analyzed == 50
    # False positive organic benchmark should recognize absence of multi-account coordination clusters
    assert len(res.clusters) == 0
    assert "organic" in res.confidence_assessment.lower()
