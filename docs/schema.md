# SocialVector Dataset Schema Specification

Version: 1.0.0

## Overview

SocialVector uses a structured, versioned JSON format to represent social media observation feeds and ground-truth metadata. The schema separates observable data (what an analyst or system could extract from a platform) from generator-level ground truth (known facts about intentionally simulated campaigns).

## Top-Level Schema Structure

A SocialVector dataset file contains the following top-level objects:

```json
{
  "metadata": { ... },
  "users": [ ... ],
  "posts": [ ... ],
  "ground_truth": { ... }
}
```

---

## 1. Dataset Metadata (`metadata`)

Provenance and generation parameters for the dataset.

| Field | Type | Description |
|---|---|---|
| `dataset_id` | string | Unique, stable dataset identifier (e.g., `ds_organic_activity_42_10u`). |
| `schema_version` | string | Semantic schema version (`1.0.0`). |
| `generator_name` | string | Name of the generating engine. |
| `generator_version` | string | Version string of the generator software. |
| `scenario` | string | Identifier of the scenario used to produce the data. |
| `seed` | integer | Deterministic random seed integer used for generation. |
| `created_at` | string | ISO 8601 UTC timestamp of generation (`YYYY-MM-DDTHH:MM:SSZ`). |
| `parameters` | object | Key-value dictionary of parameters supplied during generation. |
| `statistics` | object | Computed summary statistics (total users, total posts, interaction counts). |

---

## 2. Observable User Record (`users`)

An array of user profiles observed in the social feed.

| Field | Type | Description |
|---|---|---|
| `user_id` | string | Unique, stable user identifier (e.g., `usr_org_000001`). |
| `username` | string | User handle (e.g., `alex_vance_01`). |
| `display_name` | string | Human-readable profile name (e.g., `Alex Vance`). |
| `bio` | string | Profile biography or description text. |
| `created_at` | string | Account creation timestamp in ISO 8601 UTC format. |
| `location` | string / null | Geographic location string or null if undisclosed. |
| `metrics` | object | User-level interaction and network counts. |
| `metrics.followers_count` | integer | Number of followers. |
| `metrics.following_count` | integer | Number of followed accounts. |
| `metrics.posts_count` | integer | Historical post count of the account. |
| `metrics.listed_count` | integer | Number of public lists containing the account. |
| `verified` | boolean | Account verification status flag. |
| `profile_image_url` | string / null | Profile image URI or null. |
| `account_type` | string | Classification (`individual`, `organization`, `unverified_individual`, `automated_feed`). |
| `language` | string | Primary ISO 639-1 language code (`en`). |
| `device_client` | string | Observable client software string (e.g., `Web Client`, `iOS App`, `Android App`). |
| `custom_attributes` | object | Extensible key-value store for future observable attributes. |

---

## 3. Observable Post Record (`posts`)

An array of posts published by users.

| Field | Type | Description |
|---|---|---|
| `post_id` | string | Unique, stable post identifier (e.g., `pst_org_0000001`). |
| `author_id` | string | Foreign key linking to the author's `user_id`. |
| `created_at` | string | Publication timestamp in ISO 8601 UTC format. |
| `content` | string | Raw textual body of the post. |
| `language` | string | ISO 639-1 language code (`en`). |
| `entities` | object | Structured extracted artifacts. |
| `entities.hashtags` | array[string] | List of hashtags extracted from the post body. |
| `entities.mentions` | array[string] | List of user handles mentioned in the post. |
| `entities.urls` | array[string] | List of web URLs included in the post. |
| `entities.media_urls` | array[string] | List of media attachment URLs. |
| `metrics` | object | Engagement and interaction counters. |
| `metrics.likes_count` | integer | Number of likes. |
| `metrics.reposts_count` | integer | Number of reposts/retweets. |
| `metrics.replies_count` | integer | Number of direct replies. |
| `metrics.quotes_count` | integer | Number of quote reposts. |
| `metrics.impressions_count` | integer | Number of post impressions. |
| `reply_to_post_id` | string / null | Target `post_id` if post is a reply. |
| `repost_of_post_id` | string / null | Target `post_id` if post is a repost. |
| `client_source` | string | Observable client/application name. |
| `custom_attributes` | object | Extensible key-value store for custom attributes. |

---

## 4. Ground Truth (`ground_truth`)

Isolated ground-truth block populated exclusively by the synthetic generator. Observable fields never contain ground-truth labels.

| Field | Type | Description |
|---|---|---|
| `has_coordination` | boolean | True if deliberate coordination was embedded in the scenario. |
| `scenario_type` | string | Canonical scenario name. |
| `campaigns` | array[object] | Array of intentional campaign definitions. |
| `campaigns[].campaign_id` | string | Stable campaign identifier (e.g., `cmp_overt_grid_01`). |
| `campaigns[].campaign_name` | string | Descriptive campaign name. |
| `campaigns[].narrative_theme` | string | Semantic narrative theme of the campaign. |
| `campaigns[].coordination_type` | string | Type (`exact_repetition`, `paraphrased_semantic`, `hashtag_hijack`, `temporal_burst`). |
| `campaigns[].participating_user_ids` | array[string] | Complete list of user IDs participating in the campaign. |
| `campaigns[].affiliated_post_ids` | array[string] | Complete list of post IDs generated as part of the campaign. |
| `campaigns[].targeted_entities` | array[string] | Targeted hashtags, domains, or usernames. |
| `campaigns[].temporal_windows` | array[object] | Start and end ISO timestamps for coordination windows. |
| `campaigns[].coordination_signatures` | array[string] | Descriptors of embedded coordination patterns. |
| `campaigns[].notes` | string | Detailed benchmark evaluation notes. |
| `noise_user_ids` | array[string] | List of user IDs who acted purely as organic background noise. |
| `evaluation_benchmarks` | object | Expected quantitative metrics for benchmark evaluation. |
