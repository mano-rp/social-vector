"""Base scenario interfaces and common generation utilities."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from social_vector.generation.engine import GenerationConfig
from social_vector.generation.ground_truth import GroundTruthBuilder
from social_vector.generation.personas import generate_user_persona
from social_vector.generation.seed import DeterministicRNG
from social_vector.generation.templates import compose_organic_post
from social_vector.generation.temporal import sample_organic_timeline
from social_vector.schema.models import (
    GroundTruth,
    PostMetrics,
    PostRecord,
    UserRecord,
)


@dataclass
class ScenarioMetadata:
    """Descriptor metadata for a generation scenario."""

    name: str
    display_title: str
    description: str
    scenario_type: str
    analytical_purpose: str
    has_coordination: bool


class BaseScenario(ABC):
    """Abstract base class for deterministic social dataset scenarios."""

    metadata: ScenarioMetadata

    def __init__(self, config: GenerationConfig, rng: DeterministicRNG):
        self.config = config
        self.rng = rng
        self.user_rng = rng.spawn("users")
        self.post_rng = rng.spawn("posts")
        self.temporal_rng = rng.spawn("temporal")
        self.metrics_rng = rng.spawn("metrics")
        self.campaign_rng = rng.spawn("campaign")

    @abstractmethod
    def run(self) -> Tuple[List[UserRecord], List[PostRecord], Optional[GroundTruth]]:
        """Execute the scenario generation and return users, posts, and ground truth."""
        raise NotImplementedError

    def generate_organic_users(self, count: int, prefix: str = "usr", start_idx: int = 1) -> List[UserRecord]:
        """Generate a collection of organic user profiles."""
        users: List[UserRecord] = []
        for i in range(start_idx, start_idx + count):
            user = generate_user_persona(self.user_rng, i, user_id_prefix=prefix, bot_style=False)
            users.append(user)
        return users

    def generate_organic_post_metrics(self, user: UserRecord) -> PostMetrics:
        """Deterministically simulate observable engagement metrics for an organic post."""
        # Scale engagement roughly with author follower count
        follower_factor = max(1.0, user.metrics.followers_count / 100.0)
        likes = int(self.metrics_rng.exponential(1.0 / (2.0 * follower_factor)))
        reposts = int(likes * self.metrics_rng.uniform(0.05, 0.35))
        replies = int(likes * self.metrics_rng.uniform(0.02, 0.25))
        quotes = int(reposts * self.metrics_rng.uniform(0.0, 0.2))
        impressions = int(likes * self.metrics_rng.uniform(8.0, 30.0) + user.metrics.followers_count * 0.4)

        return PostMetrics(
            likes_count=likes,
            reposts_count=reposts,
            replies_count=replies,
            quotes_count=quotes,
            impressions_count=impressions,
        )
