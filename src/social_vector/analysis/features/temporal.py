"""Temporal burst detection, timestamp clustering, and cross-account synchronization analysis."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Set, Tuple

import numpy as np


@dataclass
class BurstWindow:
    window_id: str
    start_timestamp: float
    end_timestamp: float
    duration_seconds: float
    post_count: int
    user_count: int
    post_indices: List[int]
    participating_users: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "window_id": self.window_id,
            "start_time": datetime.fromtimestamp(self.start_timestamp, tz=timezone.utc).isoformat(),
            "end_time": datetime.fromtimestamp(self.end_timestamp, tz=timezone.utc).isoformat(),
            "duration_seconds": round(self.duration_seconds, 1),
            "post_count": self.post_count,
            "user_count": self.user_count,
            "participating_users": self.participating_users,
        }


@dataclass
class TemporalFeatureResult:
    burst_windows: List[BurstWindow]
    synchronized_user_pairs: Dict[Tuple[str, str], int]  # (user_a, user_b) -> count of shared burst windows
    total_burst_posts: int
    synchronization_ratio: float
    max_burst_density: float  # max posts per minute in a burst
    timeline_bins: List[Dict[str, Any]] = field(default_factory=list)


class TemporalAnalysisEngine:
    """Analyzes timestamp distributions and identifies synchronized multi-account posting bursts."""

    def __init__(self, window_seconds: int = 300, min_users_in_burst: int = 3):
        self.window_seconds = window_seconds
        self.min_users_in_burst = min_users_in_burst

    def extract_features(
        self,
        timestamps: np.ndarray,
        author_ids: List[str],
    ) -> TemporalFeatureResult:
        n_posts = len(timestamps)
        if n_posts == 0:
            return TemporalFeatureResult(
                burst_windows=[],
                synchronized_user_pairs={},
                total_burst_posts=0,
                synchronization_ratio=0.0,
                max_burst_density=0.0,
                timeline_bins=[],
            )

        # Sort indices by timestamp
        sorted_indices = np.argsort(timestamps)
        sorted_times = timestamps[sorted_indices]
        sorted_authors = [author_ids[i] for i in sorted_indices]

        burst_windows: List[BurstWindow] = []
        synchronized_pairs: Dict[Tuple[str, str], int] = {}
        burst_post_indices: Set[int] = set()

        i = 0
        window_counter = 1
        while i < n_posts:
            t_start = sorted_times[i]
            t_limit = t_start + self.window_seconds

            # Find all posts in this window
            j = i
            while j < n_posts and sorted_times[j] <= t_limit:
                j += 1

            window_indices = [int(sorted_indices[k]) for k in range(i, j)]
            window_users = list(set(sorted_authors[i:j]))

            if len(window_users) >= self.min_users_in_burst and len(window_indices) >= 3:
                duration = max(1.0, sorted_times[j - 1] - t_start)
                burst = BurstWindow(
                    window_id=f"burst_{window_counter:03d}",
                    start_timestamp=float(t_start),
                    end_timestamp=float(sorted_times[j - 1]),
                    duration_seconds=float(duration),
                    post_count=len(window_indices),
                    user_count=len(window_users),
                    post_indices=window_indices,
                    participating_users=window_users,
                )
                burst_windows.append(burst)
                window_counter += 1
                burst_post_indices.update(window_indices)

                # Record pairwise co-occurrence in burst
                for u_idx, u1 in enumerate(window_users):
                    for u2 in window_users[u_idx + 1 :]:
                        pair_key = (min(u1, u2), max(u1, u2))
                        synchronized_pairs[pair_key] = synchronized_pairs.get(pair_key, 0) + 1

                # Advance past the cluster to avoid overlapping duplicate windows
                i = max(i + 1, j - 1)
            else:
                i += 1

        total_burst_posts = len(burst_post_indices)
        sync_ratio = total_burst_posts / n_posts if n_posts > 0 else 0.0

        max_density = 0.0
        for b in burst_windows:
            density_ppm = (b.post_count / b.duration_seconds) * 60.0
            if density_ppm > max_density:
                max_density = density_ppm

        # Generate 20-30 uniform timeline histogram bins
        timeline_bins: List[Dict[str, Any]] = []
        if n_posts > 0:
            t_min = float(np.min(timestamps))
            t_max = float(np.max(timestamps))
            span = max(60.0, t_max - t_min)
            n_bins = min(30, max(12, int(n_posts / 25)))
            bin_width = span / float(n_bins)

            for b in range(n_bins):
                b_start = t_min + b * bin_width
                b_end = t_min + (b + 1) * bin_width
                mask = (timestamps >= b_start) & (timestamps < b_end if b < n_bins - 1 else timestamps <= b_end)
                bin_indices = np.where(mask)[0]
                bin_posts = int(len(bin_indices))
                bin_users = len(set(author_ids[idx] for idx in bin_indices))

                is_burst = any(
                    not (bw.end_timestamp < b_start or bw.start_timestamp > b_end)
                    for bw in burst_windows
                )

                timeline_bins.append({
                    "bin_index": b,
                    "start_timestamp": round(b_start, 2),
                    "end_timestamp": round(b_end, 2),
                    "start_time": datetime.fromtimestamp(b_start, tz=timezone.utc).isoformat(),
                    "end_time": datetime.fromtimestamp(b_end, tz=timezone.utc).isoformat(),
                    "post_count": bin_posts,
                    "user_count": bin_users,
                    "is_burst": is_burst,
                })

        return TemporalFeatureResult(
            burst_windows=burst_windows,
            synchronized_user_pairs=synchronized_pairs,
            total_burst_posts=total_burst_posts,
            synchronization_ratio=round(sync_ratio, 4),
            max_burst_density=round(max_density, 2),
            timeline_bins=timeline_bins,
        )
