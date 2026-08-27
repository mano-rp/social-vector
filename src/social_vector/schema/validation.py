"""Schema and integrity validation for SocialVector datasets."""

from __future__ import annotations

from datetime import datetime
from typing import List, Set

from social_vector.schema.models import SocialDataset


def validate_iso_timestamp(timestamp_str: str) -> bool:
    """Verify whether a timestamp string adheres to ISO 8601 UTC format."""
    if not isinstance(timestamp_str, str) or not timestamp_str:
        return False
    try:
        # Support formats like 2026-08-27T22:00:00Z or +00:00
        clean_str = timestamp_str.replace("Z", "+00:00")
        datetime.fromisoformat(clean_str)
        return True
    except (ValueError, TypeError):
        return False


def validate_dataset(dataset: SocialDataset) -> List[str]:
    """Validate structural and referential integrity of a SocialDataset.
    
    Returns:
        List of error messages describing integrity failures. Empty list if dataset is valid.
    """
    errors: List[str] = []

    # 1. Metadata Validation
    if not dataset.metadata:
        errors.append("Dataset metadata is missing.")
    else:
        if not dataset.metadata.dataset_id:
            errors.append("Dataset metadata is missing 'dataset_id'.")
        if not dataset.metadata.schema_version:
            errors.append("Dataset metadata is missing 'schema_version'.")
        if dataset.metadata.created_at and not validate_iso_timestamp(dataset.metadata.created_at):
            errors.append(f"Dataset metadata 'created_at' timestamp is invalid: {dataset.metadata.created_at}")

    # 2. Users Validation
    user_ids: Set[str] = set()
    usernames: Set[str] = set()
    for idx, user in enumerate(dataset.users):
        if not user.user_id:
            errors.append(f"User at index {idx} has empty user_id.")
        elif user.user_id in user_ids:
            errors.append(f"Duplicate user_id detected: {user.user_id}")
        else:
            user_ids.add(user.user_id)

        if not user.username:
            errors.append(f"User '{user.user_id or idx}' has empty username.")
        elif user.username in usernames:
            errors.append(f"Duplicate username detected: {user.username}")
        else:
            usernames.add(user.username)

        if user.created_at and not validate_iso_timestamp(user.created_at):
            errors.append(f"User '{user.user_id}' has invalid created_at timestamp: {user.created_at}")

        # Check for prohibited ground-truth leaks into user custom attributes
        if "ground_truth" in user.custom_attributes or "is_bot" in user.custom_attributes or "campaign_id" in user.custom_attributes:
            errors.append(f"Observable record for user '{user.user_id}' contains leaked ground-truth metadata.")

    # 3. Posts Validation
    post_ids: Set[str] = set()
    for idx, post in enumerate(dataset.posts):
        if not post.post_id:
            errors.append(f"Post at index {idx} has empty post_id.")
        elif post.post_id in post_ids:
            errors.append(f"Duplicate post_id detected: {post.post_id}")
        else:
            post_ids.add(post.post_id)

        if not post.author_id:
            errors.append(f"Post '{post.post_id or idx}' has empty author_id.")
        elif post.author_id not in user_ids:
            errors.append(f"Post '{post.post_id}' references unknown author_id: {post.author_id}")

        if post.created_at and not validate_iso_timestamp(post.created_at):
            errors.append(f"Post '{post.post_id}' has invalid created_at timestamp: {post.created_at}")

        if post.reply_to_post_id and post.reply_to_post_id not in post_ids and post.reply_to_post_id == post.post_id:
            errors.append(f"Post '{post.post_id}' cannot reply to itself.")

        # Check for prohibited ground-truth leaks into post custom attributes
        if "ground_truth" in post.custom_attributes or "campaign_id" in post.custom_attributes or "is_coordinated" in post.custom_attributes:
            errors.append(f"Observable record for post '{post.post_id}' contains leaked ground-truth metadata.")

    # 4. Ground Truth Validation (if present)
    if dataset.ground_truth is not None:
        gt = dataset.ground_truth
        for c_idx, campaign in enumerate(gt.campaigns):
            if not campaign.campaign_id:
                errors.append(f"Ground truth campaign at index {c_idx} missing campaign_id.")
            for uid in campaign.participating_user_ids:
                if uid not in user_ids:
                    errors.append(f"Ground truth campaign '{campaign.campaign_id}' references non-existent user_id: {uid}")
            for pid in campaign.affiliated_post_ids:
                if pid not in post_ids:
                    errors.append(f"Ground truth campaign '{campaign.campaign_id}' references non-existent post_id: {pid}")

        for noise_uid in gt.noise_user_ids:
            if noise_uid not in user_ids:
                errors.append(f"Ground truth noise user references non-existent user_id: {noise_uid}")

    return errors
