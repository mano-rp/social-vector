"""Scenario: Real-world geopolitical conflict, sovereign war politics, and international defense information operations."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

from social_vector.generation.ground_truth import GroundTruthBuilder
from social_vector.generation.personas import generate_user_persona
from social_vector.generation.profiles import ContentProfile, PostLengthTier
from social_vector.generation.scenarios.base import BaseScenario, ScenarioMetadata
from social_vector.generation.scenarios.registry import register_scenario
from social_vector.generation.templates import compose_organic_post, sample_length_tier
from social_vector.generation.temporal import sample_burst_timeline, sample_organic_timeline
from social_vector.schema.models import GroundTruth, PostEntities, PostMetrics, PostRecord, UserRecord


REALWORLD_LOCATIONS = [
    "Kyiv, Ukraine",
    "Warsaw, Poland",
    "Berlin, Germany",
    "Washington, DC, USA",
    "London, United Kingdom",
    "Taipei, Taiwan",
    "Tokyo, Japan",
    "Helsinki, Finland",
    "Tallinn, Estonia",
    "Vilnius, Lithuania",
    "Riga, Latvia",
    "Brussels, Belgium",
    "Stockholm, Sweden",
    "Oslo, Norway",
    "Canberra, Australia",
    "Singapore",
    "Seoul, South Korea",
    "Tel Aviv, Israel",
    "Dubai, UAE",
    "Ottawa, Canada",
    "Rome, Italy",
    "Bucharest, Romania",
    "Ankara, Turkey",
    "Manila, Philippines",
    "Paris, France",
    "Geneva, Switzerland",
]

REALWORLD_DOMAINS = [
    "reuters.com",
    "bbc.com",
    "atlanticcouncil.org",
    "iswresearch.org",
    "defensenews.com",
    "kyivindependent.com",
    "japantimes.co.jp",
    "foreignpolicy.com",
    "navalnews.com",
    "bellingcat.com",
    "csis.org",
    "bloomberg.com",
]

REALWORLD_HASHTAGS = [
    "UkraineWar",
    "BalticDefense",
    "TaiwanStrait",
    "EnergySecurity",
    "NATODeterrence",
    "RedSeaSecurity",
    "CyberDefense",
    "IndoPacific",
    "SanctionsRegime",
    "CriticalInfrastructure",
]

STAGE_NARRATIVES = {
    1: {  # Seeding
        "claims": [
            "Declassified synthetic aperture radar (SAR) telemetry from Suwalki corridor confirms unannounced armor battalion repositioning along the eastern border.",
            "Independent maritime AIS monitoring registers sudden transponder dropouts for multiple commercial cargo vessels transiting the Bab el-Mandeb strait.",
            "Joint intelligence bulletin reveals covert underwater sonar arrays deployed along undersea power interconnectors in the Baltic Sea.",
            "Commercial satellite imagery from Planet Labs confirms extensive trench fortification and radar installation across the northern frontline sector.",
        ],
        "evidence_links": [
            "https://iswresearch.org/special-dispatch/frontline-telemetry-update",
            "https://defensenews.com/global-security/baltic-interconnector-surveillance",
            "https://navalnews.com/maritime-security/red-sea-ais-anomalies",
            "https://bellingcat.com/investigations/satellite-armor-movements",
        ],
    },
    2: {  # Breaking Amplification
        "headers": [
            "CRITICAL SECURITY ALERT:",
            "BREAKING DEFENSE DISPATCH:",
            "THEATER UPDATE:",
            "INTELLIGENCE FLASH:",
        ],
        "claims": [
            "Air defense battalions in Eastern Europe place regional early-warning radar systems on maximum readiness following electronic warfare jamming.",
            "Naval task force confirms interception of multiple unmanned surface vessels attempting breach of vital maritime shipping lanes.",
            "European energy grid operators initiate emergency load-balancing after coordinated cyber intrusions targeted distribution substations.",
        ],
        "actions": [
            "Monitor official defense ministry comms closely.",
            "Verify all frontline claims before amplifying unconfirmed reports.",
            "Allied cyber teams are actively responding to critical infrastructure telemetry.",
        ],
    },
    3: {  # Astroturf / Grassroots
        "openers": [
            "Hearing loud sonic booms over the eastern suburbs since 4 AM today.",
            "Local fuel supply depots in the border region are implementing 20-liter purchase limits without prior notice.",
            "Municipal authorities in the northern district just activated backup civil defense emergency sirens.",
            "Power fluctuations across the industrial district have knocked our municipal water pumps offline.",
        ],
    },
    4: {  # Escalation & Policy Communiques
        "statements": [
            "Emergency NATO North Atlantic Council summit convened in Brussels under Article 4 consultations regarding Baltic infrastructure security.",
            "International coalition imposes immediate maritime secondary sanctions targeting rogue tanker fleets evading oil price caps.",
            "Bilateral defense treaty signatories announce expedited delivery of advanced integrated air defense battery systems to frontline allies.",
            "UN Security Council special session deadlocked following veto on maritime inspection mandate for contested international waters.",
        ],
    },
}


@register_scenario
class RealWorldGeopoliticalScenario(BaseScenario):
    """Generates a high-fidelity synthetic dataset modeling real-world war politics, defense agendas, and sovereign information operations."""

    metadata = ScenarioMetadata(
        name="realworld_geopolitical_conflict",
        display_title="Real-World Geopolitical Conflict & Information Operation",
        description="High-fidelity influence campaign modeling real-world geopolitical flashpoints, defense agendas, energy security, and multi-state information operations across genuine global locations.",
        scenario_type="campaign_realworld_conflict",
        analytical_purpose="Evaluate geographic threat mapping accuracy across real-world capitals, multi-stage narrative escalation, temporal burst detection, and infrastructure correlation.",
        has_coordination=True,
    )

    def run(self) -> Tuple[List[UserRecord], List[PostRecord], Optional[GroundTruth]]:
        total_users = self.config.user_count
        campaign_ratio = min(0.60, max(0.10, self.config.campaign_ratio))
        campaign_user_count = max(6, int(total_users * campaign_ratio))
        organic_user_count = max(2, total_users - campaign_user_count)

        # 1. Generate Organic Users with Real-World Locations
        organic_users: List[UserRecord] = []
        for i in range(organic_user_count):
            loc = self.user_rng.choice(REALWORLD_LOCATIONS)
            u = generate_user_persona(
                self.user_rng,
                i + 1,
                user_id_prefix="usr_rw_org",
                bot_style=False,
                creation_window_start=self.config.start_time - timedelta(days=365),
                creation_window_end=self.config.start_time - timedelta(days=10),
            )
            u.location = loc
            organic_users.append(u)

        # 2. Generate Campaign Actor Personas
        campaign_users: List[UserRecord] = []
        target_hotspot_locations = [
            "Kyiv, Ukraine",
            "Warsaw, Poland",
            "Taipei, Taiwan",
            "Washington, DC, USA",
            "Berlin, Germany",
            "Helsinki, Finland",
            "Tallinn, Estonia",
            "Brussels, Belgium",
            "Tokyo, Japan",
            "London, United Kingdom",
        ]

        for i in range(campaign_user_count):
            is_bot = (i % 3 == 0)
            loc = target_hotspot_locations[i % len(target_hotspot_locations)]
            u = generate_user_persona(
                self.user_rng,
                i + 1,
                user_id_prefix="usr_rw_camp",
                bot_style=is_bot,
                creation_window_start=self.config.start_time - timedelta(days=180),
                creation_window_end=self.config.start_time - timedelta(days=2),
                custom_interests=["geopolitics", "defense policy", "conflict analysis", "energy security"],
            )
            u.location = loc
            campaign_users.append(u)

        all_users = organic_users + campaign_users
        self.user_rng.shuffle(all_users)

        # 3. Ground Truth Setup
        gt_builder = GroundTruthBuilder(scenario_type="realworld_geopolitical_conflict", has_coordination=True)
        for u in organic_users:
            gt_builder.add_noise_user(u.user_id)

        campaign_id = "cmp_realworld_geopolitical_01"
        gt_builder.register_campaign(
            campaign_id=campaign_id,
            campaign_name="Operation Baltic & Indo-Pacific Disinformation",
            narrative_theme="Coordinated information operation amplifying frontline Baltic troop repositioning, naval blockades, and critical infrastructure cyber attacks",
            coordination_type="multi_tier_hybrid_io",
            targeted_entities=REALWORLD_HASHTAGS + REALWORLD_DOMAINS,
            coordination_signatures=[
                "synchronized_burst_amplification",
                "cross_domain_syndication",
                "astroturf_grassroots_fabrication",
                "geopolitical_escalation_waves",
            ],
            notes="Real-world defense and conflict scenario for spatial intelligence and threat mapping accuracy validation.",
        )

        for u in campaign_users:
            gt_builder.add_user_to_campaign(campaign_id, u.user_id)

        posts: List[PostRecord] = []

        # 4. Organic Posts
        for u in organic_users:
            post_count = self.post_rng.randint(2, 6)
            timestamps = sample_organic_timeline(
                self.post_rng,
                post_count,
                self.config.start_time,
                self.config.end_time,
            )
            for ts in timestamps:
                tier = sample_length_tier(self.post_rng, ContentProfile.REALWORLD)
                content, entities = compose_organic_post(
                    self.post_rng,
                    length_tier=tier,
                    profile=ContentProfile.REALWORLD,
                )
                if self.post_rng.random() < 0.35:
                    tag = self.post_rng.choice(REALWORLD_HASHTAGS)
                    if tag not in entities.hashtags:
                        entities.hashtags.append(tag)
                    content += f" #{tag}"

                p = PostRecord(
                    post_id=f"pst_rw_org_{len(posts)+1:05d}",
                    author_id=u.user_id,
                    content=content,
                    created_at=ts.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    entities=entities,
                    metrics=PostMetrics(
                        likes_count=self.post_rng.randint(0, 45),
                        reposts_count=self.post_rng.randint(0, 12),
                        replies_count=self.post_rng.randint(0, 6),
                    ),
                    client_source="Web App",
                )
                posts.append(p)

        # 5. Coordinated Campaign Posts
        num_burst_waves = 4
        total_duration = self.config.end_time - self.config.start_time
        wave_interval = total_duration / (num_burst_waves + 1)

        for wave in range(1, num_burst_waves + 1):
            wave_center = self.config.start_time + wave_interval * wave
            burst_timestamps = sample_burst_timeline(
                self.post_rng,
                campaign_user_count,
                wave_center,
                duration_seconds=1500,
            )

            stage_num = min(4, wave)
            stage_data = STAGE_NARRATIVES[stage_num]

            for idx, u in enumerate(campaign_users):
                ts = burst_timestamps[idx]
                tier = sample_length_tier(self.post_rng, ContentProfile.REALWORLD)

                claim = self.post_rng.choice(stage_data.get("claims", stage_data.get("openers", stage_data.get("statements", []))))
                evidence = self.post_rng.choice(STAGE_NARRATIVES[1]["evidence_links"])
                tag1 = self.post_rng.choice(REALWORLD_HASHTAGS)
                tag2 = self.post_rng.choice([t for t in REALWORLD_HASHTAGS if t != tag1])

                if stage_num == 1:
                    content = f"{claim} Source: {evidence} #{tag1} #{tag2}"
                elif stage_num == 2:
                    header = self.post_rng.choice(STAGE_NARRATIVES[2]["headers"])
                    action = self.post_rng.choice(STAGE_NARRATIVES[2]["actions"])
                    content = f"{header} {claim} {action} #{tag1} #{tag2}"
                elif stage_num == 3:
                    content = f"{claim} Reports indicate escalating regional tension. Details: {evidence} #{tag1}"
                else:
                    statement = self.post_rng.choice(STAGE_NARRATIVES[4]["statements"])
                    content = f"INTERNATIONAL COMMUNIQUE: {statement} Full dispatch at {evidence} #{tag1} #{tag2}"

                entities = PostEntities(
                    hashtags=[tag1, tag2],
                    urls=[evidence],
                    mentions=[],
                )

                p = PostRecord(
                    post_id=f"pst_rw_camp_{len(posts)+1:05d}",
                    author_id=u.user_id,
                    content=content,
                    created_at=ts.strftime("%Y-%m-%dT%H:%M:%SZ"),
                    entities=entities,
                    metrics=PostMetrics(
                        likes_count=self.post_rng.randint(20, 280),
                        reposts_count=self.post_rng.randint(15, 140),
                        replies_count=self.post_rng.randint(5, 50),
                    ),
                    client_source="FeedDistributor Pro" if (idx % 2 == 0) else "BroadcastAutomation",
                )
                posts.append(p)
                gt_builder.add_post_to_campaign(campaign_id, p.post_id)

        posts.sort(key=lambda x: x.created_at)

        return all_users, posts, gt_builder.build()
