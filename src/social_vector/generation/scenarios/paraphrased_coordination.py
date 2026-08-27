"""Scenario: Subtle paraphrased coordination with semantic correlation and distributed infrastructure."""

from __future__ import annotations

from datetime import timedelta
from typing import List, Optional, Tuple

from social_vector.generation.ground_truth import GroundTruthBuilder
from social_vector.generation.personas import generate_user_persona
from social_vector.generation.profiles import ContentProfile
from social_vector.generation.scenarios.base import BaseScenario, ScenarioMetadata
from social_vector.generation.scenarios.registry import register_scenario
from social_vector.generation.templates import (
    compose_organic_post,
    compose_paraphrased_campaign_post,
    sample_length_tier,
)
from social_vector.generation.temporal import sample_organic_timeline
from social_vector.schema.models import (
    GroundTruth,
    PostMetrics,
    PostRecord,
    UserRecord,
)


@register_scenario
class ParaphrasedCoordinationScenario(BaseScenario):
    """Generates a subtle coordinated operation utilizing semantic paraphrasing and varied narrative delivery."""

    metadata = ScenarioMetadata(
        name="paraphrased_coordination",
        display_title="Paraphrased Subtle Coordination",
        description="Subtle coordinated influence campaign using semantic paraphrasing, staggered timing, and distributed domains.",
        scenario_type="campaign_subtle",
        analytical_purpose="Evaluate semantic embedding clustering, narrative correlation, and cross-domain tracking under noise.",
        has_coordination=True,
    )

    def run(self) -> Tuple[List[UserRecord], List[PostRecord], Optional[GroundTruth]]:
        profile = self.config.resolved_content_profile()
        total_users = self.config.user_count
        campaign_ratio = min(0.6, max(0.05, self.config.campaign_ratio))
        campaign_user_count = max(2, int(total_users * campaign_ratio))
        organic_user_count = total_users - campaign_user_count

        # 1. Generate organic users
        organic_users = self.generate_organic_users(organic_user_count, prefix="usr_org")

        # 2. Generate subtle campaign accounts (masquerading with realistic backgrounds)
        campaign_users: List[UserRecord] = []
        for i in range(1, campaign_user_count + 1):
            bot_style = (i % 2 == 0)
            user = generate_user_persona(
                self.user_rng,
                i,
                user_id_prefix="usr_subtle",
                bot_style=bot_style,
                creation_window_start=self.config.start_time - timedelta(days=90),
                creation_window_end=self.config.start_time - timedelta(days=10),
            )
            campaign_users.append(user)

        all_users = organic_users + campaign_users
        known_usernames = [u.username for u in all_users]

        # 3. Ground Truth Setup
        gt_builder = GroundTruthBuilder(scenario_type="paraphrased_coordination", has_coordination=True)
        for u in organic_users:
            gt_builder.add_noise_user(u.user_id)

        campaign_id = "cmp_subtle_narrative_01"
        targeted_domains = ["news-direct24.info", "fastnews-daily.co", "pulse-dispatch.org"]
        campaign_entry = gt_builder.register_campaign(
            campaign_id=campaign_id,
            campaign_name="Operation Subtle Resonance",
            narrative_theme="Coordinated semantic narrative claiming hidden electrical grid fragility and regulatory concealment",
            coordination_type="paraphrased_semantic",
            targeted_entities=targeted_domains + ["GridEmergency", "PowerAuditNow", "BlackoutWatch"],
            coordination_signatures=[
                "semantic_narrative_coherence",
                "distributed_multi_domain_linking",
                "staggered_temporal_diffusion",
                "organic_cover_activity_mixing",
            ],
            notes="Subtle campaign requiring semantic vector embeddings and cross-domain correlation for detection.",
        )

        for u in campaign_users:
            gt_builder.add_user_to_campaign(campaign_id, u.user_id)

        posts: List[PostRecord] = []
        post_idx = 1

        # 4. Generate Organic User Posts
        for u in organic_users:
            activity_multiplier = max(0.4, min(self.user_rng.pareto(2.0), 3.0))
            user_post_count = max(1, int(self.config.posts_per_user * activity_multiplier))
            timestamps = sample_organic_timeline(
                self.temporal_rng,
                user_post_count,
                self.config.start_time,
                self.config.end_time,
            )
            for ts in timestamps:
                tier = sample_length_tier(self.post_rng, profile)
                content, entities = compose_organic_post(
                    self.post_rng,
                    include_url=self.post_rng.random() < 0.25,
                    include_hashtag=self.post_rng.random() < 0.50,
                    include_mention=self.post_rng.random() < 0.10,
                    known_usernames=known_usernames,
                    length_tier=tier,
                    profile=profile,
                )
                post_id = f"pst_subtle_{post_idx:07d}"
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

        # 5. Generate Subtle Campaign Posts with Organic Cover Activity
        for u in campaign_users:
            user_post_count = max(3, self.config.posts_per_user + self.user_rng.randint(1, 3))
            timestamps = sample_organic_timeline(
                self.temporal_rng,
                user_post_count,
                self.config.start_time,
                self.config.end_time,
            )

            for ts in timestamps:
                post_id = f"pst_subtle_{post_idx:07d}"
                is_campaign_post = self.post_rng.random() < 0.65

                if is_campaign_post:
                    campaign_domain = self.post_rng.choice(targeted_domains)
                    content, entities, _ = compose_paraphrased_campaign_post(
                        self.post_rng,
                        frame_key="grid_disinformation",
                        campaign_domain=campaign_domain,
                    )
                    gt_builder.add_post_to_campaign(campaign_id, post_id)
                else:
                    tier = sample_length_tier(self.post_rng, profile)
                    content, entities = compose_organic_post(
                        self.post_rng,
                        include_url=self.post_rng.random() < 0.20,
                        include_hashtag=self.post_rng.random() < 0.50,
                        include_mention=False,
                        known_usernames=known_usernames,
                        length_tier=tier,
                        profile=profile,
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

        gt_builder.set_benchmark("expected_campaigns", 1)
        gt_builder.set_benchmark("expected_campaign_users", len(campaign_users))

        posts.sort(key=lambda p: p.created_at)

        return all_users, posts, gt_builder.build()
