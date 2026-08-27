"""Deterministic template composition and multi-sentence discourse engines."""

from __future__ import annotations

from typing import List, Optional, Tuple

from social_vector.generation.profiles import (
    PROFILE_LENGTH_WEIGHTS,
    ContentProfile,
    PostLengthTier,
)
from social_vector.generation.seed import DeterministicRNG
from social_vector.generation.vocabulary import (
    CAMPAIGN_DOMAINS,
    LEGITIMATE_DOMAINS,
    ORGANIC_TOPIC_LEXICONS,
    PARAPHRASE_FRAMES,
)
from social_vector.schema.models import PostEntities


def sample_length_tier(rng: DeterministicRNG, profile: ContentProfile = ContentProfile.REALISTIC) -> PostLengthTier:
    """Sample a post length tier based on the configured content profile."""
    weights_dict = PROFILE_LENGTH_WEIGHTS.get(profile, PROFILE_LENGTH_WEIGHTS[ContentProfile.REALISTIC])
    tiers = list(weights_dict.keys())
    weights = [weights_dict[t] for t in tiers]
    return rng.choices(tiers, weights=weights, k=1)[0]


def compose_organic_post(
    rng: DeterministicRNG,
    topic: Optional[str] = None,
    include_url: bool = False,
    include_hashtag: bool = True,
    include_mention: bool = False,
    known_usernames: Optional[List[str]] = None,
    length_tier: Optional[PostLengthTier] = None,
    profile: ContentProfile = ContentProfile.REALISTIC,
) -> Tuple[str, PostEntities]:
    """Compose a realistic, semantically coherent organic post of variable length."""
    available_topics = list(ORGANIC_TOPIC_LEXICONS.keys())
    selected_topic = topic if (topic in ORGANIC_TOPIC_LEXICONS) else rng.choice(available_topics)
    lexicon = ORGANIC_TOPIC_LEXICONS[selected_topic]

    tier = length_tier or sample_length_tier(rng, profile)

    noun = rng.choice(lexicon["nouns"])
    verb = rng.choice(lexicon["verbs"])

    sentences: List[str] = []

    if tier == PostLengthTier.SHORT:
        # 1-2 sentences: context or concise observation
        if "contexts" in lexicon and rng.random() < 0.5:
            sentences.append(rng.choice(lexicon["contexts"]))
        else:
            detail_tmpl = rng.choice(lexicon["details"])
            sentences.append(detail_tmpl.format(noun=noun, verb=verb))
    elif tier == PostLengthTier.MEDIUM:
        # 2-4 sentences: context + detail + reflection
        if "contexts" in lexicon:
            sentences.append(rng.choice(lexicon["contexts"]))
        detail_tmpl = rng.choice(lexicon["details"])
        sentences.append(detail_tmpl.format(noun=noun, verb=verb))
        if "conclusions" in lexicon:
            sentences.append(rng.choice(lexicon["conclusions"]))
    elif tier == PostLengthTier.LONG:
        # 4-7 sentences: context + technical detail + critique + conclusion
        if "contexts" in lexicon:
            sentences.append(rng.choice(lexicon["contexts"]))
        detail_tmpl = rng.choice(lexicon["details"])
        sentences.append(detail_tmpl.format(noun=noun, verb=verb))
        if "critiques" in lexicon:
            sentences.append(rng.choice(lexicon["critiques"]))
        if "conclusions" in lexicon:
            sentences.append(rng.choice(lexicon["conclusions"]))
    else:  # VERY_LONG
        # 7-12 sentences structured across paragraphs
        p1 = [
            rng.choice(lexicon.get("contexts", ["Observation on modern systems:"])),
            rng.choice(lexicon["details"]).format(noun=noun, verb=verb)
        ]
        # Pick another detail with different aspect
        noun2 = rng.choice([n for n in lexicon["nouns"] if n != noun] or lexicon["nouns"])
        p2 = [
            rng.choice(lexicon["details"]).format(noun=noun2, verb=verb),
            rng.choice(lexicon.get("critiques", ["This remains a key trade-off to watch."]))
        ]
        p3 = [
            rng.choice(lexicon.get("conclusions", ["Continued research is essential."]))
        ]
        sentences = [" ".join(p1), " ".join(p2), " ".join(p3)]

    # Assemble base text
    if tier == PostLengthTier.VERY_LONG:
        body = "\n\n".join(sentences)
    else:
        body = " ".join(sentences)

    hashtags: List[str] = []
    mentions: List[str] = []
    urls: List[str] = []

    if include_mention and known_usernames:
        mention = rng.choice(known_usernames)
        body = f"@{mention} {body}"
        mentions.append(mention)

    if include_url:
        domain = rng.choice(LEGITIMATE_DOMAINS)
        slug = f"article-{rng.randint(1000, 99999)}"
        url = f"https://{domain}/news/{slug}"
        body = f"{body}\n\n{url}" if tier in [PostLengthTier.LONG, PostLengthTier.VERY_LONG] else f"{body} {url}"
        urls.append(url)

    if include_hashtag and lexicon["hashtags"]:
        num_tags = 1 if tier == PostLengthTier.SHORT else rng.randint(1, 3)
        selected_tags = rng.sample(lexicon["hashtags"], k=min(num_tags, len(lexicon["hashtags"])))
        tag_str = " ".join([f"#{t}" for t in selected_tags])
        body = f"{body}\n\n{tag_str}" if tier in [PostLengthTier.LONG, PostLengthTier.VERY_LONG] else f"{body} {tag_str}"
        hashtags.extend(selected_tags)

    entities = PostEntities(
        hashtags=hashtags,
        mentions=mentions,
        urls=urls,
        media_urls=[],
    )

    return body, entities


