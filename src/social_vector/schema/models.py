"""Schema data models for SocialVector datasets and observations."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class UserMetrics:
    """Observable metrics associated with a user account."""

    followers_count: int = 0
    following_count: int = 0
    posts_count: int = 0
    listed_count: int = 0

    def to_dict(self) -> Dict[str, int]:
        return {
            "followers_count": self.followers_count,
            "following_count": self.following_count,
            "posts_count": self.posts_count,
            "listed_count": self.listed_count,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> UserMetrics:
        return cls(
            followers_count=int(data.get("followers_count", 0)),
            following_count=int(data.get("following_count", 0)),
            posts_count=int(data.get("posts_count", 0)),
            listed_count=int(data.get("listed_count", 0)),
        )


@dataclass
class UserRecord:
    """Observable record of an individual social-media user profile."""

    user_id: str
    username: str
    display_name: str
    bio: str
    created_at: str
    location: Optional[str] = None
    metrics: UserMetrics = field(default_factory=UserMetrics)
    verified: bool = False
    profile_image_url: Optional[str] = None
    account_type: str = "individual"
    language: str = "en"
    device_client: str = "Web Client"
    custom_attributes: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "username": self.username,
            "display_name": self.display_name,
            "bio": self.bio,
            "created_at": self.created_at,
            "location": self.location,
            "metrics": self.metrics.to_dict(),
            "verified": self.verified,
            "profile_image_url": self.profile_image_url,
            "account_type": self.account_type,
            "language": self.language,
            "device_client": self.device_client,
            "custom_attributes": self.custom_attributes,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> UserRecord:
        metrics_data = data.get("metrics", {})
        metrics = UserMetrics.from_dict(metrics_data) if isinstance(metrics_data, dict) else UserMetrics()
        return cls(
            user_id=str(data.get("user_id", "")),
            username=str(data.get("username", "")),
            display_name=str(data.get("display_name", "")),
            bio=str(data.get("bio", "")),
            created_at=str(data.get("created_at", "")),
            location=data.get("location"),
            metrics=metrics,
            verified=bool(data.get("verified", False)),
            profile_image_url=data.get("profile_image_url"),
            account_type=str(data.get("account_type", "individual")),
            language=str(data.get("language", "en")),
            device_client=str(data.get("device_client", "Web Client")),
            custom_attributes=dict(data.get("custom_attributes", {})),
        )


@dataclass
class PostEntities:
    """Entities extracted from post text (hashtags, mentions, URLs, media)."""

    hashtags: List[str] = field(default_factory=list)
    mentions: List[str] = field(default_factory=list)
    urls: List[str] = field(default_factory=list)
    media_urls: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, List[str]]:
        return {
            "hashtags": list(self.hashtags),
            "mentions": list(self.mentions),
            "urls": list(self.urls),
            "media_urls": list(self.media_urls),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> PostEntities:
        return cls(
            hashtags=[str(h) for h in data.get("hashtags", [])],
            mentions=[str(m) for m in data.get("mentions", [])],
            urls=[str(u) for u in data.get("urls", [])],
            media_urls=[str(m) for m in data.get("media_urls", [])],
        )


@dataclass
class PostMetrics:
    """Observable interaction and engagement counts for a post."""

    likes_count: int = 0
    reposts_count: int = 0
    replies_count: int = 0
    quotes_count: int = 0
    impressions_count: int = 0

    def to_dict(self) -> Dict[str, int]:
        return {
            "likes_count": self.likes_count,
            "reposts_count": self.reposts_count,
            "replies_count": self.replies_count,
            "quotes_count": self.quotes_count,
            "impressions_count": self.impressions_count,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> PostMetrics:
        return cls(
            likes_count=int(data.get("likes_count", 0)),
            reposts_count=int(data.get("reposts_count", 0)),
            replies_count=int(data.get("replies_count", 0)),
            quotes_count=int(data.get("quotes_count", 0)),
            impressions_count=int(data.get("impressions_count", 0)),
        )


@dataclass
class PostRecord:
    """Observable record of an individual social-media post."""

    post_id: str
    author_id: str
    created_at: str
    content: str
    language: str = "en"
    entities: PostEntities = field(default_factory=PostEntities)
    metrics: PostMetrics = field(default_factory=PostMetrics)
    reply_to_post_id: Optional[str] = None
    repost_of_post_id: Optional[str] = None
    client_source: str = "Web Client"
    custom_attributes: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "post_id": self.post_id,
            "author_id": self.author_id,
            "created_at": self.created_at,
            "content": self.content,
            "language": self.language,
            "entities": self.entities.to_dict(),
            "metrics": self.metrics.to_dict(),
            "reply_to_post_id": self.reply_to_post_id,
            "repost_of_post_id": self.repost_of_post_id,
            "client_source": self.client_source,
            "custom_attributes": self.custom_attributes,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> PostRecord:
        entities_data = data.get("entities", {})
        entities = PostEntities.from_dict(entities_data) if isinstance(entities_data, dict) else PostEntities()
        metrics_data = data.get("metrics", {})
        metrics = PostMetrics.from_dict(metrics_data) if isinstance(metrics_data, dict) else PostMetrics()
        return cls(
            post_id=str(data.get("post_id", "")),
            author_id=str(data.get("author_id", "")),
            created_at=str(data.get("created_at", "")),
            content=str(data.get("content", "")),
            language=str(data.get("language", "en")),
            entities=entities,
            metrics=metrics,
            reply_to_post_id=data.get("reply_to_post_id"),
            repost_of_post_id=data.get("repost_of_post_id"),
            client_source=str(data.get("client_source", "Web Client")),
            custom_attributes=dict(data.get("custom_attributes", {})),
        )


@dataclass
class CampaignGroundTruth:
    """Ground-truth metadata describing an intentionally generated campaign."""

    campaign_id: str
    campaign_name: str
    narrative_theme: str
    coordination_type: str
    participating_user_ids: List[str] = field(default_factory=list)
    affiliated_post_ids: List[str] = field(default_factory=list)
    targeted_entities: List[str] = field(default_factory=list)
    temporal_windows: List[Dict[str, str]] = field(default_factory=list)
    coordination_signatures: List[str] = field(default_factory=list)
    notes: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "campaign_id": self.campaign_id,
            "campaign_name": self.campaign_name,
            "narrative_theme": self.narrative_theme,
            "coordination_type": self.coordination_type,
            "participating_user_ids": list(self.participating_user_ids),
            "affiliated_post_ids": list(self.affiliated_post_ids),
            "targeted_entities": list(self.targeted_entities),
            "temporal_windows": list(self.temporal_windows),
            "coordination_signatures": list(self.coordination_signatures),
            "notes": self.notes,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> CampaignGroundTruth:
        return cls(
            campaign_id=str(data.get("campaign_id", "")),
            campaign_name=str(data.get("campaign_name", "")),
            narrative_theme=str(data.get("narrative_theme", "")),
            coordination_type=str(data.get("coordination_type", "")),
            participating_user_ids=[str(u) for u in data.get("participating_user_ids", [])],
            affiliated_post_ids=[str(p) for p in data.get("affiliated_post_ids", [])],
            targeted_entities=[str(t) for t in data.get("targeted_entities", [])],
            temporal_windows=list(data.get("temporal_windows", [])),
            coordination_signatures=[str(s) for s in data.get("coordination_signatures", [])],
            notes=str(data.get("notes", "")),
        )


@dataclass
class GroundTruth:
    """Isolated ground-truth data known only to the synthetic generator."""

    has_coordination: bool = False
    scenario_type: str = "organic"
    campaigns: List[CampaignGroundTruth] = field(default_factory=list)
    noise_user_ids: List[str] = field(default_factory=list)
    evaluation_benchmarks: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "has_coordination": self.has_coordination,
            "scenario_type": self.scenario_type,
            "campaigns": [c.to_dict() for c in self.campaigns],
            "noise_user_ids": list(self.noise_user_ids),
            "evaluation_benchmarks": self.evaluation_benchmarks,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> GroundTruth:
        campaigns_raw = data.get("campaigns", [])
        campaigns = [CampaignGroundTruth.from_dict(c) for c in campaigns_raw if isinstance(c, dict)]
        return cls(
            has_coordination=bool(data.get("has_coordination", False)),
            scenario_type=str(data.get("scenario_type", "organic")),
            campaigns=campaigns,
            noise_user_ids=[str(u) for u in data.get("noise_user_ids", [])],
            evaluation_benchmarks=dict(data.get("evaluation_benchmarks", {})),
        )


@dataclass
class DatasetMetadata:
    """Provenance and configuration metadata for a dataset."""

    dataset_id: str
    schema_version: str = "1.0.0"
    generator_name: str = "SocialVector Dataset Generator"
    generator_version: str = "0.1.0"
    scenario: str = "organic"
    seed: int = 42
    created_at: str = ""
    parameters: Dict[str, Any] = field(default_factory=dict)
    statistics: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "dataset_id": self.dataset_id,
            "schema_version": self.schema_version,
            "generator_name": self.generator_name,
            "generator_version": self.generator_version,
            "scenario": self.scenario,
            "seed": self.seed,
            "created_at": self.created_at,
            "parameters": self.parameters,
            "statistics": self.statistics,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> DatasetMetadata:
        return cls(
            dataset_id=str(data.get("dataset_id", "")),
            schema_version=str(data.get("schema_version", "1.0.0")),
            generator_name=str(data.get("generator_name", "SocialVector Dataset Generator")),
            generator_version=str(data.get("generator_version", "0.1.0")),
            scenario=str(data.get("scenario", "organic")),
            seed=int(data.get("seed", 42)),
            created_at=str(data.get("created_at", "")),
            parameters=dict(data.get("parameters", {})),
            statistics=dict(data.get("statistics", {})),
        )


@dataclass
class SocialDataset:
    """Complete container for an observable social-media observation dataset."""

    metadata: DatasetMetadata
    users: List[UserRecord] = field(default_factory=list)
    posts: List[PostRecord] = field(default_factory=list)
    ground_truth: Optional[GroundTruth] = None

    def to_dict(self) -> Dict[str, Any]:
        result: Dict[str, Any] = {
            "metadata": self.metadata.to_dict(),
            "users": [u.to_dict() for u in self.users],
            "posts": [p.to_dict() for p in self.posts],
        }
        if self.ground_truth is not None:
            result["ground_truth"] = self.ground_truth.to_dict()
        return result

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> SocialDataset:
        metadata_data = data.get("metadata", {})
        metadata = DatasetMetadata.from_dict(metadata_data) if isinstance(metadata_data, dict) else DatasetMetadata(dataset_id="")
        
        users_raw = data.get("users", [])
        users = [UserRecord.from_dict(u) for u in users_raw if isinstance(u, dict)]
        
        posts_raw = data.get("posts", [])
        posts = [PostRecord.from_dict(p) for p in posts_raw if isinstance(p, dict)]
        
        ground_truth = None
        if "ground_truth" in data and isinstance(data["ground_truth"], dict):
            ground_truth = GroundTruth.from_dict(data["ground_truth"])
            
        return cls(
            metadata=metadata,
            users=users,
            posts=posts,
            ground_truth=ground_truth,
        )
