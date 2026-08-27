"""Fictional geopolitical universe, multi-stage information operation narrative frames, and actor roles."""

from __future__ import annotations

from enum import Enum
from typing import Dict, List, Optional, Tuple

from social_vector.generation.profiles import ContentProfile, PostLengthTier
from social_vector.generation.seed import DeterministicRNG
from social_vector.schema.models import PostEntities


class CampaignStage(str, Enum):
    """Temporal and narrative stages of a coordinated information operation."""

    STAGE_1_SEEDING = "stage_1_narrative_seeding"
    STAGE_2_AMPLIFICATION = "stage_2_breaking_amplification"
    STAGE_3_GRASSROOTS = "stage_3_manufactured_grassroots"
    STAGE_4_COUNTER_ATTACK = "stage_4_counter_narrative_attack"
    STAGE_5_ESCALATION = "stage_5_geopolitical_escalation"
    STAGE_6_PERSISTENCE = "stage_6_persistent_reinforcement"


class CampaignActorRole(str, Enum):
    """Specialized narrative role assigned to participating campaign accounts."""

    SEED_LEAKER = "seed_leaker"
    STATE_MEDIA = "state_aligned_media"
    BREAKING_WIRE = "breaking_wire"
    ASTROTURF_CITIZEN = "astroturf_citizen"
    COUNTER_ATTACK = "counter_narrative_attacker"
    GEOPOLITICAL_ANALYST = "geopolitical_analyst"
    AMPLIFIER_BOT = "automated_amplifier"


FICTIONAL_DOMAINS = [
    "vanguardleaks.cc",
    "asteriadispatch.info",
    "velmorachronicle.org",
    "kestreleyewatch.net",
    "globalstrategicmonitor.co",
    "truthwavenews.biz",
]

GEOPOLITICAL_HASHTAGS = [
    "KestrelDisaster",
    "AsteriaCoverup",
    "AMMSLeaks",
    "PortKestrelCrisis",
    "TreatyOfOakhaven",
    "SanctionAsteria",
    "MaritimeAccountability",
    "VelmoraSecurity",
    "CleanKestrelSound",
]

