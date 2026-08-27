"""Observable multi-stage analysis pipeline executing end-to-end coordination detection."""

from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Callable, Dict, List, Optional
import uuid

from social_vector.analysis.clustering.dbscan import DBSCANClusteringEngine
from social_vector.analysis.features.behavior import BehavioralAnalysisEngine
from social_vector.analysis.features.content import ContentReuseEngine
from social_vector.analysis.features.embeddings import SemanticEmbeddingEngine
from social_vector.analysis.features.temporal import TemporalAnalysisEngine
from social_vector.analysis.graph.builder import GraphBuilder
from social_vector.analysis.ingestion import IngestedDatasetContext, load_dataset_for_analysis
from social_vector.analysis.models import (
    AnalysisConfig,
    AnalysisResult,
    AnalysisScope,
    PipelineStageResult,
    PipelineStageStatus,
)
from social_vector.analysis.preprocessing import preprocess_dataset
from social_vector.analysis.scoring.fusion import fuse_signals_and_generate_evidence
from social_vector.analysis.signals.evaluators import (
    evaluate_behavioral_anomaly_signal,
    evaluate_content_reuse_signal,
    evaluate_domain_infrastructure_signal,
    evaluate_hashtag_coordination_signal,
    evaluate_semantic_signal,
    evaluate_temporal_signal,
)


