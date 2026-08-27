"""Tests for temporal burst detection and synchronization analysis."""

import numpy as np
from social_vector.analysis.features.temporal import TemporalAnalysisEngine


def test_temporal_burst_detection():
    engine = TemporalAnalysisEngine(window_seconds=120, min_users_in_burst=3)
    # 4 distinct users posting within 30 seconds
    timestamps = np.array([100.0, 110.0, 120.0, 125.0, 5000.0, 10000.0])
    authors = ["usr_1", "usr_2", "usr_3", "usr_4", "usr_5", "usr_6"]

    res = engine.extract_features(timestamps, authors)
    assert len(res.burst_windows) == 1
    burst = res.burst_windows[0]
    assert burst.user_count == 4
    assert burst.post_count == 4
    assert res.synchronization_ratio > 0.5
