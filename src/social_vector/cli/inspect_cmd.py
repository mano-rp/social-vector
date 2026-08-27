"""CLI command handler for inspecting and validating SocialVector dataset files."""

from __future__ import annotations

import sys
from collections import Counter
from pathlib import Path
from typing import Optional

from social_vector.schema.serialization import load_dataset_from_file
from social_vector.schema.validation import validate_dataset


def run_inspect_command(file_path: str, verbose: bool = False) -> int:
    """Inspect and validate a dataset JSON file, outputting summary diagnostics."""
    path = Path(file_path)
    if not path.is_file():
        sys.stderr.write(f"Error: File not found: {file_path}\n")
        return 1

    try:
        dataset = load_dataset_from_file(path)
    except Exception as e:
        sys.stderr.write(f"Error parsing dataset JSON: {e}\n")
        return 1

    # Validate integrity
    errors = validate_dataset(dataset)
    is_valid = len(errors) == 0

    print("=" * 60)
    print(f"SocialVector Dataset Inspection: {path.name}")
    print("=" * 60)
    print(f"Dataset ID:        {dataset.metadata.dataset_id}")
    print(f"Schema Version:    {dataset.metadata.schema_version}")
    print(f"Generator:         {dataset.metadata.generator_name} (v{dataset.metadata.generator_version})")
    print(f"Scenario:          {dataset.metadata.scenario}")
    print(f"Seed:              {dataset.metadata.seed}")
    print(f"Created At:        {dataset.metadata.created_at}")
    print("-" * 60)
    print(f"Integrity Status:  {'VALID' if is_valid else 'INVALID'}")
    if not is_valid:
        print("Validation Errors:")
        for err in errors:
            print(f"  - {err}")
    print("-" * 60)
    print(f"Total Users:       {len(dataset.users)}")
    print(f"Total Posts:       {len(dataset.posts)}")

    # Extract statistics
    if dataset.posts:
        all_tags = [t for p in dataset.posts for t in p.entities.hashtags]
        tag_counts = Counter(all_tags).most_common(5)
        top_tags_str = ", ".join([f"#{tag} ({cnt})" for tag, cnt in tag_counts]) if tag_counts else "None"
        print(f"Top Hashtags:      {top_tags_str}")

        all_urls = [u for p in dataset.posts for u in p.entities.urls]
        print(f"Total URLs linked: {len(all_urls)}")

    if dataset.ground_truth is not None:
        gt = dataset.ground_truth
        print("-" * 60)
        print("Ground Truth Summary (Generator Knowledge):")
        print(f"  Has Coordination: {gt.has_coordination}")
        print(f"  Scenario Type:    {gt.scenario_type}")
        print(f"  Campaigns Count:  {len(gt.campaigns)}")
        for idx, camp in enumerate(gt.campaigns, 1):
            print(f"    Campaign {idx}: {camp.campaign_name} ({camp.campaign_id})")
            print(f"      Theme:        {camp.narrative_theme}")
            print(f"      Type:         {camp.coordination_type}")
            print(f"      Actors:       {len(camp.participating_user_ids)} users")
            print(f"      Posts:        {len(camp.affiliated_post_ids)} posts")
            print(f"      Signatures:   {', '.join(camp.coordination_signatures)}")
        print(f"  Noise Users:      {len(gt.noise_user_ids)}")
    else:
        print("-" * 60)
        print("Ground Truth:      None (Pure Observation Dataset)")
    print("=" * 60)

    return 0 if is_valid else 1
