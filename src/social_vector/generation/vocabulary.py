"""Domain pools, topic lexicons, and structured phrase banks for deterministic text generation."""

from __future__ import annotations

from typing import Dict, List

LEGITIMATE_DOMAINS = [
    "reuters.com", "apnews.com", "bbc.com", "nature.com", "arstechnica.com",
    "techcrunch.com", "theverge.com", "bloomberg.com", "sciencedaily.com",
    "wired.com", "theatlantic.com", "economist.com", "ieee.org", "mit.edu",
    "scientificamerican.com", "spectrum.ieee.org", "acm.org"
]

CAMPAIGN_DOMAINS = [
    "news-direct24.info", "truth-report-now.net", "fastnews-daily.co",
    "pulse-dispatch.org", "flash-wire.biz", "global-alert24.io",
    "grid-watchdog-bulletin.net", "investor-insider-alerts.com"
]

# Structured multi-tier topic lexicons for coherent multi-sentence post assembly
ORGANIC_TOPIC_LEXICONS: Dict[str, Dict[str, List[str]]] = {
    "technology": {
        "nouns": [
            "distributed consensus engine", "compiler optimization pipeline", "LSM-tree storage backend",
            "API gateway latency budget", "zero-copy network buffer", "eBPF telemetry kernel hook",
            "asynchronous task scheduler", "vector search indexing algorithm", "columnar query execution"
        ],
        "verbs": ["benchmarked", "refactored", "profiled", "audited", "migrated", "optimized", "re-architected"],
        "contexts": [
            "Over the past week, our engineering team has been investigating intermittent latency spikes during high-throughput load tests.",
            "We recently completed a major architectural overhaul of our core data processing pipeline.",
            "Working through production profiling traces revealed several subtle bottlenecks in our telemetry pipeline.",
            "I've spent the weekend digging into modern memory management strategies for low-latency services.",
            "A fascinating discussion came up in our systems architecture review regarding distributed state synchronization."
        ],
        "details": [
            "Tracing memory allocations showed that lock contention in the {noun} was causing p99 latencies to degrade by over 350ms under sustained load.",
            "Switching from mutex-guarded queues to a lock-free ring buffer reduced CPU cache thrashing significantly across all worker nodes.",
            "We observed that garbage collection pauses dropped from 45ms down to sub-millisecond levels after moving scratch buffers off-heap.",
            "The synthetic benchmark results confirmed a 4.2x throughput increase while maintaining strict consistency guarantees across partitions.",
            "Instrumenting the {noun} with fine-grained counters helped isolate a subtle thread starvation issue under concurrent writer pressure."
        ],
        "critiques": [
            "While the performance gains are impressive, the cognitive complexity of debugging lock-free code remains a genuine trade-off.",
            "It's tempting to prematurely optimize every hot path, but comprehensive instrumentation should always guide where you invest complexity.",
            "One unexpected complication was maintaining backwards compatibility with older telemetry clients during the migration.",
            "This highlights why reproducible benchmarking harnesses are indispensable before rolling out fundamental infrastructure changes."
        ],
        "conclusions": [
            "Clean abstractions and rigorous profiling will always beat speculative guesswork in distributed systems.",
            "Curious if other teams have encountered similar memory layout issues when scaling past 100k concurrent streams.",
            "We're preparing a detailed technical post-mortem documenting our findings and open benchmarks for the wider community.",
            "Excited to see how this architecture performs once we roll out the next regional cluster."
        ],
        "hashtags": ["SoftwareEngineering", "DevOps", "OpenSource", "RustLang", "SystemsDesign", "CloudArchitecture", "PerformanceTuning"]
    },
    "climate_energy": {
        "nouns": [
            "utility-scale battery storage system", "smart grid demand-response telemetry", "high-voltage DC transmission line",
            "distributed rooftop solar inverter", "offshore wind turbine wake model", "municipal district heating network",
            "grid-forming virtual synchronous generator", "industrial thermal energy storage"
        ],
        "verbs": ["deployed", "calibrated", "analyzed", "commissioned", "simulated", "interconnected", "modernized"],
        "contexts": [
            "The regional transmission operator just released their quarterly grid reliability and renewable integration summary.",
            "Our municipal energy working group spent the day reviewing capacity factor data from the new renewable installations.",
            "Fascinating developments are taking place in regional grid balancing as seasonal solar generation reaches historic peaks.",
            "Reviewing the latest public utility filings reveals noticeable shifts in peak-demand management strategies.",
            "Decentralized energy infrastructure is moving from experimental pilots into mainstream municipal utility planning."
        ],
        "details": [
            "Data from the past three months shows that {noun} installations smoothed out evening ramp-up deficits by more than 28%.",
            "During the heatwave last Tuesday, automated frequency regulation responded in under 120 milliseconds, preventing voltage sag.",
            "Levelized cost comparisons indicate that pairing solar arrays with local storage is now consistently cheaper than peaker plant operation.",
            "Grid telemetry recorded zero uncompensated curtailment hours across the entire northern distribution sector this month.",
            "Thermal imaging and telemetry verified that round-trip efficiency on the new {noun} exceeded engineering projections by 4.5%."
        ],
        "critiques": [
            "However, long-term transmission interconnection queues remain a major regulatory hurdle slowing down broader regional deployment.",
            "We still need more robust market mechanisms that fairly compensate distributed storage providers for localized grid stability services.",
            "Supply chain constraints on specialized power electronics are currently the primary bottleneck rather than raw generation capacity.",
            "Community engagement and transparent siting reviews are essential to ensure infrastructure investments deliver equitable local benefits."
        ],
        "conclusions": [
            "Accelerating grid modernization requires aligned policy frameworks just as much as breakthrough hardware engineering.",
            "The transition toward resilient, low-carbon power systems is rapidly demonstrating both technical and economic viability.",
            "Looking forward to seeing how these operational models scale as neighboring districts join the shared balancing authority.",
            "A well-engineered grid is the quiet backbone of sustainable urban prosperity."
        ],
        "hashtags": ["CleanEnergy", "EnergyTransition", "GridModernization", "SolarPower", "Sustainability", "RenewableInfrastructure"]
    },
    "science_space": {
        "nouns": [
            "space-based infrared interferometer", "exoplanetary atmospheric spectrometer", "gravitational wave detector baseline",
            "cryogenic radio receiver array", "stellar flare polarization sensor", "lunar regolith mineral mapping payload",
            "solar coronal mass ejection monitor", "sub-millimeter astronomical observatory"
        ],
        "verbs": ["calibrated", "detected", "resolved", "measured", "cataloged", "synthesized", "verified"],
        "contexts": [
            "The latest preprint from the international astronomical collaboration presents some genuinely surprising observational results.",
            "Our astrophysics department held an engaging seminar today discussing multi-messenger observations of recent compact mergers.",
            "Clear observation conditions at the high-altitude observatory allowed our team to capture an exceptional spectral dataset.",
            "New telemetry from the deep-space survey probe has provided unprecedented resolution of the targeted stellar nursery.",
            "Reviewing archival sky survey logs alongside new telescope data has uncovered several previously unclassified transient signals."
        ],
        "details": [
            "High-resolution spectroscopic filtering of the {noun} revealed distinct absorption lines corresponding to atmospheric water vapor and methane.",
            "The signal-to-noise ratio in the high-frequency band improved by an order of magnitude following the cryogenic sensor upgrade.",
            "By cross-correlating radio and optical time-series data, researchers successfully constrained the orbital eccentricity down to three decimal places.",
            "The photometric light curve exhibited periodic micro-dips consistent with a multi-planet resonant chain orbiting the host star.",
            "Telemetry confirmed that the {noun} maintained pointing stability within 0.02 arcseconds throughout the entire six-hour integration window."
        ],
        "critiques": [
            "Interpreting these faint atmospheric signatures requires cautious validation against terrestrial instrumental calibration artifacts.",
            "Independent verification from ground-based arrays will be crucial before drawing definitive conclusions about prebiotic chemical abundance.",
            "Data reduction pipelines had to filter out substantial orbital debris reflections before the true astrophysical signal emerged clearly.",
            "The theoretical implications challenge existing planetary migration models, prompting lively debate among stellar dynamicists."
        ],
        "conclusions": [
            "Every leap in observational precision reminds us how much richer and more intricate the universe is than our baseline models.",
            "The open science framework and public release of raw calibration datasets will enable research teams worldwide to explore this phenomenon.",
            "Eagerly anticipating the follow-up spectroscopy runs scheduled for the next observing semester.",
            "Science advances one rigorous, peer-reviewed measurement at a time."
        ],
        "hashtags": ["Astronomy", "Astrophysics", "SpaceScience", "Cosmology", "ObservationalAstronomy", "PeerReview", "OpenScience"]
    },
    "urban_community": {
        "nouns": [
            "separated bicycle boulevard network", "bus rapid transit priority corridor", "community land trust housing initiative",
            "permeable stormwater parklet", "neighborhood public library commons", "urban forestry canopy expansion",
            "pedestrianized commercial streetscape", "municipal composting and resource hub"
        ],
        "verbs": ["implemented", "evaluated", "expanded", "inaugurated", "redesigned", "surveyed", "revitalized"],
        "contexts": [
            "The municipal planning commission published their six-month impact evaluation of the downtown streetscape revitalization.",
            "Spent the morning walking through the newly opened community corridor with local neighborhood advocates and urban planners.",
            "Local transit ridership figures for the past quarter demonstrate how thoughtful design directly influences public mobility choices.",
            "Our neighborhood association gathered this evening to discuss participatory budgeting priorities for upcoming civic improvements.",
            "Reflecting on how small-scale urban design interventions can fundamentally reshape community social cohesion and safety."
        ],
        "details": [
            "Pedestrian foot traffic along the revitalized corridor increased by 42%, while local small business retail sales rose by 19% year-over-year.",
            "Installing dedicated transit signal priority reduced average bus commute delays during morning rush hours by nearly eight minutes.",
            "The addition of native shade trees and rain gardens lowered surface street temperatures by an average of 4.2 degrees during summer afternoons.",
            "Survey responses from over 1,200 local residents indicated that 84% feel significantly safer walking and cycling through the district.",
            "The new {noun} successfully diverted over 120 tons of organic waste from regional landfills in its first ninety days of operation."
        ],
        "critiques": [
            "Ensuring that public infrastructure upgrades do not inadvertently accelerate housing displacement remains a critical civic imperative.",
            "Ongoing maintenance budgets must be guaranteed upfront so public spaces remain clean, welcoming, and accessible to everyone.",
            "Balancing curbside delivery access for small merchants while maintaining protected bike lanes requires continuous communicative flexibility.",
            "True civic progress happens when community members with lived experience lead the conversation alongside technical planners."
        ],
        "conclusions": [
            "Human-scale urban design transforms our cities from mere transit conduits into vibrant places of shared civic life.",
            "When cities invest in accessible public spaces, the compounding returns in public health, commerce, and connection are immense.",
            "Looking forward to seeing these proven design principles extended into neighboring districts across the metropolitan area.",
            "Great cities are built through steady, compassionate, and evidence-based community stewardship."
        ],
        "hashtags": ["UrbanPlanning", "PublicTransit", "WalkableCities", "CommunityBuilding", "CivicDesign", "SustainableCities"]
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
        "contexts": [
            "Still trying to process the absolute awe of experiencing the total solar eclipse from our viewing spot today.",
            "Our whole family drove four hours into the path of totality, and it exceeded every single expectation.",
            "Witnessing totality firsthand is something no photograph or live broadcast can ever truly prepare you for.",
            "The atmosphere at the public observatory park during the eclipse was unforgettable.",
            "Just packed up the telescope and solar filters after observing one of the most magnificent astronomical events of our lifetime."
        ],
        "details": [
            "When the moon fully occluded the sun, the temperature dropped noticeably by almost eight degrees in less than three minutes.",
            "The solar corona appeared as delicate, shimmering pearlescent ribbons stretching millions of kilometers into the darkened sky.",
            "We were able to clearly see three massive pink prominence flares leaping off the solar limb through our telephoto lens.",
            "Right before totality, the shadow bands rippled across the open ground like water currents under an eerie 360-degree sunset horizon.",
            "All the birds in the surrounding trees suddenly went dead silent as nocturnal crickets began chirping in the midday darkness."
        ],
        "reflections": [
            "Looking around at hundreds of strangers collectively cheering and gasping in shared wonder was deeply moving.",
            "Moments like this give you profound perspective on our tiny place in the cosmic clockwork.",
            "Huge shout-out to the local astronomy club volunteers who handed out certified ISO filter glasses and guided kids through telescope views.",
            "Already looking at orbital charts for the next major eclipse path in 2045."
        ],
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
            "SolarEclipse2026", "Totality", "EclipseDay", "AstronomyLovers", "SkyWatch", "CosmicPerspective", "AmateurAstronomy"
        ]
    }
}
