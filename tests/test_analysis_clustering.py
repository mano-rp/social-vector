"""Tests for multi-signal DBSCAN clustering."""

import numpy as np
from social_vector.analysis.clustering.dbscan import DBSCANClusteringEngine
from social_vector.analysis.features.embeddings import SemanticFeatureResult
from social_vector.analysis.preprocessing import PreprocessedData


def test_dbscan_clustering():
    engine = DBSCANClusteringEngine(eps=0.45, min_samples=3)
    
    # Create synthetic preprocessed data with 6 posts: 3 clustered together, 3 noise
    embeddings = np.array([
        [1.0, 0.0, 0.0],
        [0.98, 0.02, 0.0],
        [0.99, 0.01, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0],
        [0.5, 0.5, 0.0],
    ])
    semantic_res = SemanticFeatureResult(
        embeddings=embeddings,
        dimension=3,
        candidate_pairs=[],
        strong_pairs_count=3,
        mean_similarity=0.3,
        user_max_similarity={},
    )
    preprocessed = PreprocessedData(
        cleaned_texts=["t"] * 6,
        post_ids=[f"p{i}" for i in range(6)],
        author_ids=["u1", "u2", "u3", "u4", "u5", "u6"],
        timestamps=np.array([100.0, 105.0, 110.0, 10000.0, 20000.0, 30000.0]),
        post_domains=[["a.com"], ["a.com"], ["a.com"], [], [], []],
        post_hashtags=[["tag"], ["tag"], ["tag"], [], [], []],
        user_post_map={},
        user_timestamps={},
        user_domains={},
        user_hashtags={},
        total_posts=6,
        total_users=6,
    )

    res = engine.cluster(semantic_res, preprocessed, temporal_window_seconds=300)
    assert res.n_clusters >= 1
    assert len(res.clusters) >= 1
    assert res.clusters[0].size_users == 3
