"""Deterministic template composition and paraphrase engines for synthetic posts."""

from __future__ import annotations

from typing import List, Optional, Tuple

from social_vector.generation.seed import DeterministicRNG
from social_vector.generation.vocabulary import (
    CAMPAIGN_DOMAINS,
    LEGITIMATE_DOMAINS,
    ORGANIC_TOPIC_LEXICONS,
    PARAPHRASE_FRAMES,
)
from social_vector.schema.models import PostEntities


def compose_organic_post(
    rng: DeterministicRNG,
    topic: Optional[str] = None,
    include_url: bool = False,
    include_hashtag: bool = True,
    include_mention: bool = False,
    known_usernames: Optional[List[str]] = None,
) -> Tuple[str, PostEntities]:
    """Compose a realistic organic social post on a specified or random topic."""
    available_topics = list(ORGANIC_TOPIC_LEXICONS.keys())
    selected_topic = topic if (topic in ORGANIC_TOPIC_LEXICONS) else rng.choice(available_topics)
    lexicon = ORGANIC_TOPIC_LEXICONS[selected_topic]

    template = rng.choice(lexicon["templates"])
    noun = rng.choice(lexicon["nouns"])
    verb = rng.choice(lexicon["verbs"])
    content = template.format(noun=noun, verb=verb)

    hashtags: List[str] = []
    mentions: List[str] = []
    urls: List[str] = []

    if include_hashtag and lexicon["hashtags"]:
        tag = rng.choice(lexicon["hashtags"])
        content = f"{content} #{tag}"
        hashtags.append(tag)

    if include_mention and known_usernames:
        mention = rng.choice(known_usernames)
        content = f"@{mention} {content}"
        mentions.append(mention)

    if include_url:
        domain = rng.choice(LEGITIMATE_DOMAINS)
        slug = f"article-{rng.randint(1000, 99999)}"
        url = f"https://{domain}/news/{slug}"
        content = f"{content} {url}"
        urls.append(url)

    entities = PostEntities(
        hashtags=hashtags,
        mentions=mentions,
        urls=urls,
        media_urls=[],
    )

    return content, entities


def compose_coordinated_exact_post(
    rng: DeterministicRNG,
    campaign_slug: str,
    campaign_url: str,
    campaign_hashtags: List[str],
) -> Tuple[str, PostEntities]:
    """Compose an obvious coordinated campaign post with high verbatim repetition."""
    base_messages = [
        "URGENT: Municipal utility report confirms catastrophic grid vulnerability. Read the full investigation:",
        "Critical energy safety alert: Leaked documents show concealed power station failures. Full report:",
        "Massive utility failure exposed! Officials ignored safety warnings for months. Verified findings:",
        "Warning to all residents: Grid reserves at historic dangerous lows. See unredacted audit:",
    ]
    # In exact coordination, select from a very tight set of canned messages
    msg = rng.choice(base_messages)
    tag_str = " ".join([f"#{t}" for t in campaign_hashtags])
    content = f"{msg} {campaign_url} {tag_str}"

    entities = PostEntities(
        hashtags=list(campaign_hashtags),
        mentions=[],
        urls=[campaign_url],
        media_urls=[],
    )
    return content, entities


def compose_paraphrased_campaign_post(
    rng: DeterministicRNG,
    frame_key: str = "grid_disinformation",
    campaign_domain: Optional[str] = None,
) -> Tuple[str, PostEntities, str]:
    """Compose a subtle paraphrased campaign post with structural variations and shared semantic narrative."""
    frame = PARAPHRASE_FRAMES.get(frame_key, PARAPHRASE_FRAMES["grid_disinformation"])

    opener = rng.choice(frame["openers"])
    claim = rng.choice(frame["core_claims"])
    evidence = rng.choice(frame["evidence_phrases"])
    cta = rng.choice(frame["calls_to_action"])

    domain = campaign_domain or rng.choice(CAMPAIGN_DOMAINS)
    path_id = f"doc_{rng.randint(100, 999)}"
    url = f"https://{domain}/reports/{path_id}"

    # Select 1 or 2 hashtags from campaign pool
    num_tags = rng.randint(1, 2)
    selected_tags = rng.sample(frame["hashtags"], k=num_tags)
    tag_str = " ".join([f"#{t}" for t in selected_tags])

    # Structure variation
    structure_variant = rng.randint(1, 3)
    if structure_variant == 1:
        content = f"{opener} {claim}. {evidence} {url} {cta} {tag_str}"
    elif structure_variant == 2:
        content = f"{cta} {opener} {claim}. {evidence} {url} {tag_str}"
    else:
        content = f"{claim.capitalize()}. {opener.lower()} this crisis is escalating. {url} {tag_str}"

    entities = PostEntities(
        hashtags=selected_tags,
        mentions=[],
        urls=[url],
        media_urls=[],
    )
    narrative_id = frame_key
    return content, entities, narrative_id


def compose_viral_organic_post(
    rng: DeterministicRNG,
    frame_key: str = "organic_viral_eclipse",
) -> Tuple[str, PostEntities]:
    """Compose an organic post during a high-similarity viral event (false positive benchmark)."""
    frame = PARAPHRASE_FRAMES.get(frame_key, PARAPHRASE_FRAMES["organic_viral_eclipse"])
    reaction = rng.choice(frame["reactions"])

    # Organic users occasionally add personal flavor
    personal_flairs = [
        "", " Worth the drive.", " Can't wait for the next one in 2045.",
        " Captured some raw frames on my camera.", " Glad the clouds cleared up just in time!",
        " My kids were completely mesmerized."
    ]
    flair = rng.choice(personal_flairs)

    tag = rng.choice(frame["hashtags"])
    content = f"{reaction}{flair} #{tag}"

    entities = PostEntities(
        hashtags=[tag],
        mentions=[],
        urls=[],
        media_urls=[],
    )
    return content, entities
