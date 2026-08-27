"""Structured data models for the SocialVector analytical engine."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


class AnalysisScope(str, Enum):
    DATASET = "dataset"
    USER = "user"
    FEED = "feed"


class PipelineStageStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class PipelineStageResult:
    stage_id: str
    name: str
    status: PipelineStageStatus
    duration_ms: float
    description: str
    metrics: Dict[str, Any] = field(default_factory=dict)
    parameters: Dict[str, Any] = field(default_factory=dict)
    warnings: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "stage_id": self.stage_id,
            "name": self.name,
            "status": self.status.value if isinstance(self.status, PipelineStageStatus) else self.status,
            "duration_ms": round(self.duration_ms, 2),
            "description": self.description,
            "metrics": self.metrics,
            "parameters": self.parameters,
            "warnings": self.warnings,
        }


@dataclass
class SignalScore:
    signal_id: str
    name: str
    score: float
    weight: float
    confidence: float
    summary: str
    metrics: Dict[str, Any] = field(default_factory=dict)
    evidence_items: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "signal_id": self.signal_id,
            "name": self.name,
            "score": round(self.score, 4),
            "weight": round(self.weight, 4),
            "confidence": round(self.confidence, 4),
            "summary": self.summary,
            "metrics": self.metrics,
            "evidence_items": self.evidence_items,
        }


@dataclass
class EvidenceItem:
    evidence_id: str
    category: str  # semantic, temporal, infrastructure, behavioral, network
    severity: str  # low, medium, high, critical
    title: str
    description: str
    affiliated_user_ids: List[str] = field(default_factory=list)
    affiliated_post_ids: List[str] = field(default_factory=list)
    supporting_data: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class CoordinatedCluster:
    cluster_id: str
    cluster_label: int
    size_users: int
    size_posts: int
    coordination_score: float
    dominant_topics: List[str] = field(default_factory=list)
    dominant_hashtags: List[str] = field(default_factory=list)
    shared_domains: List[str] = field(default_factory=list)
    participating_user_ids: List[str] = field(default_factory=list)
    affiliated_post_ids: List[str] = field(default_factory=list)
    temporal_span: Dict[str, Any] = field(default_factory=dict)
    signatures: List[str] = field(default_factory=list)
    summary: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class GraphNode:
    id: str
    label: str
    type: str  # user, post, domain, hashtag, cluster
    attributes: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class GraphEdge:
    source: str
    target: str
    relationship: str  # posted, mentions, shared_url, shared_hashtag, semantic_similarity, temporal_burst, co_cluster
    weight: float = 1.0
    evidence: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class GraphData:
    nodes: List[GraphNode] = field(default_factory=list)
    edges: List[GraphEdge] = field(default_factory=list)
    density: float = 0.0
    node_count: int = 0
    edge_count: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "nodes": [n.to_dict() for n in self.nodes],
            "edges": [e.to_dict() for e in self.edges],
            "density": round(self.density, 4),
            "node_count": self.node_count or len(self.nodes),
            "edge_count": self.edge_count or len(self.edges),
        }


@dataclass
class AnalysisConfig:
    similarity_threshold: float = 0.78
    temporal_window_seconds: int = 300
    dbscan_eps: float = 0.38
    dbscan_min_samples: int = 3
    weights: Dict[str, float] = field(
        default_factory=lambda: {
            "semantic": 0.25,
            "temporal": 0.20,
            "content_reuse": 0.20,
            "domain": 0.15,
            "hashtag": 0.10,
            "behavioral": 0.10,
        }
    )
    random_seed: int = 42

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class AnalysisResult:
    analysis_id: str
    dataset_id: str
    scope: AnalysisScope
    target_id: Optional[str]
    created_at: str
    completed_at: Optional[str]
    total_duration_ms: float
    config: AnalysisConfig
    stages: List[PipelineStageResult]
    overall_coordination_score: float
    confidence_assessment: str
    assessment_rationale: str
    signals: List[SignalScore]
    clusters: List[CoordinatedCluster]
    evidence: List[EvidenceItem] = field(default_factory=list)
    graph: Optional[GraphData] = None
    timeline: List[Dict[str, Any]] = field(default_factory=list)
    content_stats: Dict[str, Any] = field(default_factory=dict)
    behavioral_stats: Dict[str, Any] = field(default_factory=dict)
    total_users_analyzed: int = 0
    total_posts_analyzed: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "analysis_id": self.analysis_id,
            "dataset_id": self.dataset_id,
            "scope": self.scope.value if isinstance(self.scope, AnalysisScope) else self.scope,
            "target_id": self.target_id,
            "created_at": self.created_at,
            "completed_at": self.completed_at,
            "total_duration_ms": round(self.total_duration_ms, 2),
            "config": self.config.to_dict(),
            "stages": [s.to_dict() for s in self.stages],
            "overall_coordination_score": round(self.overall_coordination_score, 4),
            "confidence_assessment": self.confidence_assessment,
            "assessment_rationale": self.assessment_rationale,
            "signals": [s.to_dict() for s in self.signals],
            "clusters": [c.to_dict() for c in self.clusters],
            "evidence": [e.to_dict() for e in self.evidence],
            "graph": self.graph.to_dict() if self.graph else None,
            "timeline": self.timeline,
            "content_stats": self.content_stats,
            "behavioral_stats": self.behavioral_stats,
            "total_users_analyzed": self.total_users_analyzed,
            "total_posts_analyzed": self.total_posts_analyzed,
        }

    def to_json(self, indent: Optional[int] = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)
