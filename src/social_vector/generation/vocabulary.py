"""Domain pools, topic lexicons, and phrase substitution banks for deterministic text generation."""

from __future__ import annotations

from typing import Dict, List

LEGITIMATE_DOMAINS = [
    "reuters.com", "apnews.com", "bbc.com", "nature.com", "arstechnica.com",
    "techcrunch.com", "theverge.com", "bloomberg.com", "sciencedaily.com",
    "wired.com", "theatlantic.com", "economist.com", "ieee.org", "mit.edu"
]

CAMPAIGN_DOMAINS = [
    "news-direct24.info", "truth-report-now.net", "fastnews-daily.co",
    "pulse-dispatch.org", "flash-wire.biz", "global-alert24.io",
    "grid-watchdog-bulletin.net", "investor-insider-alerts.com"
]

ORGANIC_TOPIC_LEXICONS: Dict[str, Dict[str, List[str]]] = {
    "technology": {
        "nouns": ["distributed system", "compiler optimization", "database index", "API gateway", "latency benchmark", "open source kernel", "memory allocator", "runtime profiling"],
        "verbs": ["benchmarked", "refactored", "deployed", "debugged", "optimized", "migrated", "analyzed"],
        "hashtags": ["SoftwareEngineering", "DevOps", "OpenSource", "RustLang", "Python", "CloudComputing", "SystemsDesign"],
        "templates": [
            "Just finished evaluating our new {noun}. The performance improvement is substantial.",
            "Interesting observations after we {verb} the telemetry pipeline this morning. Highly recommend checking memory profiles.",
            "Reading up on recent developments in {noun}. Clean architecture makes all the difference.",
            "Working through a tricky race condition in the {noun}. Standard logging saved the day.",
            "Excited to see modern tooling making {noun} so much easier to maintain across large teams."
        ]
    },
    "climate_energy": {
        "nouns": ["rooftop solar adoption", "grid battery storage", "heat pump efficiency", "transmission capacity", "offshore wind farm", "microgrid resilience", "smart meter deployment"],
        "verbs": ["recorded", "installed", "measured", "modeled", "integrated", "expanded", "evaluated"],
        "hashtags": ["CleanEnergy", "SolarPower", "GridModernization", "RenewableEnergy", "Sustainability", "EnergyTransition"],
        "templates": [
            "Regional data shows {noun} grew by over 18% quarter-over-quarter. Solid momentum.",
            "Our municipal team {verb} the new solar telemetry feed. Clear gains during peak demand hours.",
            "Key takeaway from the renewable summit: {noun} remains vital for long-term grid reliability.",
            "Fascinating analysis on how {noun} balances frequency fluctuations during seasonal shifts.",
            "Investing in {noun} pays off far sooner than older cost models predicted."
        ]
    },
    "science_space": {
        "nouns": ["lunar orbital survey", "deep-space spectroscopy", "exoplanet transit data", "gravitational wave detection", "radio telescope array", "space weather monitoring"],
        "verbs": ["observed", "calibrated", "detected", "published", "confirmed", "cataloged"],
        "hashtags": ["Astronomy", "Astrophysics", "SpaceScience", "Cosmology", "NASA", "ScienceDaily"],
        "templates": [
            "New dataset from the {noun} reveals intriguing atmospheric chemical signatures.",
            "Researchers just {verb} an unprecedented high-resolution view of the transit event.",
            "Looking forward to the peer-reviewed breakdown of the latest {noun} findings.",
            "Clear skies tonight allowed our observatory team to verify the preliminary {noun} metrics.",
            "The precision of modern {noun} instruments continues to astonish me."
        ]
    },
    "urban_community": {
        "nouns": ["protected bike lane", "bus rapid transit", "neighborhood park expansion", "pedestrian plaza", "community garden", "public library initiative"],
        "verbs": ["opened", "visited", "tested", "supported", "reviewed", "documented"],
        "hashtags": ["UrbanPlanning", "PublicTransit", "WalkableCities", "Community", "CityLife", "ActiveTransit"],
        "templates": [
            "The newly completed {noun} has noticeably improved morning commute times downtown.",
            "Stopped by the {noun} on the way home. Vibrant civic spaces make our city thrive.",
            "Great turnout at the community hall discussing the upcoming {noun} proposal.",
            "Really impressed by how quickly local residents embraced the new {noun}.",
            "Good urban infrastructure starts with accessible {noun} for everyone."
        ]
    }
}

PARAPHRASE_FRAMES: Dict[str, Dict[str, List[str]]] = {
    "grid_disinformation": {
        "openers": [
            "Breaking investigation reveals that",
            "A newly leaked internal report proves",
            "Urgent findings document that",
            "Uncovered municipal documents indicate",
            "Whistleblower disclosures show that",
            "Independent auditors have officially confirmed",
            "Shocking data just released highlights how"
        ],
        "core_claims": [
            "the regional utility is hiding massive grid instability risks",
            "subsidized solar installations are causing severe frequency drops across district substations",
            "critical power reserves dropped below emergency safety thresholds last week",
            "municipal power managers intentionally concealed hazardous distribution failures",
            "ratepayers are being forced to subsidize unsafe experimental battery arrays"
        ],
        "evidence_phrases": [
            "Detailed engineering evidence and log metrics:",
            "Read the unredacted investigation files here:",
            "Full forensic breakdown available at:",
            "See the verified engineer logs and telemetry:",
            "Official audit documentation linked here:"
        ],
        "calls_to_action": [
            "Demand immediate state legislative oversight before blackout season.",
            "Spread the truth before this report gets scrubbed.",
            "Every resident needs to demand an emergency public hearing.",
            "Share this widely to protect our community from rolling blackouts.",
            "Regulators must freeze planned rate increases immediately."
        ],
        "hashtags": [
            "GridEmergency", "PowerAuditNow", "UtilityScandal", "BlackoutWatch", "EnergyAccountability"
        ]
    },
    "organic_viral_eclipse": {
        "reactions": [
            "Absolutely stunning view of the solar eclipse today!",
            "Never seen anything quite like totality. The temperature drop was unreal.",
            "Caught the eclipse peak right through the solar filter glasses. Breathtaking.",
            "The coronal flares visible during the eclipse were unbelievable.",
            "Still processing how incredible totality was. Nature is awe-inspiring.",
            "Viewing the eclipse with friends from the park was an unforgettable experience.",
            "Look at these eclipse shadow bands on the ground! Science is amazing."
        ],
        "hashtags": [
            "SolarEclipse2026", "Totality", "EclipseDay", "AstronomyLovers", "SkyWatch"
        ]
    }
}
