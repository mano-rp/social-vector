"""Account-level behavioral feature extraction and demographic anomaly detection."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Set, Tuple

from social_vector.analysis.preprocessing import parse_iso_timestamp
from social_vector.schema.models import UserRecord


@dataclass
class BehavioralFeatureResult:
    creation_clustering_score: float  # High if many accounts created in narrow temporal batch
    client_homogeneity_score: float  # High if high concentration of identical automation clients
    follower_asymmetry_mean: float  # Mean following-to-follower ratio
    anomalous_users: List[str]  # user_ids showing behavioral outliers
    metrics: Dict[str, Any] = field(default_factory=dict)


class BehavioralAnalysisEngine:
    """Evaluates account metadata for automation signatures, batch registration, and bot demographics."""

    def extract_features(self, users: List[UserRecord]) -> BehavioralFeatureResult:
        if not users:
            return BehavioralFeatureResult(
                creation_clustering_score=0.0,
                client_homogeneity_score=0.0,
                follower_asymmetry_mean=0.0,
                anomalous_users=[],
                metrics={},
            )

        n_users = len(users)

        # 1. Registration Batch Clustering
        created_timestamps = [parse_iso_timestamp(u.created_at) for u in users if u.created_at]
        creation_clustering_score = 0.0

        if len(created_timestamps) >= 3:
            sorted_ts = sorted(created_timestamps)
            # Count accounts created within 1-day (86400s) windows
            max_batch = 0
            for i in range(len(sorted_ts)):
                limit = sorted_ts[i] + 86400.0 * 2
                j = i
                while j < len(sorted_ts) and sorted_ts[j] <= limit:
                    j += 1
                max_batch = max(max_batch, j - i)
            creation_clustering_score = min(1.0, max_batch / n_users) if n_users > 0 else 0.0

        # 2. Client Source Homogeneity
        clients = [u.device_client for u in users if u.device_client]
        client_counts: Dict[str, int] = {}
        for c in clients:
            client_counts[c] = client_counts.get(c, 0) + 1

        top_client_count = max(client_counts.values()) if client_counts else 0
        client_homogeneity = (top_client_count / len(clients)) if clients else 0.0

        # 3. Follower Asymmetry (Bot Ratio)
        asymmetry_ratios: List[float] = []
        anomalous_users: List[str] = []

        for u in users:
            followers = u.metrics.followers_count
            following = u.metrics.following_count
            ratio = (following + 1) / (followers + 1)
            asymmetry_ratios.append(ratio)

            # Mark as potential bot persona if high following-to-follower ratio and high posting count
            if ratio > 5.0 and following > 100:
                anomalous_users.append(u.user_id)

        mean_asymmetry = sum(asymmetry_ratios) / len(asymmetry_ratios) if asymmetry_ratios else 0.0

        return BehavioralFeatureResult(
            creation_clustering_score=round(creation_clustering_score, 4),
            client_homogeneity_score=round(client_homogeneity, 4),
            follower_asymmetry_mean=round(mean_asymmetry, 2),
            anomalous_users=anomalous_users,
            metrics={
                "total_users": n_users,
                "client_distribution": client_counts,
                "anomalous_user_count": len(anomalous_users),
            },
        )
