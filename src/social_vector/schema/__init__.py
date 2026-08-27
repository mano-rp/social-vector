"""Schema definitions, models, and serialization for SocialVector datasets."""

from social_vector.schema.models import (
    CampaignGroundTruth,
    DatasetMetadata,
    GroundTruth,
    PostEntities,
    PostMetrics,
    PostRecord,
    SocialDataset,
    UserMetrics,
    UserRecord,
)
from social_vector.schema.serialization import (
    dataset_to_dict,
    dataset_to_json,
    dict_to_dataset,
    json_to_dataset,
    load_dataset_from_file,
    save_dataset_to_file,
)
from social_vector.schema.validation import validate_dataset

__all__ = [
    "CampaignGroundTruth",
    "DatasetMetadata",
    "GroundTruth",
    "PostEntities",
    "PostMetrics",
    "PostRecord",
    "SocialDataset",
    "UserMetrics",
    "UserRecord",
    "dataset_to_dict",
    "dataset_to_json",
    "dict_to_dataset",
    "json_to_dataset",
    "load_dataset_from_file",
    "save_dataset_to_file",
    "validate_dataset",
]
