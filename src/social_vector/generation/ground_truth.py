"""Ground truth construction and benchmark validation builder."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from social_vector.schema.models import CampaignGroundTruth, GroundTruth


class GroundTruthBuilder:
    """Builder for assembling isolated ground-truth metadata during synthetic generation."""

    def __init__(self, scenario_type: str, has_coordination: bool = False):
        self.scenario_type = scenario_type
        self.has_coordination = has_coordination
        self._campaigns: Dict[str, CampaignGroundTruth] = {}
        self._noise_user_ids: List[str] = []
        self._evaluation_benchmarks: Dict[str, Any] = {}

    def register_campaign(
        self,
        campaign_id: str,
        campaign_name: str,
        narrative_theme: str,
        coordination_type: str,
        targeted_entities: Optional[List[str]] = None,
        temporal_windows: Optional[List[Dict[str, str]]] = None,
        coordination_signatures: Optional[List[str]] = None,
        notes: str = "",
    ) -> CampaignGroundTruth:
        """Register a new ground-truth campaign."""
        camp = CampaignGroundTruth(
            campaign_id=campaign_id,
            campaign_name=campaign_name,
            narrative_theme=narrative_theme,
            coordination_type=coordination_type,
            participating_user_ids=[],
            affiliated_post_ids=[],
            targeted_entities=targeted_entities or [],
            temporal_windows=temporal_windows or [],
            coordination_signatures=coordination_signatures or [],
            notes=notes,
        )
        self._campaigns[campaign_id] = camp
        self.has_coordination = True
        return camp

    def add_user_to_campaign(self, campaign_id: str, user_id: str) -> None:
        """Associate a user ID with an intentional campaign."""
        if campaign_id in self._campaigns:
            if user_id not in self._campaigns[campaign_id].participating_user_ids:
                self._campaigns[campaign_id].participating_user_ids.append(user_id)

    def add_post_to_campaign(self, campaign_id: str, post_id: str) -> None:
        """Associate a post ID with an intentional campaign."""
        if campaign_id in self._campaigns:
            if post_id not in self._campaigns[campaign_id].affiliated_post_ids:
                self._campaigns[campaign_id].affiliated_post_ids.append(post_id)

    def add_noise_user(self, user_id: str) -> None:
        """Register a user as a pure organic background noise participant."""
        if user_id not in self._noise_user_ids:
            self._noise_user_ids.append(user_id)

    def set_benchmark(self, key: str, value: Any) -> None:
        """Set expected analytical benchmark values for downstream evaluation."""
        self._evaluation_benchmarks[key] = value

    def build(self) -> GroundTruth:
        """Construct the final immutable GroundTruth object."""
        return GroundTruth(
            has_coordination=self.has_coordination,
            scenario_type=self.scenario_type,
            campaigns=list(self._campaigns.values()),
            noise_user_ids=list(self._noise_user_ids),
            evaluation_benchmarks=dict(self._evaluation_benchmarks),
        )
