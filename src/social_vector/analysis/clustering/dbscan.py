"""DBSCAN multi-signal clustering engine for identifying coordinated campaign activity."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Set, Tuple

import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.metrics.pairwise import cosine_similarity

from social_vector.analysis.features.embeddings import SemanticFeatureResult
from social_vector.analysis.models import CoordinatedCluster
from social_vector.analysis.preprocessing import PreprocessedData


@dataclass
class ClusteringResult:
    clusters: List[CoordinatedCluster]
    cluster_labels: np.ndarray  # Label for each post (-1 is noise)
    n_clusters: int
    n_noise_samples: int
    eps: float
    min_samples: int
    metrics: Dict[str, Any] = field(default_factory=dict)


class DBSCANClusteringEngine:
    """Clusters observation vectors across combined semantic, temporal, and infrastructure signals."""

    def __init__(self, eps: float = 0.38, min_samples: int = 3):
        self.eps = eps
        self.min_samples = min_samples

    def cluster(
        self,
        semantic_res: SemanticFeatureResult,
        preprocessed: PreprocessedData,
        temporal_window_seconds: int = 3600,
    ) -> ClusteringResult:
        n_posts = preprocessed.total_posts
        if n_posts == 0 or len(semantic_res.embeddings) == 0:
            return ClusteringResult(
                clusters=[],
                cluster_labels=np.array([]),
                n_clusters=0,
                n_noise_samples=0,
                eps=self.eps,
                min_samples=self.min_samples,
                metrics={"status": "empty_dataset"},
            )

        if n_posts < self.min_samples:
            return ClusteringResult(
                clusters=[],
                cluster_labels=np.full(n_posts, -1),
                n_clusters=0,
                n_noise_samples=n_posts,
                eps=self.eps,
                min_samples=self.min_samples,
                metrics={"status": "insufficient_samples"},
            )

        # 1. Compute Multi-Signal Distance Matrix
        # A. Semantic Distance: 1 - cosine_similarity (0.0 to 1.0)
        sem_sim = cosine_similarity(semantic_res.embeddings)
        np.fill_diagonal(sem_sim, 1.0)
        sem_dist = np.clip(1.0 - sem_sim, 0.0, 1.0)

        # B. Temporal Distance: |t_i - t_j| / temporal_window_seconds, capped at 1.0
        ts = preprocessed.timestamps
        ts_diff = np.abs(ts[:, None] - ts[None, :])
        temp_dist = np.clip(ts_diff / float(temporal_window_seconds), 0.0, 1.0)

        # C. Domain & Hashtag Inverted Index Overlap (O(K * M) instead of O(N^2))
        domain_sim = np.zeros((n_posts, n_posts), dtype=np.float32)
        hashtag_sim = np.zeros((n_posts, n_posts), dtype=np.float32)

        domain_to_posts: Dict[str, List[int]] = {}
        for i, doms in enumerate(preprocessed.post_domains):
            for d in doms:
                domain_to_posts.setdefault(d, []).append(i)

        for d, p_list in domain_to_posts.items():
            if len(p_list) > 1:
                for idx1, p1 in enumerate(p_list):
                    for p2 in p_list[idx1 + 1 :]:
                        domain_sim[p1, p2] = domain_sim[p2, p1] = 1.0

        hashtag_to_posts: Dict[str, List[int]] = {}
        for i, tags in enumerate(preprocessed.post_hashtags):
            for t in tags:
                hashtag_to_posts.setdefault(t, []).append(i)

        for t, p_list in hashtag_to_posts.items():
            if len(p_list) > 1:
                for idx1, p1 in enumerate(p_list):
                    for p2 in p_list[idx1 + 1 :]:
                        hashtag_sim[p1, p2] = hashtag_sim[p2, p1] = 1.0

        # Composite distance matrix: 50% semantic, 30% temporal, 10% domain, 10% hashtag
        composite_sim = (
            (sem_sim * 0.50)
            + ((1.0 - temp_dist) * 0.30)
            + (domain_sim * 0.10)
            + (hashtag_sim * 0.10)
        )
        np.fill_diagonal(composite_sim, 1.0)
        composite_dist = np.clip(1.0 - composite_sim, 0.0, 1.0)

        # 2. Run DBSCAN with precomputed distance matrix
        dbscan = DBSCAN(eps=self.eps, min_samples=self.min_samples, metric="precomputed")
        labels = dbscan.fit_predict(composite_dist)

        unique_labels = [l for l in set(labels) if l != -1]
        n_clusters = len(unique_labels)
        n_noise = int(np.sum(labels == -1))

        # 3. Extract CoordinatedCluster summaries
        clusters: List[CoordinatedCluster] = []

        for l_idx, label in enumerate(sorted(unique_labels)):
            indices = np.where(labels == label)[0]
            cluster_post_ids = [preprocessed.post_ids[i] for i in indices]
            cluster_user_ids = sorted(list(set(preprocessed.author_ids[i] for i in indices)))

            # If cluster only contains 1 user, it's personal activity rather than multi-account coordination
            if len(cluster_user_ids) < 2:
                continue

            # Dominant topics, hashtags, domains
            all_tags: List[str] = []
            all_domains: List[str] = []
            for i in indices:
                all_tags.extend(preprocessed.post_hashtags[i])
                all_domains.extend(preprocessed.post_domains[i])

            top_tags = [t for t, _ in Counter(all_tags).most_common(5)]
            top_domains = [d for d, _ in Counter(all_domains).most_common(4)]

            # Temporal span
            cluster_times = preprocessed.timestamps[indices]
            t_min = float(np.min(cluster_times))
            t_max = float(np.max(cluster_times))
            duration_minutes = round((t_max - t_min) / 60.0, 1)

            # Intra-cluster cohesion score
            sub_sim = composite_sim[np.ix_(indices, indices)]
            cohesion = float(np.mean(sub_sim))

            signatures: List[str] = []
            if len(top_domains) > 0:
                signatures.append("shared_domain_infrastructure")
            if len(top_tags) > 0:
                signatures.append("hashtag_convergence")
            if duration_minutes < 120:
                signatures.append("synchronized_temporal_burst")
            if cohesion > 0.65:
                signatures.append("semantic_narrative_homogeneity")

            summary = (
                f"Cluster {l_idx + 1}: {len(cluster_user_ids)} accounts published {len(cluster_post_ids)} "
                f"correlated posts over {duration_minutes}m (cohesion: {cohesion:.2f})."
            )

            clusters.append(
                CoordinatedCluster(
                    cluster_id=f"cluster_{l_idx + 1:02d}",
                    cluster_label=int(label),
                    size_users=len(cluster_user_ids),
                    size_posts=len(cluster_post_ids),
                    coordination_score=round(cohesion, 4),
                    dominant_topics=top_tags[:3],
                    dominant_hashtags=top_tags,
                    shared_domains=top_domains,
                    participating_user_ids=cluster_user_ids,
                    affiliated_post_ids=cluster_post_ids,
                    temporal_span={
                        "start": datetime.fromtimestamp(t_min, tz=timezone.utc).isoformat(),
                        "end": datetime.fromtimestamp(t_max, tz=timezone.utc).isoformat(),
                        "duration_minutes": duration_minutes,
                    },
                    signatures=signatures,
                    summary=summary,
                )
            )

        return ClusteringResult(
            clusters=clusters,
            cluster_labels=labels,
            n_clusters=len(clusters),
            n_noise_samples=n_noise,
            eps=self.eps,
            min_samples=self.min_samples,
            metrics={
                "total_samples": n_posts,
                "raw_clusters": n_clusters,
                "multi_account_clusters": len(clusters),
                "noise_ratio": round(n_noise / n_posts, 4) if n_posts > 0 else 0.0,
            },
        )
