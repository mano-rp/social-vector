"""Tests for content repetition and shared domain infrastructure."""

from social_vector.analysis.features.content import ContentReuseEngine


def test_content_reuse_and_domains():
    engine = ContentReuseEngine()
    texts = [
        "urgent alert check documents",
        "urgent alert check documents",
        "unique personal thought today",
    ]
    post_ids = ["p1", "p2", "p3"]
    author_ids = ["u1", "u2", "u3"]
    post_domains = [["vanguardleaks.cc"], ["vanguardleaks.cc"], ["wikipedia.org"]]
    post_hashtags = [["crisis"], ["crisis"], ["science"]]

    res = engine.extract_features(texts, post_ids, author_ids, post_domains, post_hashtags)
    assert len(res.duplicate_groups) == 1
    assert "vanguardleaks.cc" in res.shared_domains
    assert res.verbatim_reuse_ratio > 0.5
