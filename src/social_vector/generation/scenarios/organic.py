"""Scenario: Organic social activity with natural variation and no coordination."""

from __future__ import annotations

from typing import List, Optional, Tuple

from social_vector.generation.ground_truth import GroundTruthBuilder
from social_vector.generation.profiles import ContentProfile
from social_vector.generation.scenarios.base import BaseScenario, ScenarioMetadata
from social_vector.generation.scenarios.registry import register_scenario
from social_vector.generation.templates import (
    compose_organic_post,
    sample_length_tier,
)
from social_vector.generation.temporal import sample_organic_timeline
from social_vector.schema.models import (
    GroundTruth,
    PostRecord,
    UserRecord,
)


@register_scenario
class OrganicActivityScenario(BaseScenario):
    """Generates authentic organic social activity without coordinated campaigns."""

    metadata = ScenarioMetadata(
        name="organic_activity",
        display_title="Organic Social Activity",
        description="Normal, authentic social media activity across varied topics and natural diurnal timelines.",
        scenario_type="baseline",
        analytical_purpose="Establish baseline organic distribution of topics, activity rhythms, and network interactions.",
        has_coordination=False,
    )

    def run(self) -> Tuple[List[UserRecord], List[PostRecord], Optional[GroundTruth]]:
        profile = self.config.resolved_content_profile()
        users = self.generate_organic_users(self.config.user_count, prefix="usr_org")
        known_usernames = [u.username for u in users]
        posts: List[PostRecord] = []
        post_idx = 1

        gt_builder = GroundTruthBuilder(scenario_type="organic_activity", has_coordination=False)
        for u in users:
            gt_builder.add_noise_user(u.user_id)
        gt_builder.set_benchmark("expected_campaigns", 0)

        for u in users:
            activity_multiplier = max(0.4, min(self.user_rng.pareto(2.0), 4.0))
            user_post_count = max(1, int(self.config.posts_per_user * activity_multiplier))

            timestamps = sample_organic_timeline(
                self.temporal_rng,
                user_post_count,
                self.config.start_time,
                self.config.end_time,
            )

            for ts in timestamps:
                tier = sample_length_tier(self.post_rng, profile)
                include_url = self.post_rng.random() < 0.25
                include_hashtag = self.post_rng.random() < 0.60
                include_mention = self.post_rng.random() < 0.15

                content, entities = compose_organic_post(
                    self.post_rng,
                    include_url=include_url,
                    include_hashtag=include_hashtag,
                    include_mention=include_mention,
                    known_usernames=known_usernames,
                    length_tier=tier,
                    profile=profile,
                )

                post_id = f"pst_org_{post_idx:07d}"
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