STAGE_NARRATIVES: Dict[CampaignStage, Dict[str, List[str]]] = {
    CampaignStage.STAGE_1_SEEDING: {
        "claims": [
            "Declassified telemetry logs from Substation Alpha-7 confirm an undisclosed toxic solvent discharge in the Kestrel Sound strait.",
            "Whistleblower transcript from within the Asteria Ministry of Maritime Safety (AMMS) reveals emergency containment protocols were triggered six days ago.",
            "Sonar recordings obtained by independent maritime monitors indicate an unacknowledged collision involving Asterian naval patrol vessels near the Oakhaven Deepwater Ridge.",
            "Internal technical memos from Port Kestrel Marine Terminal show water purity sensor readings exceeding hazardous toxicity limits by 400%."
        ],
        "evidence_links": [
            "https://vanguardleaks.cc/dossier/kestrel-telemetry-04",
            "https://vanguardleaks.cc/amms-internal-memo-unredacted",
            "https://kestreleyewatch.net/investigation/substation-alpha7-leak",
            "https://truthwavenews.biz/special-report/kestrel-sonar-logs"
        ],
        "quotes": [
            "\"The Ministry instructed on-duty operators to disable automated public telemetry beacons immediately following the midnight pressure drop.\" — AMMS Technician Elena Rostova",
            "\"Chemical dispersants were deployed without notifying neighboring Velmoran coastal authorities or regional fishery boards.\"",
            "\"Admiral Julian Thorne personally signed off on withholding the environmental contamination impact model from municipal leaders.\""
        ]
    },
    CampaignStage.STAGE_2_AMPLIFICATION: {
        "headers": [
            "BREAKING INVESTIGATION:",
            "URGENT DEVELOPMENTS:",
            "EXCLUSIVE DISPATCH:",
            "CRISIS ALERT:"
        ],
        "claims": [
            "State media confirms massive industrial contamination spreading across the Kestrel Sound maritime corridor following covert Asterian naval operation.",
            "Multiple independent radar and sonar tracking stations verify unauthorized chemical containment ships operating off Port Kestrel under darkness.",
            "Regional coastal authorities issue emergency warnings as satellite imagery confirms extensive surface sheen reaching the Oakhaven fishing grounds."
        ],
        "calls_to_action": [
            "Share this unredacted report before state authorities restrict access.",
            "Demand an immediate international inspection team at Substation Alpha-7.",
            "Do not let the Asterian Ministry sweep this environmental catastrophe under the rug."
        ]
    },
    CampaignStage.STAGE_3_GRASSROOTS: {
        "personae_openers": [
            "As a third-generation fisherman in Port Kestrel, I have never seen our waters like this.",
            "My family lives less than two miles from the North Kestrel bay, and the chemical smell coming off the tide is overwhelming.",
            "Local marine businesses are already reporting massive fish kills along the coastline, yet official news broadcasts remain completely silent.",
            "Our municipal drinking water treatment facility just suspended intake from the bay without explaining why to residents."
        ],
        "demands": [
            "We need independent international doctors and oceanographers testing our water right now, not government press releases.",
            "Why is the Asterian Coast Guard preventing local citizen boats from documenting the oil sheen near Reef-12?",
            "Our livelihoods and our children's health are being sacrificed to protect naval leadership from political scandal."
        ]
    },
    CampaignStage.STAGE_4_COUNTER_ATTACK: {
        "rebuttals": [
            "Asteria Ministry of Maritime Safety is now issuing laughable denials claiming the leak is a 'routine training exercise'. Nobody believes them.",
            "Notice how mainstream Asterian news outlets are coordinated in attacking the whistleblowers rather than addressing the verified water toxicity numbers.",
            "Admiral Julian Thorne's latest press statement is a desperate cover-up attempt that completely contradicts their own internal sonar telemetry.",
            "Any journalist attempting to report on the Port Kestrel contamination is being harassed by state telecommunications regulators."
        ],
        "attack_frames": [
            "Their paid 'fact-checkers' can't explain away the dead marine life washing up on Oakhaven shores.",
            "When government officials tell you 'there is no danger' while deploying military containment barriers, you know the truth.",
            "The credibility of AMMS is permanently destroyed. Resignations and public prosecutions must begin immediately."
        ]
    },
    CampaignStage.STAGE_5_ESCALATION: {
        "geopolitical_claims": [
            "The State of Velmora has officially filed an emergency diplomatic protest citing blatant violations of the 2019 Treaty of Oakhaven.",
            "International maritime law experts declare Asteria's chemical discharge an unprovoked cross-border ecological aggression.",
            "The Federal Territory of Oakhaven announces emergency border water monitoring and calls for immediate international trade sanctions against Asterian ports.",
            "Velmoran naval units place maritime reconnaissance wings on high alert to protect international transit lanes through the Kestrel Strait."
        ],
        "demands": [
            "The UN Maritime Safety Council must convene an emergency session to impose immediate sanctions on Asterian state ports.",
            "All neighboring regional economies must halt energy imports from Substation Alpha-7 until full restitution is paid.",
            "Diplomatic immunity must not protect the naval commanders responsible for this cross-border disaster."
        ]
    },
    CampaignStage.STAGE_6_PERSISTENCE: {
        "summaries": [
            "One week after the Kestrel Sound disaster: Asteria still refuses to grant access to International Maritime Audit Panel inspectors.",
            "Never forget the Port Kestrel catastrophe. We have compiled the complete permanent archive of leaked memos, sonar logs, and satellite evidence.",
            "The comprehensive documentary dossier on the Asteria chemical cover-up is now mirrored across permanent decentralized storage.",
            "Demand justice for the affected coastal communities of Asteria, Velmora, and Oakhaven. Sign the international accountability petition below."
        ],
        "links": [
            "https://vanguardleaks.cc/permanent-archive/kestrel-disaster-dossier",
            "https://globalstrategicmonitor.co/special/kestrel-sound-investigation-complete",
            "https://kestreleyewatch.net/dossier/accountability-petition-2026"
        ]
    }
}


