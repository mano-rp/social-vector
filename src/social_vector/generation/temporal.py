"""Deterministic temporal simulation models and diurnal posting distributions."""

from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from social_vector.generation.seed import DeterministicRNG

# Hourly activity weights representing human diurnal waking cycles (0:00 to 23:00 UTC normalized)
DIURNAL_HOURLY_WEIGHTS = [
    0.05, 0.03, 0.02, 0.01, 0.02, 0.04,  # 00:00 - 05:00 (Night lull)
    0.08, 0.14, 0.20, 0.18, 0.16, 0.15,  # 06:00 - 11:00 (Morning surge)
    0.19, 0.17, 0.15, 0.16, 0.18, 0.20,  # 12:00 - 17:00 (Afternoon activity)
    0.22, 0.21, 0.18, 0.14, 0.10, 0.07   # 18:00 - 23:00 (Evening peak to wind-down)
]


def diurnal_weight(hour: float) -> float:
    """Calculate circadian activity weight for a given hour of day (0.0 to 24.0)."""
    h_int = int(hour) % 24
    h_next = (h_int + 1) % 24
    frac = hour - int(hour)
    w1 = DIURNAL_HOURLY_WEIGHTS[h_int]
    w2 = DIURNAL_HOURLY_WEIGHTS[h_next]
    return w1 * (1.0 - frac) + w2 * frac


def sample_organic_timestamp(
    rng: DeterministicRNG,
    start_dt: datetime,
    end_dt: datetime,
) -> datetime:
    """Deterministically sample a single organic timestamp obeying circadian probability."""
    total_seconds = max(1, int((end_dt - start_dt).total_seconds()))

    # Rejection sampling with diurnal envelope
    for _ in range(100):
        offset = rng.randint(0, total_seconds)
        candidate = start_dt + timedelta(seconds=offset)
        hour = candidate.hour + candidate.minute / 60.0 + candidate.second / 3600.0
        weight = diurnal_weight(hour)
        # Max diurnal weight is ~0.22
        if rng.random() < (weight / 0.25):
            return candidate

    # Fallback to uniform if rejection loop bounds
    return start_dt + timedelta(seconds=rng.randint(0, total_seconds))


def sample_organic_timeline(
    rng: DeterministicRNG,
    count: int,
    start_dt: datetime,
    end_dt: datetime,
) -> List[datetime]:
    """Sample a sorted sequence of organic timestamps within a window."""
    timestamps = [sample_organic_timestamp(rng, start_dt, end_dt) for _ in range(count)]
    timestamps.sort()
    return timestamps


def sample_burst_timeline(
    rng: DeterministicRNG,
    count: int,
    burst_center: datetime,
    duration_seconds: int = 300,
) -> List[datetime]:
    """Sample tightly clustered timestamps centered around a specific burst moment (e.g. synchronized bot wave)."""
    timestamps: List[datetime] = []
    half_duration = max(1, duration_seconds // 2)

    for _ in range(count):
        # Gaussian distribution around burst center
        offset_seconds = rng.gauss(0.0, half_duration / 2.5)
        # Clamp within window
        offset_seconds = max(-half_duration, min(half_duration, offset_seconds))
        ts = burst_center + timedelta(seconds=int(offset_seconds))
        timestamps.append(ts)

    timestamps.sort()
    return timestamps


def sample_periodic_timeline(
    rng: DeterministicRNG,
    count: int,
    start_dt: datetime,
    interval_seconds: int = 1800,
    jitter_seconds: int = 15,
) -> List[datetime]:
    """Sample periodic timestamps with minimal jitter characteristic of automated crons/bots."""
    timestamps: List[datetime] = []
    current = start_dt

    for _ in range(count):
        jitter = rng.randint(-jitter_seconds, jitter_seconds)
        ts = current + timedelta(seconds=jitter)
        timestamps.append(ts)
        current += timedelta(seconds=interval_seconds)

    timestamps.sort()
    return timestamps
