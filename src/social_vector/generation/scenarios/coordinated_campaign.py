"""Scenario: Obvious coordinated information campaign with synchronized bursts and verbatim repetition."""

from __future__ import annotations

from datetime import timedelta
from typing import List, Optional, Tuple

from social_vector.generation.ground_truth import GroundTruthBuilder
from social_vector.generation.personas import generate_user_persona
from social_vector.generation.profiles import ContentProfile
from social_vector.generation.scenarios.base import BaseScenario, ScenarioMetadata
from social_vector.generation.scenarios.registry import register_scenario
from social_vector.generation.templates import (
    compose_coordinated_exact_post,
    compose_organic_post,
    sample_length_tier,
)
from social_vector.generation.temporal import (
    sample_burst_timeline,
    sample_organic_timeline,
)
from social_vector.schema.models import (
    GroundTruth,
    PostMetrics,
    PostRecord,
    UserRecord,
)


@register_scenario
class CoordinatedCampaignScenario(BaseScenario):
    """Generates an overt coordinated campaign with temporal bursts and near-identical messaging."""

    metadata = ScenarioMetadata(
        name="coordinated_campaign",
        display_title="Coordinated Campaign (Overt)",
        description="Synchronized astroturf/bot operation with high verbatim repetition and temporal burst alignment.",
        scenario_type="campaign_overt",
        analytical_purpose="Evaluate detection of synchronized bursts, exact/near-verbatim text repetition, and shared domain infrastructure.",
        has_coordination=True,
    )

    def run(self) -> Tuple[List[UserRecord], List[PostRecord], Optional[GroundTruth]]:
        profile = self.config.resolved_content_profile()
        if profile == ContentProfile.EXTREME:
            from social_vector.generation.scenarios.extreme_campaign import ExtremeInformationOperationScenario
            return ExtremeInformationOperationScenario(self.config, self.rng).run()

        total_users = self.config.user_count
        campaign_ratio = min(0.8, max(0.05, self.config.campaign_ratio))
        campaign_user_count = max(2, int(total_users * campaign_ratio))
        organic_user_count = total_users - campaign_user_count

        # 1. Generate organic background users
        organic_users = self.generate_organic_users(organic_user_count, prefix="usr_bg")

        # 2. Generate campaign bot accounts
        campaign_users: List[UserRecord] = []
        for i in range(1, campaign_user_count + 1):
            user = generate_user_persona(
                self.user_rng,
                i,
                user_id_prefix="usr_cmp",
                bot_style=True,
                creation_window_start=self.config.start_time - timedelta(days=20),
                creation_window_end=self.config.start_time - timedelta(days=2),
            )
            campaign_users.append(user)

        all_users = organic_users + campaign_users
        known_usernames = [u.username for u in all_users]

        # 3. Ground Truth Setup
        gt_builder = GroundTruthBuilder(scenario_type="coordinated_campaign", has_coordination=True)
        for u in organic_users:
            gt_builder.add_noise_user(u.user_id)

        campaign_id = "cmp_overt_grid_01"
        campaign_tags = ["GridEmergency", "PowerAuditNow", "UtilityScandal"]
        campaign_url = "https://grid-watchdog-bulletin.net/investigation/district-substations"

        campaign_entry = gt_builder.register_campaign(
            campaign_id=campaign_id,
            campaign_name="Operation GridWatch Astroturf",
            narrative_theme="Disinformation alleging intentional concealment of power grid failures",
            coordination_type="exact_repetition",
            targeted_entities=campaign_tags + ["grid-watchdog-bulletin.net"],
            coordination_signatures=[
                "synchronized_burst_timing",
                "high_verbatim_text_overlap",
                "shared_campaign_domain",
                "clustered_recent_account_creation",
            ],
            notes="Overt campaign designed for evaluation of temporal burst and exact repetition detection.",
        )

        for u in campaign_users:
            gt_builder.add_user_to_campaign(campaign_id, u.user_id)

        posts: List[PostRecord] = []
        post_idx = 1

        # 4. Generate Organic Posts
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
                post_id = f"pst_cmp_{post_idx:07d}"
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

        # 5. Generate Coordinated Burst Posts
        burst_windows: List[dict] = []
        num_burst_waves = max(2, min(5, int(self.config.posts_per_user * 0.8)))
        time_span_seconds = int((self.config.end_time - self.config.start_time).total_seconds())

        for wave_idx in range(num_burst_waves):
            # Pick a burst moment
            burst_offset = int((wave_idx + 1) * (time_span_seconds / (num_burst_waves + 1)))
            burst_center = self.config.start_time + timedelta(seconds=burst_offset)

            burst_start = burst_center - timedelta(minutes=3)
            burst_end = burst_center + timedelta(minutes=3)
            burst_windows.append({
                "start": burst_start.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "end": burst_end.strftime("%Y-%m-%dT%H:%M:%SZ"),
            })

            # In each wave, each campaign user fires posts
            burst_timestamps = sample_burst_timeline(
                self.temporal_rng,
                len(campaign_users),
                burst_center,
                duration_seconds=180,
            )

            for u, ts in zip(campaign_users, burst_timestamps):
                content, entities = compose_coordinated_exact_post(
                    self.post_rng,
                    campaign_slug="grid_crisis",
                    campaign_url=campaign_url,
                    campaign_hashtags=campaign_tags,
                )
                post_id = f"pst_cmp_{post_idx:07d}"

                # Campaign posts typically have artificial reciprocal amplification (high reposts/likes relative to followers)
                metrics = PostMetrics(
                    likes_count=self.metrics_rng.randint(15, 60),
                    reposts_count=self.metrics_rng.randint(10, 45),
                    replies_count=self.metrics_rng.randint(0, 3),
                    quotes_count=self.metrics_rng.randint(0, 5),
                    impressions_count=self.metrics_rng.randint(300, 1200),
                )

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
                gt_builder.add_post_to_campaign(campaign_id, post_id)
                post_idx += 1

        campaign_entry.temporal_windows = burst_windows
        gt_builder.set_benchmark("expected_campaigns", 1)
        gt_builder.set_benchmark("expected_campaign_users", len(campaign_users))

        posts.sort(key=lambda p: p.created_at)

        return all_users, posts, gt_builder.build()
