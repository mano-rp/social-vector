"""Scenario: High-intensity multi-stage fictional geopolitical information operation."""

from __future__ import annotations

from datetime import timedelta
from typing import Dict, List, Optional, Tuple

from social_vector.generation.geopolitical import (
    FICTIONAL_DOMAINS,
    GEOPOLITICAL_HASHTAGS,
    CampaignActorRole,
    CampaignStage,
    compose_extreme_campaign_post,
)
from social_vector.generation.ground_truth import GroundTruthBuilder
from social_vector.generation.personas import generate_user_persona
from social_vector.generation.profiles import ContentProfile, PostLengthTier
from social_vector.generation.scenarios.base import BaseScenario, ScenarioMetadata
from social_vector.generation.scenarios.registry import register_scenario
from social_vector.generation.templates import (
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
class ExtremeInformationOperationScenario(BaseScenario):
    """Generates a multi-stage, high-intensity synthetic information operation in a fictional geopolitical universe."""

    metadata = ScenarioMetadata(
        name="extreme_information_operation",
        display_title="Extreme Geopolitical Information Operation",
        description="Multi-layered, 6-stage coordinated influence campaign simulating state-linked propaganda, astroturf citizen outrage, and narrative escalation in a fictional geopolitical world.",
        scenario_type="campaign_extreme_io",
        analytical_purpose="Evaluate multi-signal correlation, temporal stage transitions, heterogeneous actor roles, and semantic narrative progression under high realistic noise.",
        has_coordination=True,
    )

    def run(self) -> Tuple[List[UserRecord], List[PostRecord], Optional[GroundTruth]]:
        total_users = self.config.user_count
        campaign_ratio = min(0.60, max(0.08, self.config.campaign_ratio))
        campaign_user_count = max(6, int(total_users * campaign_ratio))
        organic_user_count = max(2, total_users - campaign_user_count)

        # 1. Generate Organic Background Users
        organic_users = self.generate_organic_users(organic_user_count, prefix="usr_org")

        # 2. Generate Heterogeneous Campaign Actor Personas with Assigned Roles
        campaign_users: List[UserRecord] = []
        user_roles: Dict[str, CampaignActorRole] = {}

        role_distribution = [
            (CampaignActorRole.SEED_LEAKER, max(1, int(campaign_user_count * 0.05))),
            (CampaignActorRole.STATE_MEDIA, max(1, int(campaign_user_count * 0.10))),
            (CampaignActorRole.BREAKING_WIRE, max(1, int(campaign_user_count * 0.15))),
            (CampaignActorRole.ASTROTURF_CITIZEN, max(2, int(campaign_user_count * 0.30))),
            (CampaignActorRole.COUNTER_ATTACK, max(1, int(campaign_user_count * 0.15))),
            (CampaignActorRole.GEOPOLITICAL_ANALYST, max(1, int(campaign_user_count * 0.10))),
            (CampaignActorRole.AMPLIFIER_BOT, max(1, int(campaign_user_count * 0.15))),
        ]

        assigned_idx = 1
        for role, count in role_distribution:
            for _ in range(count):
                if assigned_idx > campaign_user_count:
                    break
                is_bot = role in [CampaignActorRole.AMPLIFIER_BOT, CampaignActorRole.BREAKING_WIRE]
                custom_bio_interests = ["maritime policy", "Kestrel Sound", "environmental law"] if not is_bot else None

                user = generate_user_persona(
                    self.user_rng,
                    assigned_idx,
                    user_id_prefix="usr_io",
                    bot_style=is_bot,
                    creation_window_start=self.config.start_time - timedelta(days=120),
                    creation_window_end=self.config.start_time - timedelta(days=3),
                    custom_interests=custom_bio_interests,
                )
                campaign_users.append(user)
                user_roles[user.user_id] = role
                assigned_idx += 1

        # Fill any remaining slots up to campaign_user_count
        while len(campaign_users) < campaign_user_count:
            user = generate_user_persona(
                self.user_rng,
                assigned_idx,
                user_id_prefix="usr_io",
                bot_style=False,
                creation_window_start=self.config.start_time - timedelta(days=60),
                creation_window_end=self.config.start_time - timedelta(days=2),
            )
            campaign_users.append(user)
            user_roles[user.user_id] = CampaignActorRole.ASTROTURF_CITIZEN
            assigned_idx += 1

        all_users = organic_users + campaign_users
        known_usernames = [u.username for u in all_users]

        # 3. Ground Truth Assembly
        gt_builder = GroundTruthBuilder(scenario_type="extreme_information_operation", has_coordination=True)
        for u in organic_users:
            gt_builder.add_noise_user(u.user_id)

        campaign_id = "cmp_kestrel_operation_01"
        targeted_entities = GEOPOLITICAL_HASHTAGS + FICTIONAL_DOMAINS + [
            "Republic of Asteria",
            "State of Velmora",
            "Federal Territory of Oakhaven",
            "Asteria Ministry of Maritime Safety (AMMS)",
            "Admiral Julian Thorne",
            "Substation Alpha-7",
            "Treaty of Oakhaven"
        ]

        campaign_entry = gt_builder.register_campaign(
            campaign_id=campaign_id,
            campaign_name="Operation Kestrel Sound Disinformation",
            narrative_theme="Coordinated influence campaign alleging covert naval chemical discharge and military cover-up in the Kestrel Sound strait",
            coordination_type="multi_tier_hybrid_io",
            targeted_entities=targeted_entities,
            coordination_signatures=[
                "multi_stage_narrative_evolution",
                "heterogeneous_actor_roles",
                "cross_domain_syndication",
                "astroturf_grassroots_fabrication",
                "adversarial_deflection_waves",
                "synchronized_burst_amplification"
            ],
            notes="Fictional geopolitical information operation simulating state-directed propaganda, media amplification, citizen astroturfing, and narrative escalation across 6 stages.",
        )

        for u in campaign_users:
            gt_builder.add_user_to_campaign(campaign_id, u.user_id)

        # 4. Define 6 Chronological Campaign Stages
        total_time_span = self.config.end_time - self.config.start_time
        total_seconds = max(60, int(total_time_span.total_seconds()))

        stage_fractions = [
            (CampaignStage.STAGE_1_SEEDING, 0.00, 0.15),
            (CampaignStage.STAGE_2_AMPLIFICATION, 0.15, 0.35),
            (CampaignStage.STAGE_3_GRASSROOTS, 0.35, 0.55),
            (CampaignStage.STAGE_4_COUNTER_ATTACK, 0.55, 0.75),
            (CampaignStage.STAGE_5_ESCALATION, 0.75, 0.90),
            (CampaignStage.STAGE_6_PERSISTENCE, 0.90, 1.00),
        ]

        stage_windows: List[Dict[str, str]] = []
        stage_time_bounds: List[Tuple[CampaignStage, datetime, datetime]] = []

        for stg, f_start, f_end in stage_fractions:
            t_start = self.config.start_time + timedelta(seconds=int(total_seconds * f_start))
            t_end = self.config.start_time + timedelta(seconds=int(total_seconds * f_end))
            stage_windows.append({
                "stage": stg.value,
                "start": t_start.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "end": t_end.strftime("%Y-%m-%dT%H:%M:%SZ"),
            })
            stage_time_bounds.append((stg, t_start, t_end))

        campaign_entry.temporal_windows = stage_windows

        posts: List[PostRecord] = []
        post_idx = 1

        # 5. Generate Organic Background Posts (with rich multi-sentence content)
        for u in organic_users:
            activity_multiplier = max(0.4, min(self.user_rng.pareto(2.0), 3.0))
            user_post_count = max(2, int(self.config.posts_per_user * activity_multiplier))
            timestamps = sample_organic_timeline(
                self.temporal_rng,
                user_post_count,
                self.config.start_time,
                self.config.end_time,
            )

            for ts in timestamps:
                tier = sample_length_tier(self.post_rng, ContentProfile.EXTREME)
                content, entities = compose_organic_post(
                    self.post_rng,
                    include_url=self.post_rng.random() < 0.25,
                    include_hashtag=self.post_rng.random() < 0.60,
                    include_mention=self.post_rng.random() < 0.12,
                    known_usernames=known_usernames,
                    length_tier=tier,
                    profile=ContentProfile.EXTREME,
                )
                post_id = f"pst_io_{post_idx:07d}"
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

        # 6. Generate Coordinated Multi-Stage Campaign Posts
        for stg, t_start, t_end in stage_time_bounds:
            # Select active actors for this stage based on their designated roles
            if stg == CampaignStage.STAGE_1_SEEDING:
                active_actors = [u for u in campaign_users if user_roles[u.user_id] in [CampaignActorRole.SEED_LEAKER, CampaignActorRole.STATE_MEDIA]]
            elif stg == CampaignStage.STAGE_2_AMPLIFICATION:
                active_actors = [u for u in campaign_users if user_roles[u.user_id] in [CampaignActorRole.BREAKING_WIRE, CampaignActorRole.AMPLIFIER_BOT, CampaignActorRole.STATE_MEDIA]]
            elif stg == CampaignStage.STAGE_3_GRASSROOTS:
                active_actors = [u for u in campaign_users if user_roles[u.user_id] in [CampaignActorRole.ASTROTURF_CITIZEN, CampaignActorRole.AMPLIFIER_BOT]]
            elif stg == CampaignStage.STAGE_4_COUNTER_ATTACK:
                active_actors = [u for u in campaign_users if user_roles[u.user_id] in [CampaignActorRole.COUNTER_ATTACK, CampaignActorRole.ASTROTURF_CITIZEN, CampaignActorRole.STATE_MEDIA]]
            elif stg == CampaignStage.STAGE_5_ESCALATION:
                active_actors = [u for u in campaign_users if user_roles[u.user_id] in [CampaignActorRole.GEOPOLITICAL_ANALYST, CampaignActorRole.STATE_MEDIA, CampaignActorRole.BREAKING_WIRE]]
            else:  # STAGE_6_PERSISTENCE
                active_actors = [u for u in campaign_users if user_roles[u.user_id] in [CampaignActorRole.SEED_LEAKER, CampaignActorRole.GEOPOLITICAL_ANALYST, CampaignActorRole.AMPLIFIER_BOT]]

            if not active_actors:
                active_actors = campaign_users[:max(2, len(campaign_users) // 3)]

            # Generate posts for active actors in this stage
            for u in active_actors:
                posts_in_stage = self.post_rng.randint(1, 3)
                # Either synchronized burst or staggered timeline
                if user_roles[u.user_id] == CampaignActorRole.AMPLIFIER_BOT and self.post_rng.random() < 0.5:
                    mid_stage = t_start + (t_end - t_start) / 2
                    stage_timestamps = sample_burst_timeline(self.temporal_rng, posts_in_stage, mid_stage, duration_seconds=300)
                else:
                    stage_timestamps = sample_organic_timeline(self.temporal_rng, posts_in_stage, t_start, t_end)

                for ts in stage_timestamps:
                    post_id = f"pst_io_{post_idx:07d}"

                    # 80% campaign post, 20% organic cover post
                    if self.post_rng.random() < 0.80:
                        content, entities = compose_extreme_campaign_post(
                            self.post_rng,
                            stage=stg,
                            actor_role=user_roles[u.user_id],
                            length_tier=sample_length_tier(self.post_rng, ContentProfile.EXTREME),
                            profile=ContentProfile.EXTREME,
                        )
                        gt_builder.add_post_to_campaign(campaign_id, post_id)
                    else:
                        # Organic cover post
                        content, entities = compose_organic_post(
                            self.post_rng,
                            include_url=self.post_rng.random() < 0.20,
                            include_hashtag=self.post_rng.random() < 0.50,
                            include_mention=False,
                            known_usernames=known_usernames,
                            length_tier=PostLengthTier.MEDIUM,
                            profile=ContentProfile.REALISTIC,
                        )

                    # Simulating engagement
                    likes = self.metrics_rng.randint(25, 250)
                    reposts = int(likes * self.metrics_rng.uniform(0.3, 0.8))
                    replies = int(likes * self.metrics_rng.uniform(0.05, 0.2))
                    metrics = PostMetrics(
                        likes_count=likes,
                        reposts_count=reposts,
                        replies_count=replies,
                        quotes_count=int(reposts * 0.15),
                        impressions_count=likes * 25,
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
                    post_idx += 1

        gt_builder.set_benchmark("expected_campaigns", 1)
        gt_builder.set_benchmark("expected_campaign_users", len(campaign_users))
        gt_builder.set_benchmark("campaign_stages_count", 6)

        posts.sort(key=lambda p: p.created_at)

        return all_users, posts, gt_builder.build()