def compose_coordinated_exact_post(
    rng: DeterministicRNG,
    campaign_slug: str,
    campaign_url: str,
    campaign_hashtags: List[str],
) -> Tuple[str, PostEntities]:
    """Compose an overt coordinated campaign post with high verbatim repetition."""
    base_messages = [
        "URGENT INVESTIGATION: Municipal utility report confirms catastrophic grid vulnerability across northern substations. Leaked telemetry files show power reserves dropped below emergency thresholds.",
        "Critical energy safety alert: Whistleblower documents reveal concealed transformer failures and hidden rolling blackout risks. Unredacted engineering logs linked below:",
        "Massive public utility failure exposed: Regional regulators intentionally ignored safety audits for over six months. Verified engineering findings and telemetry data:",
        "Public alert to all district residents: Municipal grid capacity is dangerously compromised while officials conceal hazardous distribution defects. Read the full investigation:",
    ]
    msg = rng.choice(base_messages)
    tag_str = " ".join([f"#{t}" for t in campaign_hashtags])
    content = f"{msg}\n\n{campaign_url}\n{tag_str}"

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

    num_tags = rng.randint(1, 2)
    selected_tags = rng.sample(frame["hashtags"], k=num_tags)
    tag_str = " ".join([f"#{t}" for t in selected_tags])

    structure_variant = rng.randint(1, 3)
    if structure_variant == 1:
        content = f"{opener} {claim}. {evidence} {url}\n{cta} {tag_str}"
    elif structure_variant == 2:
        content = f"{cta}\n\n{opener} {claim}. {evidence} {url} {tag_str}"
    else:
        content = f"{claim.capitalize()}.\n\n{opener} this crisis is escalating rapidly without public oversight. Access the documentation: {url}\n{tag_str}"

    entities = PostEntities(
        hashtags=selected_tags,
        mentions=[],
        urls=[url],
        media_urls=[],
    )
    return content, entities, frame_key


def compose_viral_organic_post(
    rng: DeterministicRNG,
    frame_key: str = "organic_viral_eclipse",
    length_tier: Optional[PostLengthTier] = None,
    profile: ContentProfile = ContentProfile.REALISTIC,
) -> Tuple[str, PostEntities]:
    """Compose an organic post during a high-similarity viral event (false positive benchmark)."""
    frame = PARAPHRASE_FRAMES.get(frame_key, PARAPHRASE_FRAMES["organic_viral_eclipse"])
    tier = length_tier or sample_length_tier(rng, profile)

    sentences: List[str] = []

    if tier == PostLengthTier.SHORT:
        reaction = rng.choice(frame["reactions"])
        sentences.append(reaction)
    elif tier == PostLengthTier.MEDIUM:
        if "contexts" in frame:
            sentences.append(rng.choice(frame["contexts"]))
        if "details" in frame:
            sentences.append(rng.choice(frame["details"]))
        if "reflections" in frame:
            sentences.append(rng.choice(frame["reflections"]))
    elif tier in [PostLengthTier.LONG, PostLengthTier.VERY_LONG]:
        if "contexts" in frame:
            sentences.append(rng.choice(frame["contexts"]))
        if "details" in frame:
            sentences.append(rng.choice(frame["details"]))
            detail2 = rng.choice([d for d in frame["details"] if d != sentences[-1]] or frame["details"])
            sentences.append(detail2)
        if "reflections" in frame:
            sentences.append(rng.choice(frame["reflections"]))
    else:
        sentences.append(rng.choice(frame["reactions"]))

    body = " ".join(sentences)

    # Select tags
    num_tags = 1 if tier == PostLengthTier.SHORT else rng.randint(1, 2)
    tags = rng.sample(frame["hashtags"], k=min(num_tags, len(frame["hashtags"])))
    tag_str = " ".join([f"#{t}" for t in tags])
    content = f"{body} {tag_str}"

    entities = PostEntities(
        hashtags=tags,
        mentions=[],
        urls=[],
        media_urls=[],
    )
    return content, entities
