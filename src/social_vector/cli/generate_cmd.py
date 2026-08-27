"""CLI command handler for dataset generation."""

from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from social_vector.generation.engine import DatasetGenerator, GenerationConfig
from social_vector.schema.serialization import dataset_to_json, save_dataset_to_file


def parse_iso_datetime(dt_str: Optional[str]) -> Optional[datetime]:
    """Parse ISO datetime string into datetime object with UTC timezone."""
    if not dt_str:
        return None
    try:
        clean = dt_str.replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception as e:
        raise ValueError(f"Invalid ISO datetime format '{dt_str}': {e}")


def run_generate_command(
    scenario: str,
    users: int,
    posts_per_user: int,
    seed: int,
    output: Optional[str],
    campaign_ratio: float,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    pretty: bool = True,
    quiet: bool = False,
) -> int:
    """Execute dataset generation with given CLI parameters."""
    start_dt = parse_iso_datetime(start_date)
    end_dt = parse_iso_datetime(end_date)

    config = GenerationConfig(
        scenario=scenario,
        user_count=users,
        posts_per_user=posts_per_user,
        seed=seed,
        start_time=start_dt,
        end_time=end_dt,
        campaign_ratio=campaign_ratio,
    )

    if not quiet:
        sys.stderr.write(f"Generating dataset with scenario '{scenario}', {users} users, seed={seed}...\n")

    try:
        generator = DatasetGenerator(config)
        dataset = generator.generate()
    except Exception as e:
        sys.stderr.write(f"Error during dataset generation: {e}\n")
        return 1

    if output and output != "-":
        out_path = Path(output)
        save_dataset_to_file(dataset, out_path, pretty=pretty)
        if not quiet:
            sys.stderr.write(
                f"Successfully generated {len(dataset.users)} users, {len(dataset.posts)} posts -> {out_path}\n"
            )
    else:
        json_output = dataset_to_json(dataset, indent=2 if pretty else None)
        print(json_output)

    return 0
