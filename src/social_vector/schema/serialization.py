"""Deterministic JSON serialization and deserialization for SocialVector datasets."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Union

from social_vector.schema.models import SocialDataset


def dataset_to_dict(dataset: SocialDataset) -> Dict[str, Any]:
    """Convert a SocialDataset model instance into a serializable dictionary."""
    return dataset.to_dict()


def dict_to_dataset(data: Dict[str, Any]) -> SocialDataset:
    """Convert a raw dictionary into a SocialDataset model instance."""
    return SocialDataset.from_dict(data)


def dataset_to_json(dataset: SocialDataset, indent: int = 2) -> str:
    """Serialize a SocialDataset model into a formatted JSON string deterministically."""
    return json.dumps(dataset.to_dict(), indent=indent, ensure_ascii=False)


def json_to_dataset(json_str: str) -> SocialDataset:
    """Parse a JSON string into a SocialDataset model instance."""
    data = json.loads(json_str)
    return dict_to_dataset(data)


def save_dataset_to_file(dataset: SocialDataset, file_path: Union[str, Path], pretty: bool = True) -> Path:
    """Save a SocialDataset instance to a JSON file."""
    path = Path(file_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    indent = 2 if pretty else None
    with open(path, "w", encoding="utf-8") as f:
        json.dump(dataset.to_dict(), f, indent=indent, ensure_ascii=False)
    return path


def load_dataset_from_file(file_path: Union[str, Path]) -> SocialDataset:
    """Load a SocialDataset instance from a JSON file."""
    path = Path(file_path)
    if not path.is_file():
        raise FileNotFoundError(f"Dataset file not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return dict_to_dataset(data)
