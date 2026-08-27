"""Data preprocessing, entity extraction, and temporal normalization utilities."""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Dict, List, Set, Tuple
from urllib.parse import urlparse

import numpy as np

from social_vector.analysis.ingestion import IngestedDatasetContext
from social_vector.schema.models import PostRecord, UserRecord


@dataclass
class PreprocessedData:
    cleaned_texts: List[str]
    post_ids: List[str]
    author_ids: List[str]
    timestamps: np.ndarray  # float unix timestamps in seconds
    post_domains: List[List[str]]
    post_hashtags: List[List[str]]
    user_post_map: Dict[str, List[int]]  # author_id -> list of indices in posts
    user_timestamps: Dict[str, List[float]]  # author_id -> list of timestamps
    user_domains: Dict[str, Set[str]]  # author_id -> set of domains
    user_hashtags: Dict[str, Set[str]]  # author_id -> set of hashtags
    total_posts: int
    total_users: int


def clean_text_for_analysis(text: str) -> str:
    """Normalize text by stripping URLs, mentions, hashtags, and excess punctuation."""
    t = re.sub(r"https?://\S+", "", text)
    t = re.sub(r"@[a-zA-Z0-9_]+", "", t)
    t = re.sub(r"#[a-zA-Z0-9_]+", "", t)
    t = re.sub(r"\s+", " ", t)
    return t.strip().lower()


def extract_domain(url: str) -> str:
    """Extract registered domain hostname from a URL string."""
    try:
        parsed = urlparse(url)
        host = parsed.netloc.lower()
        if host.startswith("www."):
            host = host[4:]
        return host
    except Exception:
        # Fallback regex
        m = re.search(r"https?://([^/]+)", url)
        return m.group(1).lower() if m else url.lower()


def parse_iso_timestamp(ts: str) -> float:
    """Parse ISO 8601 string to UNIX epoch float in seconds."""
    try:
        clean_ts = ts.replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean_ts)
        return dt.timestamp()
    except Exception:
        return 0.0


def preprocess_dataset(ctx: IngestedDatasetContext) -> PreprocessedData:
    """Preprocess posts and users into vectorizable and indexable structures."""
    cleaned_texts: List[str] = []
    post_ids: List[str] = []
    author_ids: List[str] = []
    timestamps_list: List[float] = []
    post_domains: List[List[str]] = []
    post_hashtags: List[List[str]] = []

    user_post_map: Dict[str, List[int]] = {}
    user_timestamps: Dict[str, List[float]] = {}
    user_domains: Dict[str, Set[str]] = {}
    user_hashtags: Dict[str, Set[str]] = {}

    for idx, post in enumerate(ctx.posts):
        cleaned_text = clean_text_for_analysis(post.content)
        cleaned_texts.append(cleaned_text if cleaned_text else post.content.lower())
        post_ids.append(post.post_id)
        author_ids.append(post.author_id)

        ts = parse_iso_timestamp(post.created_at)
        timestamps_list.append(ts)

        domains = [extract_domain(u) for u in post.entities.urls if extract_domain(u)]
        post_domains.append(domains)

        hashtags = [h.lower() for h in post.entities.hashtags]
        post_hashtags.append(hashtags)

        # Update per-user index
        user_post_map.setdefault(post.author_id, []).append(idx)
        user_timestamps.setdefault(post.author_id, []).append(ts)
        user_domains.setdefault(post.author_id, set()).update(domains)
        user_hashtags.setdefault(post.author_id, set()).update(hashtags)

    timestamps = np.array(timestamps_list, dtype=np.float64)

    return PreprocessedData(
        cleaned_texts=cleaned_texts,
        post_ids=post_ids,
        author_ids=author_ids,
        timestamps=timestamps,
        post_domains=post_domains,
        post_hashtags=post_hashtags,
        user_post_map=user_post_map,
        user_timestamps=user_timestamps,
        user_domains=user_domains,
        user_hashtags=user_hashtags,
        total_posts=len(ctx.posts),
        total_users=len(ctx.users),
    )
