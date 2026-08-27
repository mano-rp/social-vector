"""Content fingerprinting, verbatim repetition, and domain/hashtag overlap analysis."""

from __future__ import annotations

import hashlib
from collections import Counter
from dataclasses import dataclass, field
from typing import Any, Dict, List, Set, Tuple


@dataclass
class DuplicateContentGroup:
    group_id: str
    text_snippet: str
    post_count: int
    user_count: int
    participating_users: List[str]
    affiliated_post_ids: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "group_id": self.group_id,
            "text_snippet": self.text_snippet,
            "post_count": self.post_count,
            "user_count": self.user_count,
            "participating_users": self.participating_users,
            "affiliated_post_ids": self.affiliated_post_ids,
        }


@dataclass
class ContentFeatureResult:
    duplicate_groups: List[DuplicateContentGroup]
    shared_domains: Dict[str, List[str]]  # domain -> list of distinct user_ids
    shared_hashtags: Dict[str, List[str]]  # hashtag -> list of distinct user_ids
    user_domain_pairs: Dict[Tuple[str, str], Set[str]]  # (user_a, user_b) -> set of shared domains
    user_hashtag_pairs: Dict[Tuple[str, str], Set[str]]  # (user_a, user_b) -> set of shared hashtags
    verbatim_reuse_ratio: float


class ContentReuseEngine:
    """Detects verbatim post repetition, shared campaign domains, and coordinated hashtag pushes."""

    def extract_features(
        self,
        cleaned_texts: List[str],
        post_ids: List[str],
        author_ids: List[str],
        post_domains: List[List[str]],
        post_hashtags: List[List[str]],
    ) -> ContentFeatureResult:
        n_posts = len(cleaned_texts)
        if n_posts == 0:
            return ContentFeatureResult(
                duplicate_groups=[],
                shared_domains={},
                shared_hashtags={},
                user_domain_pairs={},
                user_hashtag_pairs={},
                verbatim_reuse_ratio=0.0,
            )

        # 1. Exact/Near-Exact Text Hash Fingerprinting
        hash_to_indices: Dict[str, List[int]] = {}
        for idx, text in enumerate(cleaned_texts):
            # Use normalized character hash
            h = hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]
            hash_to_indices.setdefault(h, []).append(idx)

        duplicate_groups: List[DuplicateContentGroup] = []
        dup_counter = 1
        total_dup_posts = 0

        for h, indices in hash_to_indices.items():
            if len(indices) >= 2:
                users = list(set(author_ids[i] for i in indices))
                if len(users) >= 2:  # Reused across at least 2 distinct accounts
                    p_ids = [post_ids[i] for i in indices]
                    sample_text = cleaned_texts[indices[0]][:120] + ("..." if len(cleaned_texts[indices[0]]) > 120 else "")
                    duplicate_groups.append(
                        DuplicateContentGroup(
                            group_id=f"dup_{dup_counter:03d}",
                            text_snippet=sample_text,
                            post_count=len(indices),
                            user_count=len(users),
                            participating_users=users,
                            affiliated_post_ids=p_ids,
                        )
                    )
                    dup_counter += 1
                    total_dup_posts += len(indices)

        # 2. Domain Sharing
        domain_to_users: Dict[str, Set[str]] = {}
        for idx, domains in enumerate(post_domains):
            user = author_ids[idx]
            for d in domains:
                if d:
                    domain_to_users.setdefault(d, set()).add(user)

        shared_domains = {d: sorted(list(users)) for d, users in domain_to_users.items() if len(users) >= 2}

        # Pairwise user domain overlap
        user_domain_pairs: Dict[Tuple[str, str], Set[str]] = {}
        for d, users in domain_to_users.items():
            user_list = sorted(list(users))
            for i, u1 in enumerate(user_list):
                for u2 in user_list[i + 1 :]:
                    pair = (u1, u2)
                    user_domain_pairs.setdefault(pair, set()).add(d)

        # 3. Hashtag Sharing
        hashtag_to_users: Dict[str, Set[str]] = {}
        for idx, tags in enumerate(post_hashtags):
            user = author_ids[idx]
            for t in tags:
                if t:
                    hashtag_to_users.setdefault(t, set()).add(user)

        shared_hashtags = {t: sorted(list(users)) for t, users in hashtag_to_users.items() if len(users) >= 3}

        # Pairwise user hashtag overlap
        user_hashtag_pairs: Dict[Tuple[str, str], Set[str]] = {}
        for t, users in hashtag_to_users.items():
            user_list = sorted(list(users))
            for i, u1 in enumerate(user_list):
                for u2 in user_list[i + 1 :]:
                    pair = (u1, u2)
                    user_hashtag_pairs.setdefault(pair, set()).add(t)

        reuse_ratio = total_dup_posts / n_posts if n_posts > 0 else 0.0

        return ContentFeatureResult(
            duplicate_groups=duplicate_groups,
            shared_domains=shared_domains,
            shared_hashtags=shared_hashtags,
            user_domain_pairs=user_domain_pairs,
            user_hashtag_pairs=user_hashtag_pairs,
            verbatim_reuse_ratio=round(reuse_ratio, 4),
        )
