"""CLI command implementation for SocialVector analytical investigation workflows."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import List, Optional

from social_vector.analysis.models import AnalysisConfig, AnalysisResult, AnalysisScope
from social_vector.analysis.pipeline import AnalysisPipeline


def format_cli_analysis_output(res: AnalysisResult) -> str:
    """Format structured AnalysisResult for readable terminal presentation."""
    lines: List[str] = []
    lines.append("=" * 80)
    lines.append(f"SocialVector Analytical Investigation: {res.dataset_id}")
    lines.append("=" * 80)
    lines.append(f"Analysis ID:       {res.analysis_id}")
    lines.append(f"Scope:             {res.scope.value.upper()}" + (f" ({res.target_id})" if res.target_id else ""))
    lines.append(f"Total Analyzed:    {res.total_users_analyzed} users · {res.total_posts_analyzed} posts")
    lines.append(f"Pipeline Duration: {res.total_duration_ms:.1f} ms")
    lines.append("-" * 80)

    # 1. Overall Score & Assessment
    score_pct = res.overall_coordination_score * 100.0
    lines.append(f"OVERALL COORDINATION SCORE: {res.overall_coordination_score:.4f} ({score_pct:.1f}%)")
    lines.append(f"Confidence Assessment:      {res.confidence_assessment.upper().replace('_', ' ')}")
    lines.append(f"Rationale:                  {res.assessment_rationale}")
    lines.append("-" * 80)

    # 2. Signals Breakdown
    lines.append("MULTI-SIGNAL BREAKDOWN:")
    for sig in res.signals:
        bar_len = int(sig.score * 20)
        bar = "█" * bar_len + "░" * (20 - bar_len)
        lines.append(f"  [{bar}] {sig.score:.2f}  {sig.name:<32} (weight: {sig.weight:.2f})")
        lines.append(f"    └─ {sig.summary}")
    lines.append("-" * 80)

    # 3. Coordinated Clusters
    lines.append(f"DISCOVERED COORDINATION CLUSTERS ({len(res.clusters)} found):")
    if res.clusters:
        for c in res.clusters:
            lines.append(f"  • Cluster {c.cluster_id} (Cohesion: {c.coordination_score:.2f}):")
            lines.append(f"    - Accounts ({c.size_users}): {', '.join(c.participating_user_ids[:6])}{'...' if c.size_users > 6 else ''}")
            lines.append(f"    - Posts ({c.size_posts}) across {c.temporal_span.get('duration_minutes', 0)}m span")
            if c.shared_domains:
                lines.append(f"    - Shared Domains: {', '.join(c.shared_domains[:4])}")
            if c.dominant_hashtags:
                lines.append(f"    - Dominant Hashtags: {', '.join(c.dominant_hashtags[:4])}")
    else:
        lines.append("  (No multi-account coordination clusters detected)")
    lines.append("-" * 80)

    # 4. Top Key Evidence Items
    lines.append(f"KEY EVIDENCE ITEMS ({len(res.evidence)} items):")
    if res.evidence:
        for ev in res.evidence[:5]:
            lines.append(f"  [{ev.severity.upper()}] {ev.title}:")
            lines.append(f"    {ev.description}")
    else:
        lines.append("  (No suspicious coordination evidence items flagged)")
    lines.append("=" * 80)

    return "\n".join(lines)


def run_analyze_command(args: argparse.Namespace) -> int:
    """Execute analysis pipeline from CLI."""
    scope_str = getattr(args, "analyze_type", "dataset") or "dataset"
    scope = AnalysisScope(scope_str)
    dataset_path = args.dataset
    target_id = getattr(args, "target", None)

    similarity_threshold = getattr(args, "threshold", 0.78)
    eps = getattr(args, "eps", 0.38)
    min_samples = getattr(args, "min_samples", 3)
    stream_mode = getattr(args, "stream", False)

    config = AnalysisConfig(
        similarity_threshold=similarity_threshold,
        dbscan_eps=eps,
        dbscan_min_samples=min_samples,
    )

    pipeline = AnalysisPipeline(config)

    def progress_callback(stage):
        if stream_mode:
            sys.stdout.write(json.dumps({"type": "stage", "stage": stage.to_dict()}) + "\n")
            sys.stdout.flush()

    try:
        result = pipeline.run(
            dataset_path_or_id=dataset_path,
            scope=scope,
            target_id=target_id,
            progress_callback=progress_callback,
        )

        if stream_mode:
            sys.stdout.write(json.dumps({"type": "result", "result": result.to_dict()}) + "\n")
            sys.stdout.flush()
            return 0

        if getattr(args, "json", False):
            out_str = result.to_json(indent=2)
        else:
            out_str = format_cli_analysis_output(result)

        if getattr(args, "output", None):
            out_p = Path(args.output)
            out_p.parent.mkdir(parents=True, exist_ok=True)
            with open(out_p, "w", encoding="utf-8") as f:
                if getattr(args, "json", False):
                    f.write(result.to_json(indent=2))
                else:
                    f.write(out_str)
            if not getattr(args, "quiet", False):
                print(f"Analysis results saved to: {out_p}", file=sys.stderr)
        else:
            print(out_str)

        return 0

    except Exception as e:
        if stream_mode:
            sys.stdout.write(json.dumps({"type": "error", "error": str(e)}) + "\n")
            sys.stdout.flush()
        else:
            print(f"Analysis error: {e}", file=sys.stderr)
        return 1
