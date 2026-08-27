"""Core deterministic dataset generation engine and execution pipeline."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from social_vector.__version__ import __schema_version__, __version__
from social_vector.generation.profiles import ContentProfile
from social_vector.generation.seed import DeterministicRNG
from social_vector.schema.models import (
    DatasetMetadata,
    GroundTruth,
    PostRecord,
    SocialDataset,
    UserRecord,
)
from social_vector.schema.validation import validate_dataset


@dataclass
class GenerationConfig:
    """Configuration parameters for dataset generation."""

    scenario: str = "organic"
    user_count: int = 50
    posts_per_user: int = 5
    seed: int = 42
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    campaign_ratio: float = 0.15
    content_profile: str = "realistic"
    custom_params: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        if self.start_time is None:
            self.start_time = datetime(2026, 8, 1, 0, 0, 0, tzinfo=timezone.utc)
        if self.end_time is None:
            self.end_time = datetime(2026, 8, 7, 0, 0, 0, tzinfo=timezone.utc)

    def resolved_content_profile(self) -> ContentProfile:
        """Resolve content_profile string to ContentProfile enum."""
        return ContentProfile.from_str(self.content_profile)


class DatasetGenerator:
    """Deterministic generator for synthetic social-media observation datasets."""

    def __init__(self, config: GenerationConfig):
        self.config = config
        self.rng = DeterministicRNG(config.seed)

    def generate(self) -> SocialDataset:
        """Execute deterministic generation and assemble a validated SocialDataset."""
        from social_vector.generation.scenarios.registry import get_scenario

        scenario_cls = get_scenario(self.config.scenario)
        scenario_runner = scenario_cls(self.config, self.rng)

        # Generate users, posts, and ground truth via scenario runner
        users, posts, ground_truth = scenario_runner.run()

        # Generate dataset-level metadata
        now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        dataset_id = f"ds_{self.config.scenario}_{self.config.seed}_{len(users)}u"

        total_likes = sum(p.metrics.likes_count for p in posts)
        total_reposts = sum(p.metrics.reposts_count for p in posts)
        total_replies = sum(p.metrics.replies_count for p in posts)

        statistics = {
            "total_users": len(users),
            "total_posts": len(posts),
            "total_likes": total_likes,
            "total_reposts": total_reposts,
            "total_replies": total_replies,
            "avg_posts_per_user": round(len(posts) / max(1, len(users)), 2),
            "start_time": self.config.start_time.strftime("%Y-%m-%dT%H:%M:%SZ") if self.config.start_time else "",
            "end_time": self.config.end_time.strftime("%Y-%m-%dT%H:%M:%SZ") if self.config.end_time else "",
        }

        parameters = {
            "scenario": self.config.scenario,
            "user_count": self.config.user_count,
            "posts_per_user": self.config.posts_per_user,
            "campaign_ratio": self.config.campaign_ratio,
            "content_profile": self.config.content_profile,
            "seed": self.config.seed,
            **self.config.custom_params,
        }

        metadata = DatasetMetadata(
            dataset_id=dataset_id,
            schema_version=__schema_version__,
            generator_name="SocialVector Dataset Generator",
            generator_version=__version__,
            scenario=self.config.scenario,
            seed=self.config.seed,
            created_at=now_iso,
            parameters=parameters,
            statistics=statistics,
        )

        dataset = SocialDataset(
            metadata=metadata,
            users=users,
            posts=posts,
            ground_truth=ground_truth,
        )

        # Integrity Validation
        errors = validate_dataset(dataset)
        if errors:
            raise ValueError(f"Generated dataset failed validation: {'; '.join(errors)}")

        return dataset
