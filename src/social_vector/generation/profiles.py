"""Content profiles and post length distribution specifications."""

from __future__ import annotations

from enum import Enum
from typing import Dict, List


class ContentProfile(str, Enum):
    """Configurable content generation profile."""

    STANDARD = "standard"        # Compact baseline posts
    REALISTIC = "realistic"      # Multi-sentence coherent organic and campaign discourse
    EXTREME = "extreme"          # High-intensity multi-stage fictional geopolitical information operation

    @classmethod
    def from_str(cls, value: str) -> ContentProfile:
        """Resolve a string or alias to a ContentProfile."""
        clean = value.lower().strip().replace("-", "_")
        aliases = {
            "standard": cls.STANDARD,
            "concise": cls.STANDARD,
            "basic": cls.STANDARD,
            "realistic": cls.REALISTIC,
            "rich": cls.REALISTIC,
            "detailed": cls.REALISTIC,
            "extreme": cls.EXTREME,
            "extreme_io": cls.EXTREME,
            "geopolitical": cls.EXTREME,
            "high_intensity": cls.EXTREME,
        }
        if clean in aliases:
            return aliases[clean]
        try:
            return cls(clean)
        except ValueError:
            valid = ", ".join([p.value for p in cls])
            raise ValueError(f"Unknown content profile '{value}'. Valid profiles: {valid}")


class PostLengthTier(str, Enum):
    """Length and structural depth category for generated posts."""

    SHORT = "short"          # 1-2 sentences: immediate reactions, status updates, short alerts
    MEDIUM = "medium"        # 2-4 sentences: context + analytical observation + commentary
    LONG = "long"            # 4-7 sentences: background + evidence/data + critique + conclusion
    VERY_LONG = "very_long"  # 7-12 sentences / multi-paragraph: in-depth investigation breakdowns, communiques


# Probability distribution over length tiers for each content profile
PROFILE_LENGTH_WEIGHTS: Dict[ContentProfile, Dict[PostLengthTier, float]] = {
    ContentProfile.STANDARD: {
        PostLengthTier.SHORT: 0.85,
        PostLengthTier.MEDIUM: 0.15,
        PostLengthTier.LONG: 0.00,
        PostLengthTier.VERY_LONG: 0.00,
    },
    ContentProfile.REALISTIC: {
        PostLengthTier.SHORT: 0.25,
        PostLengthTier.MEDIUM: 0.45,
        PostLengthTier.LONG: 0.22,
        PostLengthTier.VERY_LONG: 0.08,
    },
    ContentProfile.EXTREME: {
        PostLengthTier.SHORT: 0.20,
        PostLengthTier.MEDIUM: 0.35,
        PostLengthTier.LONG: 0.30,
        PostLengthTier.VERY_LONG: 0.15,
    },
}
