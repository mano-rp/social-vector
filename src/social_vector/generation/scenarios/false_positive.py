"""Scenario: Organic high-similarity viral event (false positive benchmark)."""

from __future__ import annotations

from datetime import timedelta
from typing import List, Optional, Tuple

from social_vector.generation.ground_truth import GroundTruthBuilder
from social_vector.generation.scenarios.base import BaseScenario, ScenarioMetadata
from social_vector.generation.scenarios.registry import register_scenario
from social_vector.generation.templates import (
    compose_organic_post,
    compose_viral_organic_post,
)
from social_vector.generation.temporal import sample_organic_timeline
from social_vector.schema.models import (
    GroundTruth,
    PostRecord,
    UserRecord,
)


@register_scenario
class OrganicTopicalSimilarityScenario(BaseScenario):
    """Generates authentic organic activity during a viral event with high semantic convergence."""

    metadata = ScenarioMetadata(
        name="organic_topical_similarity",
        display_title="Organic Topical Similarity Benchmark",
        description="Authentic viral discussion around a shared real-world event without intentional coordination.",
        scenario_type="benchmark_false_positive",
        analytical_purpose="Evaluate whether analytical models avoid false-positive campaign detection on organic viral trends.",
        has_coordination=False,
    )

    def run(self) -> Tuple[List[UserRecord], List[PostRecord], Optional[GroundTruth]]:
        users = self.generate_organic_users(self.config.user_count, prefix="usr_fp")
        known_usernames = [u.username for u in users]
        posts: List[PostRecord] = []
        post_idx = 1

        gt_builder = GroundTruthBuilder(scenario_type="organic_topical_similarity", has_coordination=False)
        for u in users:
            gt_builder.add_noise_user(u.user_id)
        gt_builder.set_benchmark("expected_campaigns", 0)
        gt_builder.set_benchmark("benchmark_condition", "high_topical_similarity_organic")

        # Viral event window takes place during middle of observation window
        midpoint = self.config.start_time + (self.config.end_time - self.config.start_time) / 2
        viral_start = midpoint - timedelta(hours=12)
        viral_end = midpoint + timedelta(hours=12)

        for u in users:
            user_post_count = max(2, self.config.posts_per_user)
            timestamps = sample_organic_timeline(
                self.temporal_rng,
                user_post_count,
                self.config.start_time,
                self.config.end_time,
            )

            for ts in timestamps:
                post_id = f"pst_fp_{post_idx:07d}"

                # If timestamp is within viral event window and user decides to post about it
                is_viral_window = viral_start <= ts <= viral_end
                posts_viral = is_viral_window and (self.post_rng.random() < 0.70)

                if posts_viral:
                    content, entities = compose_viral_organic_post(self.post_rng, frame_key="organic_viral_eclipse")
                else:
                    content, entities = compose_organic_post(
                        self.post_rng,
                        include_url=self.post_rng.random() < 0.20,
                        include_hashtag=self.post_rng.random() < 0.50,
                        include_mention=self.post_rng.random() < 0.10,
                        known_usernames=known_usernames,
                    )

                metrics = self.generate_organic_post_metrics(u)

                post = PostRecord(
                    post_id=post_id,
                    author_id=u.user_id,
                    created_at=ts.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    content=content,
                    language="en",
                    entities=entities,
                    metrics=metrics,
                    client_source=u.device_client,
                )
                posts.append(post)
                post_idx += 1

        posts.sort(key=lambda p: p.created_at)

        return users, posts, gt_builder.build()
