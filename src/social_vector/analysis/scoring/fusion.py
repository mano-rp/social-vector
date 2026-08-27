"""Transparent signal fusion, confidence assessment, and evidence dossier generation."""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

from social_vector.analysis.clustering.dbscan import ClusteringResult
from social_vector.analysis.models import (
    AnalysisConfig,
    EvidenceItem,
    SignalScore,
)


def fuse_signals_and_generate_evidence(
    signals: List[SignalScore],
    clustering_res: ClusteringResult,
    config: AnalysisConfig,
) -> Tuple[float, str, str, List[EvidenceItem]]:
    """Compute transparent weighted coordination score, confidence tier, and evidence dossier."""
    weights_map = config.weights
    total_weight = 0.0
    weighted_sum = 0.0

    signal_by_id: Dict[str, SignalScore] = {s.signal_id: s for s in signals}

    # Map configured weight keys to signal IDs
    key_mapping = {
        "semantic": "semantic_similarity",
        "temporal": "temporal_coordination",
        "content_reuse": "content_reuse",
        "domain": "domain_infrastructure",
        "hashtag": "hashtag_coordination",
        "behavioral": "behavioral_anomaly",
    }

    for cfg_key, sig_id in key_mapping.items():
        w = weights_map.get(cfg_key, 0.15)
        if sig_id in signal_by_id:
            s_val = signal_by_id[sig_id].score
            weighted_sum += w * s_val
            total_weight += w

    overall_score = (weighted_sum / total_weight) if total_weight > 0 else 0.0
    overall_score = min(1.0, max(0.0, overall_score))

    # Compile Evidence Items
    evidence_items: List[EvidenceItem] = []
    item_counter = 1

    sem_sig = signal_by_id.get("semantic_similarity")
    temp_sig = signal_by_id.get("temporal_coordination")
    reuse_sig = signal_by_id.get("content_reuse")
    dom_sig = signal_by_id.get("domain_infrastructure")
    behav_sig = signal_by_id.get("behavioral_anomaly")

    # 1. Semantic Evidence
    if sem_sig and sem_sig.score > 0.4:
        evidence_items.append(
            EvidenceItem(
                evidence_id=f"ev_{item_counter:03d}",
                category="semantic",
                severity="high" if sem_sig.score > 0.7 else "medium",
                title="Elevated Narrative Alignment",
                description=sem_sig.summary,
                supporting_data=sem_sig.metrics,
            )
        )
        item_counter += 1

    # 2. Temporal Evidence
    if temp_sig and temp_sig.score > 0.35:
        evidence_items.append(
            EvidenceItem(
                evidence_id=f"ev_{item_counter:03d}",
                category="temporal",
                severity="high" if temp_sig.score > 0.6 else "medium",
                title="Synchronized Posting Bursts",
                description=temp_sig.summary,
                supporting_data=temp_sig.metrics,
            )
        )
        item_counter += 1

    # 3. Content Duplication Evidence
    if reuse_sig and reuse_sig.score > 0.3:
        evidence_items.append(
            EvidenceItem(
                evidence_id=f"ev_{item_counter:03d}",
                category="infrastructure",
                severity="critical" if reuse_sig.score > 0.7 else "medium",
                title="Verbatim Post Duplication",
                description=reuse_sig.summary,
                supporting_data=reuse_sig.metrics,
            )
        )
        item_counter += 1

    # 4. Domain Sharing Evidence
    if dom_sig and dom_sig.score > 0.25:
        evidence_items.append(
            EvidenceItem(
                evidence_id=f"ev_{item_counter:03d}",
                category="infrastructure",
                severity="high" if dom_sig.score > 0.5 else "medium",
                title="Shared External Campaign Domains",
                description=dom_sig.summary,
                supporting_data=dom_sig.metrics,
            )
        )
        item_counter += 1

    # 5. Cluster Evidence
    if len(clustering_res.clusters) > 0:
        for c in clustering_res.clusters[:3]:
            evidence_items.append(
                EvidenceItem(
                    evidence_id=f"ev_{item_counter:03d}",
                    category="graph",
                    severity="high" if c.coordination_score > 0.6 else "medium",
                    title=f"Coordinated Cluster ({c.cluster_id})",
                    description=c.summary,
                    affiliated_user_ids=c.participating_user_ids,
                    affiliated_post_ids=c.affiliated_post_ids,
                    supporting_data={
                        "coordination_score": c.coordination_score,
                        "signatures": c.signatures,
                        "shared_domains": c.shared_domains,
                    },
                )
            )
            item_counter += 1

    # 6. Honest Confidence Assessment and Rationale
    # Core research heuristic: High semantic + High temporal + High infrastructure = Coordinated
    # High semantic + Low temporal + Low infrastructure = Organic topical convergence
    is_high_semantic = sem_sig and sem_sig.score >= 0.5
    is_high_temporal = temp_sig and temp_sig.score >= 0.4
    is_high_infrastructure = (dom_sig and dom_sig.score >= 0.3) or (reuse_sig and reuse_sig.score >= 0.3)
    has_clusters = len(clustering_res.clusters) > 0

    if overall_score >= 0.55 and has_clusters and (is_high_temporal or is_high_infrastructure):
        confidence_assessment = "high_confidence_coordinated_operation"
        assessment_rationale = (
            f"Multi-signal convergence confirms coordinated influence operation (score: {overall_score:.2f}). "
            f"Observed simultaneous narrative alignment ({sem_sig.score if sem_sig else 0:.2f}), "
            f"synchronized burst intervals ({temp_sig.score if temp_sig else 0:.2f}), and "
            f"{len(clustering_res.clusters)} distinct multi-account clusters sharing infrastructure."
        )
    elif is_high_semantic and not is_high_temporal and not is_high_infrastructure:
        confidence_assessment = "low_suspicion_organic_similarity"
        assessment_rationale = (
            f"High semantic similarity observed ({sem_sig.score if sem_sig else 0:.2f}) without temporal synchronization "
            f"or shared infrastructure. Activity is consistent with organic topical convergence on a shared public event."
        )
    elif overall_score >= 0.30 or has_clusters:
        confidence_assessment = "moderate_coordination_potential"
        assessment_rationale = (
            f"Moderate coordination indicators detected (score: {overall_score:.2f}). "
            f"Partial signals observed in temporal or lexical patterns requiring continued behavioral monitoring."
        )
    else:
        confidence_assessment = "low_suspicion_organic"
        assessment_rationale = (
            f"Observation feed reflects normal organic social dynamics (score: {overall_score:.2f}). "
            f"No statistically significant synchronization, infrastructure sharing, or clustered astroturfing detected."
        )

    return overall_score, confidence_assessment, assessment_rationale, evidence_items