class AnalysisPipeline:
    """Canonical end-to-end analytical pipeline coordinator."""

    def __init__(self, config: Optional[AnalysisConfig] = None):
        self.config = config or AnalysisConfig()

    def run(
        self,
        dataset_path_or_id: str,
        scope: AnalysisScope = AnalysisScope.DATASET,
        target_id: Optional[str] = None,
        progress_callback: Optional[Callable[[PipelineStageResult], None]] = None,
    ) -> AnalysisResult:
        analysis_id = f"anl_{uuid.uuid4().hex[:12]}"
        created_at = datetime.now(timezone.utc).isoformat()
        start_wall_time = time.perf_counter()

        stages: List[PipelineStageResult] = []

        def execute_stage(
            stage_id: str,
            name: str,
            description: str,
            func: Callable[[], Dict[str, Any]],
            params: Optional[Dict[str, Any]] = None,
        ) -> Dict[str, Any]:
            t0 = time.perf_counter()
            try:
                metrics = func()
                duration_ms = (time.perf_counter() - t0) * 1000.0
                stage_res = PipelineStageResult(
                    stage_id=stage_id,
                    name=name,
                    status=PipelineStageStatus.COMPLETED,
                    duration_ms=duration_ms,
                    description=description,
                    metrics=metrics or {},
                    parameters=params or {},
                )
            except Exception as e:
                duration_ms = (time.perf_counter() - t0) * 1000.0
                stage_res = PipelineStageResult(
                    stage_id=stage_id,
                    name=name,
                    status=PipelineStageStatus.FAILED,
                    duration_ms=duration_ms,
                    description=description,
                    metrics={},
                    parameters=params or {},
                    warnings=[str(e)],
                )
                stages.append(stage_res)
                if progress_callback:
                    progress_callback(stage_res)
                raise e

            stages.append(stage_res)
            if progress_callback:
                progress_callback(stage_res)
            return metrics

        # 1. Ingestion Stage
        ingest_metrics = {}
        ctx: IngestedDatasetContext

        def stage_ingest():
            nonlocal ctx, ingest_metrics
            ctx = load_dataset_for_analysis(dataset_path_or_id, scope=scope, target_id=target_id)
            return {
                "dataset_id": ctx.dataset_id,
                "users_loaded": len(ctx.users),
                "posts_loaded": len(ctx.posts),
                "scenario": ctx.metadata.scenario,
                "seed": ctx.metadata.seed,
            }

        ingest_metrics = execute_stage(
            "ingestion",
            "Dataset Ingestion & Scoping",
            "Loads and validates the observation dataset and applies user/feed scoping filters.",
            stage_ingest,
            {"dataset": dataset_path_or_id, "scope": scope.value, "target_id": target_id},
        )

        # 2. Preprocessing Stage
        preprocessed = None

        def stage_preproc():
            nonlocal preprocessed
            preprocessed = preprocess_dataset(ctx)
            return {
                "total_posts": preprocessed.total_posts,
                "total_users": preprocessed.total_users,
                "unique_domains": len(set(d for row in preprocessed.post_domains for d in row)),
                "unique_hashtags": len(set(h for row in preprocessed.post_hashtags for h in row)),
            }

        execute_stage(
            "preprocessing",
            "Entity Tokenization & Normalization",
            "Extracts URLs, hashtags, mentions, and parses ISO timestamps into float epochs.",
            stage_preproc,
        )

        # 3. Semantic Embedding Stage
        semantic_engine = SemanticEmbeddingEngine(
            target_dimension=384, random_seed=self.config.random_seed
        )
        semantic_res = None

        def stage_embed():
            nonlocal semantic_res
            semantic_res = semantic_engine.extract_features(
                texts=preprocessed.cleaned_texts,
                author_ids=preprocessed.author_ids,
                similarity_threshold=self.config.similarity_threshold,
            )
            return {
                "embedding_dimension": semantic_res.dimension,
                "posts_embedded": len(semantic_res.embeddings),
                "similarity_threshold": self.config.similarity_threshold,
                "candidate_pairs_found": semantic_res.strong_pairs_count,
                "mean_pairwise_similarity": round(semantic_res.mean_similarity, 4),
            }

        execute_stage(
            "semantic_similarity",
            "Semantic Embedding & Cosine Similarity",
            "Generates L2-normalized dense embeddings and computes cross-account narrative cosine similarity.",
            stage_embed,
            {"target_dimension": 384, "similarity_threshold": self.config.similarity_threshold},
        )

        # 4. Temporal Analysis Stage
        temporal_engine = TemporalAnalysisEngine(
            window_seconds=self.config.temporal_window_seconds
        )
        temporal_res = None

        def stage_temporal():
            nonlocal temporal_res
            temporal_res = temporal_engine.extract_features(
                timestamps=preprocessed.timestamps,
                author_ids=preprocessed.author_ids,
            )
            return {
                "burst_windows_detected": len(temporal_res.burst_windows),
                "synchronization_ratio": temporal_res.synchronization_ratio,
                "max_burst_density_ppm": temporal_res.max_burst_density,
                "synchronized_user_pairs": len(temporal_res.synchronized_user_pairs),
            }

        execute_stage(
            "temporal_analysis",
            "Temporal Burst & Synchronization Analysis",
            "Identifies synchronized cross-account posting spikes within sliding time windows.",
            stage_temporal,
            {"window_seconds": self.config.temporal_window_seconds},
        )

        # 5. Content Reuse & Domain Infrastructure Stage
        content_engine = ContentReuseEngine()
        content_res = None

        def stage_content():
            nonlocal content_res
            content_res = content_engine.extract_features(
                cleaned_texts=preprocessed.cleaned_texts,
                post_ids=preprocessed.post_ids,
                author_ids=preprocessed.author_ids,
                post_domains=preprocessed.post_domains,
                post_hashtags=preprocessed.post_hashtags,
            )
            return {
                "verbatim_duplicate_clusters": len(content_res.duplicate_groups),
                "shared_domains_count": len(content_res.shared_domains),
                "shared_hashtags_count": len(content_res.shared_hashtags),
                "verbatim_reuse_ratio": content_res.verbatim_reuse_ratio,
            }

        execute_stage(
            "content_analysis",
            "Verbatim Repetition & Domain Sharing",
            "Detects exact phrase duplication, coordinated hashtag pushes, and shared infrastructure domains.",
            stage_content,
        )

        # 6. Behavioral & Persona Profiling Stage
        behavioral_engine = BehavioralAnalysisEngine()
        behavioral_res = None

        def stage_behavior():
            nonlocal behavioral_res
            behavioral_res = behavioral_engine.extract_features(ctx.users)
            return {
                "creation_clustering_score": behavioral_res.creation_clustering_score,
                "client_homogeneity_score": behavioral_res.client_homogeneity_score,
                "anomalous_users_flagged": len(behavioral_res.anomalous_users),
            }

        execute_stage(
            "behavioral_analysis",
            "Account Demographics & Behavioral Profiling",
            "Evaluates registration batching, device client homogeneity, and follower asymmetry.",
            stage_behavior,
        )

        # 7. DBSCAN Multi-Signal Clustering Stage
        dbscan_engine = DBSCANClusteringEngine(
            eps=self.config.dbscan_eps, min_samples=self.config.dbscan_min_samples
        )
        clustering_res = None

        def stage_clustering():
            nonlocal clustering_res
            clustering_res = dbscan_engine.cluster(
                semantic_res=semantic_res,
                preprocessed=preprocessed,
                temporal_window_seconds=self.config.temporal_window_seconds * 10,
            )
            return {
                "clusters_formed": len(clustering_res.clusters),
                "noise_posts_count": clustering_res.n_noise_samples,
                "eps": clustering_res.eps,
                "min_samples": clustering_res.min_samples,
            }

        execute_stage(
            "clustering",
            "Multi-Signal DBSCAN Clustering",
            "Clusters observations across combined semantic, temporal, and infrastructure distance metrics.",
            stage_clustering,
            {"eps": self.config.dbscan_eps, "min_samples": self.config.dbscan_min_samples},
        )

        # 8. Network Graph Construction Stage
        graph_builder = GraphBuilder()
        graph_data = None

        def stage_graph():
            nonlocal graph_data
            graph_data = graph_builder.build_graph(
                ctx=ctx,
                preprocessed=preprocessed,
                semantic_res=semantic_res,
                temporal_res=temporal_res,
                content_res=content_res,
                clustering_res=clustering_res,
            )
            return {
                "nodes_count": graph_data.node_count,
                "edges_count": graph_data.edge_count,
                "graph_density": graph_data.density,
            }

        execute_stage(
            "graph_construction",
            "Interaction & Coordination Graph Construction",
            "Builds a relational NetworkX topology modeling users, shared domains, clusters, and interactions.",
            stage_graph,
        )

        # 9. Signal Fusion & Risk Scoring Stage
        signals = [
            evaluate_semantic_signal(semantic_res, preprocessed, self.config.weights.get("semantic", 0.25)),
            evaluate_temporal_signal(temporal_res, preprocessed, self.config.weights.get("temporal", 0.20)),
            evaluate_content_reuse_signal(content_res, preprocessed, self.config.weights.get("content_reuse", 0.20)),
            evaluate_domain_infrastructure_signal(content_res, preprocessed, self.config.weights.get("domain", 0.15)),
            evaluate_hashtag_coordination_signal(content_res, preprocessed, self.config.weights.get("hashtag", 0.10)),
            evaluate_behavioral_anomaly_signal(behavioral_res, preprocessed, self.config.weights.get("behavioral", 0.10)),
        ]

        overall_score, confidence_assessment, assessment_rationale, evidence_items = (
            fuse_signals_and_generate_evidence(signals, clustering_res, self.config)
        )

        def stage_fusion():
            return {
                "overall_coordination_score": round(overall_score, 4),
                "confidence_assessment": confidence_assessment,
                "signals_evaluated": len(signals),
                "evidence_items_generated": len(evidence_items),
            }

        execute_stage(
            "signal_fusion",
            "Signal Fusion & Transparent Assessment",
            "Combines normalized signal vectors into a weighted coordination score and generates human-readable evidence.",
            stage_fusion,
            {"weights": self.config.weights},
        )

        total_duration_ms = (time.perf_counter() - start_wall_time) * 1000.0
        completed_at = datetime.now(timezone.utc).isoformat()

        # Build content stats summary
        top_domains = [
            {"domain": d, "sharer_count": len(u_list), "user_ids": u_list[:8]}
            for d, u_list in sorted(content_res.shared_domains.items(), key=lambda x: len(x[1]), reverse=True)
            if len(u_list) >= 2
        ][:10]

        top_hashtags = [
            {"hashtag": h, "sharer_count": len(u_list), "user_ids": u_list[:8]}
            for h, u_list in sorted(content_res.shared_hashtags.items(), key=lambda x: len(x[1]), reverse=True)
            if len(u_list) >= 2
        ][:12]

        duplicate_groups_summary = [
            {
                "group_id": dg.group_id,
                "repetition_count": dg.post_count,
                "user_count": dg.user_count,
                "sample_text": dg.text_snippet,
                "participating_users": dg.participating_users[:6],
                "post_ids": dg.affiliated_post_ids[:6],
            }
            for dg in content_res.duplicate_groups[:10]
        ]

        content_stats = {
            "top_domains": top_domains,
            "top_hashtags": top_hashtags,
            "duplicate_groups": duplicate_groups_summary,
            "verbatim_reuse_ratio": content_res.verbatim_reuse_ratio,
        }

        behavioral_stats = {
            "client_distribution": behavioral_res.client_distribution,
            "asymmetry_distribution": behavioral_res.asymmetry_distribution,
            "creation_date_histogram": behavioral_res.creation_date_histogram,
            "anomalous_users": behavioral_res.anomalous_users,
            "creation_clustering_score": behavioral_res.creation_clustering_score,
            "client_homogeneity_score": behavioral_res.client_homogeneity_score,
            "follower_asymmetry_mean": behavioral_res.follower_asymmetry_mean,
        }

        return AnalysisResult(
            analysis_id=analysis_id,
            dataset_id=ctx.dataset_id,
            scope=scope,
            target_id=target_id,
            created_at=created_at,
            completed_at=completed_at,
            total_duration_ms=total_duration_ms,
            config=self.config,
            stages=stages,
            overall_coordination_score=overall_score,
            confidence_assessment=confidence_assessment,
            assessment_rationale=assessment_rationale,
            signals=signals,
            clusters=clustering_res.clusters,
            evidence=evidence_items,
            graph=graph_data,
            timeline=temporal_res.timeline_bins,
            content_stats=content_stats,
            behavioral_stats=behavioral_stats,
            total_users_analyzed=len(ctx.users),
            total_posts_analyzed=len(ctx.posts),
        )
