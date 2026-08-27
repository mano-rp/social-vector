"""Multi-signal coordination evaluators and evidence generation."""

from __future__ import annotations

from typing import Any, Dict, List

from social_vector.analysis.features.behavior import BehavioralFeatureResult
from social_vector.analysis.features.content import ContentFeatureResult
from social_vector.analysis.features.embeddings import SemanticFeatureResult
from social_vector.analysis.features.temporal import TemporalFeatureResult
from social_vector.analysis.models import SignalScore
from social_vector.analysis.preprocessing import PreprocessedData


def evaluate_semantic_signal(
    semantic_res: SemanticFeatureResult,
    preprocessed: PreprocessedData,
    weight: float = 0.25,
) -> SignalScore:
    """Evaluate semantic post similarity and cross-account narrative alignment."""
    n_posts = preprocessed.total_posts
    n_users = preprocessed.total_users
    strong_pairs = semantic_res.strong_pairs_count

    # Max possible pairs between distinct authors
    max_comparisons = max(1, (n_posts * (n_posts - 1)) // 2)
    pair_ratio = strong_pairs / max_comparisons

    # Score scaling: High pair ratio or high mean similarity
    score = min(1.0, (pair_ratio * 15.0) + (semantic_res.mean_similarity * 0.4))

    evidence: List[str] = []
    if strong_pairs > 0:
        evidence.append(
            f"Identified {strong_pairs} post pairs exhibiting high cosine semantic similarity (mean: {semantic_res.mean_similarity:.3f})."
        )
    if len(semantic_res.user_max_similarity) > 0:
        high_sim_user_pairs = sum(1 for sim in semantic_res.user_max_similarity.values() if sim >= 0.75)
        if high_sim_user_pairs > 0:
            evidence.append(
                f"{high_sim_user_pairs} distinct account pairs share highly correlated narrative phrasings."
            )

    summary = (
        f"Semantic narrative correlation is high ({score:.2f}) with {strong_pairs} high-similarity pairs."
        if score > 0.4
        else f"Semantic distribution is largely diverse ({score:.2f}) with expected organic vocabulary variance."
    )

    return SignalScore(
        signal_id="semantic_similarity",
        name="Semantic Narrative Alignment",
        score=score,
        weight=weight,
        confidence=min(1.0, 0.5 + (n_posts / 200.0)),
        summary=summary,
        metrics={
            "strong_pairs_count": strong_pairs,
            "mean_similarity": round(semantic_res.mean_similarity, 4),
            "correlated_user_pairs": len(semantic_res.user_max_similarity),
        },
        evidence_items=evidence,
    )


def evaluate_temporal_signal(
    temporal_res: TemporalFeatureResult,
    preprocessed: PreprocessedData,
    weight: float = 0.20,
) -> SignalScore:
    """Evaluate temporal burst clustering and cross-account synchronization."""
    bursts = temporal_res.burst_windows
    sync_ratio = temporal_res.synchronization_ratio
    max_density = temporal_res.max_burst_density

    # Score based on synchronization ratio and burst density
    score = min(1.0, (sync_ratio * 1.5) + (min(50.0, max_density) / 100.0))

    evidence: List[str] = []
    if len(bursts) > 0:
        evidence.append(
            f"Detected {len(bursts)} synchronized posting windows with up to {max_density:.1f} posts/min."
        )
        top_burst = max(bursts, key=lambda b: b.post_count)
        evidence.append(
            f"Largest burst contained {top_burst.post_count} posts from {top_burst.user_count} distinct users within {top_burst.duration_seconds:.0f}s."
        )

    summary = (
        f"Temporal synchronization is significant ({score:.2f}) across {len(bursts)} burst windows."
        if score > 0.35
        else f"Temporal posting patterns follow standard diurnal curves ({score:.2f})."
    )

    return SignalScore(
        signal_id="temporal_coordination",
        name="Temporal Synchronization & Bursts",
        score=score,
        weight=weight,
        confidence=min(1.0, 0.6 + (len(bursts) * 0.05)),
        summary=summary,
        metrics={
            "burst_window_count": len(bursts),
            "synchronization_ratio": temporal_res.synchronization_ratio,
            "max_burst_density_ppm": temporal_res.max_burst_density,
            "synchronized_user_pairs": len(temporal_res.synchronized_user_pairs),
        },
        evidence_items=evidence,
    )


def evaluate_content_reuse_signal(
    content_res: ContentFeatureResult,
    preprocessed: PreprocessedData,
    weight: float = 0.20,
) -> SignalScore:
    """Evaluate exact and near-exact verbatim text duplication across accounts."""
    dup_groups = content_res.duplicate_groups
    reuse_ratio = content_res.verbatim_reuse_ratio

    score = min(1.0, (reuse_ratio * 2.5) + (len(dup_groups) * 0.1))

    evidence: List[str] = []
    if len(dup_groups) > 0:
        evidence.append(
            f"Found {len(dup_groups)} verbatim text duplicate clusters published across multiple distinct accounts."
        )
        for g in dup_groups[:3]:
            evidence.append(
                f"Duplicate snippet '{g.text_snippet[:60]}...' repeated {g.post_count} times across {g.user_count} accounts."
            )

    summary = (
        f"Verbatim text duplication is elevated ({score:.2f}) with {len(dup_groups)} shared templates."
        if score > 0.3
        else f"Organic linguistic uniqueness observed ({score:.2f}) with minimal exact reuse."
    )

    return SignalScore(
        signal_id="content_reuse",
        name="Verbatim Text Repetition",
        score=score,
        weight=weight,
        confidence=0.85,
        summary=summary,
        metrics={
            "duplicate_groups_count": len(dup_groups),
            "verbatim_reuse_ratio": content_res.verbatim_reuse_ratio,
        },
        evidence_items=evidence,
    )


def evaluate_domain_infrastructure_signal(
    content_res: ContentFeatureResult,
    preprocessed: PreprocessedData,
    weight: float = 0.15,
) -> SignalScore:
    """Evaluate external URL domain concentration and shared infrastructure."""
    shared_domains = content_res.shared_domains
    n_users = max(1, preprocessed.total_users)

    # Domains shared by many accounts
    score = min(1.0, len(shared_domains) * 0.15 + (len(content_res.user_domain_pairs) / (n_users * 2.0)))

    evidence: List[str] = []
    if len(shared_domains) > 0:
        evidence.append(
            f"{len(shared_domains)} external domains are co-amplified by multiple participating accounts."
        )
        for d, users in list(shared_domains.items())[:3]:
            evidence.append(f"Domain '{d}' shared across {len(users)} distinct accounts.")

    summary = (
        f"Shared domain infrastructure is concentrated ({score:.2f}) across {len(shared_domains)} domains."
        if score > 0.25
        else f"Outbound links are decentralized or standard organic sources ({score:.2f})."
    )

    return SignalScore(
        signal_id="domain_infrastructure",
        name="Shared Domain Infrastructure",
        score=score,
        weight=weight,
        confidence=0.80,
        summary=summary,
        metrics={
            "shared_domain_count": len(shared_domains),
            "co_linking_user_pairs": len(content_res.user_domain_pairs),
        },
        evidence_items=evidence,
    )


def evaluate_hashtag_coordination_signal(
    content_res: ContentFeatureResult,
    preprocessed: PreprocessedData,
    weight: float = 0.10,
) -> SignalScore:
    """Evaluate hashtag concentration and coordinated campaign hashtag pushes."""
    shared_hashtags = content_res.shared_hashtags

    score = min(1.0, len(shared_hashtags) * 0.08)

    evidence: List[str] = []
    if len(shared_hashtags) > 0:
        evidence.append(
            f"{len(shared_hashtags)} prominent hashtags co-occur across coordinated participant groups."
        )

    summary = (
        f"Hashtag convergence is present ({score:.2f}) across {len(shared_hashtags)} shared tags."
        if score > 0.25
        else f"Hashtag usage is organically distributed ({score:.2f})."
    )

    return SignalScore(
        signal_id="hashtag_coordination",
        name="Hashtag Convergence",
        score=score,
        weight=weight,
        confidence=0.75,
        summary=summary,
        metrics={
            "shared_hashtag_count": len(shared_hashtags),
            "co_hashtag_user_pairs": len(content_res.user_hashtag_pairs),
        },
        evidence_items=evidence,
    )


def evaluate_behavioral_anomaly_signal(
    behavior_res: BehavioralFeatureResult,
    preprocessed: PreprocessedData,
    weight: float = 0.10,
) -> SignalScore:
    """Evaluate bot persona anomalies, registration batching, and client source homogeneity."""
    score = min(
        1.0,
        (behavior_res.creation_clustering_score * 0.5)
        + (behavior_res.client_homogeneity_score * 0.3)
        + (min(10.0, behavior_res.follower_asymmetry_mean) / 30.0),
    )

    evidence: List[str] = []
    if len(behavior_res.anomalous_users) > 0:
        evidence.append(
            f"Detected {len(behavior_res.anomalous_users)} accounts with skewed following/follower ratios and high posting volume."
        )
    if behavior_res.creation_clustering_score > 0.3:
        evidence.append(
            f"High account creation batching detected ({behavior_res.creation_clustering_score * 100:.1f}% registered in narrow windows)."
        )

    summary = (
        f"Behavioral anomalies detected ({score:.2f}) including registration batching and demographic skew."
        if score > 0.35
        else f"Account metadata displays authentic demographic variance ({score:.2f})."
    )

    return SignalScore(
        signal_id="behavioral_anomaly",
        name="Behavioral & Persona Signatures",
        score=score,
        weight=weight,
        confidence=0.70,
        summary=summary,
        metrics=behavior_res.metrics,
        evidence_items=evidence,
    )
