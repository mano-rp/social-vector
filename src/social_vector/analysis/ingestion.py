"""Dataset ingestion and scoping pipeline for analytical evaluation."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from social_vector.analysis.models import AnalysisScope
from social_vector.schema.models import DatasetMetadata, PostRecord, SocialDataset, UserRecord


@dataclass
class IngestedDatasetContext:
    dataset_id: str
    metadata: DatasetMetadata
    users: List[UserRecord]
    user_map: Dict[str, UserRecord]
    posts: List[PostRecord]
    post_map: Dict[str, PostRecord]
    scope: AnalysisScope
    target_id: Optional[str]
    raw_dataset: SocialDataset


def resolve_dataset_path(path_or_id: str) -> Path:
    """Resolve a dataset identifier or file path to an absolute Path."""
    p = Path(path_or_id)
    if p.is_file():
        return p.resolve()

    filename = path_or_id if path_or_id.endswith(".json") else f"{path_or_id}.json"

    # Search in user_generated_datasets and datasets directories
    candidates = [
        Path("user_generated_datasets") / filename,
        Path("datasets") / filename,
        Path(__file__).parents[3] / "user_generated_datasets" / filename,
        Path(__file__).parents[3] / "datasets" / filename,
    ]

    for cand in candidates:
        if cand.is_file():
            return cand.resolve()

    raise FileNotFoundError(f"Observation dataset '{path_or_id}' could not be located in datasets or user_generated_datasets.")


def load_dataset_for_analysis(
    path_or_id: str,
    scope: AnalysisScope = AnalysisScope.DATASET,
    target_id: Optional[str] = None,
) -> IngestedDatasetContext:
    """Load and scope a dataset for analysis."""
    path = resolve_dataset_path(path_or_id)
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    dataset = SocialDataset.from_dict(data)
    user_map = {u.user_id: u for u in dataset.users}
    post_map = {p.post_id: p for p in dataset.posts}

    scoped_users = dataset.users
    scoped_posts = dataset.posts

    if scope in (AnalysisScope.USER, AnalysisScope.FEED) and target_id:
        # If target_id is a user_id or username
        matched_user_id = target_id
        for u in dataset.users:
            if u.username == target_id:
                matched_user_id = u.user_id
                break

        scoped_posts = [p for p in dataset.posts if p.author_id == matched_user_id]
        if matched_user_id in user_map:
            scoped_users = [user_map[matched_user_id]]
        else:
            scoped_users = []

    return IngestedDatasetContext(
        dataset_id=dataset.metadata.dataset_id,
        metadata=dataset.metadata,
        users=scoped_users,
        user_map=user_map,
        posts=scoped_posts,
        post_map=post_map,
        scope=scope,
        target_id=target_id,
        raw_dataset=dataset,
    )