def compose_extreme_campaign_post(
    rng: DeterministicRNG,
    stage: CampaignStage,
    actor_role: CampaignActorRole,
    length_tier: Optional[PostLengthTier] = None,
    profile: ContentProfile = ContentProfile.EXTREME,
) -> Tuple[str, PostEntities]:
    """Compose a dramatic, realistic multi-sentence post for the extreme information operation scenario."""
    stage_data = STAGE_NARRATIVES[stage]
    tier = length_tier or PostLengthTier.LONG

    sentences: List[str] = []
    hashtags: List[str] = []
    urls: List[str] = []

    if stage == CampaignStage.STAGE_1_SEEDING:
        claim = rng.choice(stage_data["claims"])
        quote = rng.choice(stage_data["quotes"])
        link = rng.choice(stage_data["evidence_links"])
        sentences.append(claim)
        sentences.append(quote)
        sentences.append(f"Full unredacted telemetry and leak documentation available at: {link}")
        urls.append(link)
        hashtags.extend(["AMMSLeaks", "KestrelDisaster", "PortKestrelCrisis"])

    elif stage == CampaignStage.STAGE_2_AMPLIFICATION:
        hdr = rng.choice(stage_data["headers"])
        claim = rng.choice(stage_data["claims"])
        cta = rng.choice(stage_data["calls_to_action"])
        domain = rng.choice(FICTIONAL_DOMAINS)
        link = f"https://{domain}/breaking/kestrel-crisis-{rng.randint(100, 999)}"
        sentences.append(f"{hdr} {claim}")
        sentences.append(f"Read continuous updates and verified satellite tracking logs: {link}")
        sentences.append(cta)
        urls.append(link)
        hashtags.extend(["KestrelDisaster", "AsteriaCoverup", "MaritimeAccountability"])

    elif stage == CampaignStage.STAGE_3_GRASSROOTS:
        opener = rng.choice(stage_data["personae_openers"])
        demand = rng.choice(stage_data["demands"])
        sentences.append(opener)
        sentences.append(demand)
        sentences.append("The national government is trying to silence local residents, but we will not be quiet.")
        hashtags.extend(["CleanKestrelSound", "PortKestrelCrisis", "AsteriaCoverup"])

    elif stage == CampaignStage.STAGE_4_COUNTER_ATTACK:
        rebuttal = rng.choice(stage_data["rebuttals"])
        attack = rng.choice(stage_data["attack_frames"])
        sentences.append(rebuttal)
        sentences.append(attack)
        sentences.append("Do not trust the official state media broadcast. Demand immediate transparency and criminal accountability.")
        hashtags.extend(["AsteriaCoverup", "AMMSLeaks", "MaritimeAccountability"])

    elif stage == CampaignStage.STAGE_5_ESCALATION:
        geo_claim = rng.choice(stage_data["geopolitical_claims"])
        demand = rng.choice(stage_data["demands"])
        domain = rng.choice(FICTIONAL_DOMAINS)
        link = f"https://{domain}/diplomatic/treaty-violation-briefing"
        sentences.append(geo_claim)
        sentences.append(demand)
        sentences.append(f"Official diplomatic communique analysis: {link}")
        urls.append(link)
        hashtags.extend(["TreatyOfOakhaven", "SanctionAsteria", "VelmoraSecurity", "KestrelDisaster"])

    else:  # STAGE_6_PERSISTENCE
        summary = rng.choice(stage_data["summaries"])
        link = rng.choice(stage_data["links"])
        sentences.append(summary)
        sentences.append(f"Access the permanent dossier and open evidence repository: {link}")
        urls.append(link)
        hashtags.extend(["KestrelDisaster", "MaritimeAccountability", "PortKestrelCrisis"])

    # If short tier requested, trim to first 2 sentences
    if tier == PostLengthTier.SHORT and len(sentences) > 2:
        sentences = sentences[:2]

    body = "\n\n".join(sentences)
    tag_str = " ".join([f"#{t}" for t in hashtags[:3]])
    content = f"{body}\n\n{tag_str}"

    entities = PostEntities(
        hashtags=hashtags[:3],
        mentions=[],
        urls=urls,
        media_urls=[],
    )

    return content, entities
