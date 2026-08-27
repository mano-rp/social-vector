"""Tests for temporal distributions and timeline generation."""

from datetime import datetime, timezone
from social_vector.generation.seed import DeterministicRNG
from social_vector.generation.temporal import (
    sample_burst_timeline,
    sample_organic_timeline,
    sample_periodic_timeline,
)


def test_organic_timeline_bounds_and_order():
    rng = DeterministicRNG(42)
    start_dt = datetime(2026, 8, 1, 0, 0, 0, tzinfo=timezone.utc)
    end_dt = datetime(2026, 8, 7, 0, 0, 0, tzinfo=timezone.utc)

    timeline = sample_organic_timeline(rng, 20, start_dt, end_dt)

    assert len(timeline) == 20
    assert timeline == sorted(timeline), "Timeline must be sorted chronologically"
    assert all(start_dt <= t <= end_dt for t in timeline)


def test_burst_timeline_clustering():
    rng = DeterministicRNG(99)
    center = datetime(2026, 8, 5, 14, 0, 0, tzinfo=timezone.utc)

    burst = sample_burst_timeline(rng, 10, center, duration_seconds=120)

    assert len(burst) == 10
    for ts in burst:
        diff_seconds = abs((ts - center).total_seconds())
        assert diff_seconds <= 60, f"Timestamp {ts} outside burst bounds"


def test_periodic_timeline():
    rng = DeterministicRNG(101)
    start = datetime(2026, 8, 1, 10, 0, 0, tzinfo=timezone.utc)

    periodic = sample_periodic_timeline(rng, 5, start, interval_seconds=600, jitter_seconds=5)
    assert len(periodic) == 5
    for i in range(1, 5):
        interval = (periodic[i] - periodic[i - 1]).total_seconds()
        assert 590 <= interval <= 610
