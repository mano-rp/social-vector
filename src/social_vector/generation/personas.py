"""Deterministic persona, profile metadata, and demographic generator."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from social_vector.generation.seed import DeterministicRNG
from social_vector.schema.models import UserMetrics, UserRecord

FIRST_NAMES = [
    "Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Pat", "Riley", "Casey", "Avery",
    "Elena", "Marcus", "Sophia", "Liam", "Maya", "Noah", "Chloe", "Ethan", "Aria", "Lucas",
    "Priya", "Dev", "Ananya", "Rohan", "Mei", "Wei", "Jun", "Hana", "Kenji", "Yuki",
    "Carlos", "Mateo", "Sofia", "Camila", "Diego", "Valentina", "Gabriel", "Isabella", "Lucas", "Lucia",
    "Amara", "Kwame", "Zainab", "Tariq", "Fatima", "Omar", "Amina", "Jabari", "Nia", "Malik",
    "Freja", "Lars", "Astrid", "Magnus", "Ingrid", "Soren", "Elin", "Henrik", "Sigrid", "Mikkel"
]

LAST_NAMES = [
    "Vance", "Chen", "Novak", "Kowalski", "Patel", "Sharma", "Tanaka", "Sato", "Kim", "Park",
    "Garcia", "Rodriguez", "Silva", "Santos", "Okafor", "Adeyemi", "Mensah", "Diallo", "Al-Mansoor", "Haddad",
    "Lindholm", "Johansson", "Mueller", "Schmidt", "Dubois", "Moreau", "Rossi", "Conti", "Smith", "Johnson",
    "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson", "Anderson", "Taylor", "Thomas", "Moore",
    "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez"
]

LOCATIONS = [
    "San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Boston, MA",
    "London, UK", "Berlin, Germany", "Paris, France", "Amsterdam, Netherlands", "Stockholm, Sweden",
    "Tokyo, Japan", "Singapore", "Seoul, South Korea", "Sydney, Australia", "Toronto, Canada",
    "Bengaluru, India", "Mumbai, India", "Nairobi, Kenya", "São Paulo, Brazil", "Buenos Aires, Argentina",
    "Chicago, IL", "Denver, CO", "Vancouver, Canada", "Dublin, Ireland", "Zurich, Switzerland"
]

OCCUPATIONS = [
    "Software Engineer", "Data Scientist", "Policy Analyst", "Journalist", "Research Scientist",
    "Product Manager", "Environmental Consultant", "Graphic Designer", "Academic Fellow", "Systems Architect",
    "Security Analyst", "Urban Planner", "Energy Analyst", "Content Strategist", "Economist",
    "Student", "Freelance Writer", "Healthcare Worker", "Community Organizer", "Biochemist"
]

INTERESTS = [
    "renewable energy", "climate policy", "distributed systems", "open source", "urban mobility",
    "machine learning", "astronomy", "local journalism", "cybersecurity", "sustainable agriculture",
    "grid infrastructure", "digital rights", "data ethics", "macroeconomics", "public transit",
    "biotechnology", "cryptography", "cloud computing", "civic tech", "space exploration"
]

BIO_TEMPLATES = [
    "{role} based in {city}. Interested in {interest1} and {interest2}. Thoughts are my own.",
    "{role} @ tech / research. Exploring {interest1} & {interest2}.",
    "Focusing on {interest1}, {interest2}, and modern infrastructure. Living in {city}.",
    "{interest1} enthusiast. Building things with open protocols.",
    "Curious about {interest1} | Reading widely on {interest2} | {city}",
    "Advocate for {interest1} and sustainable systems. {role} in {city}.",
    "Working on {interest1}. Occasional thoughts on {interest2} and {interest3}.",
    "Researcher in {interest1}. Former {role}. Based in {city}.",
    "Observations on {interest1}, technology, and policy. Views belong to me.",
    "Just another human navigating {interest1} and {interest2}.",
]

DEVICE_CLIENTS = [
    "Web Client",
    "iOS App",
    "Android App",
    "Mobile Web Client",
    "ThirdPartyClient/3.1",
]


@dataclass
class PersonaProfile:
    """Internal persona template for user generation."""

    first_name: str
    last_name: str
    username: str
    display_name: str
    bio: str
    location: Optional[str]
    account_type: str
    device_client: str
    primary_interests: List[str]
    activity_level: float  # 0.1 (low) to 1.0 (high)


def generate_username(rng: DeterministicRNG, first_name: str, last_name: str, index: int, bot_style: bool = False) -> str:
    """Generate a realistic, unique username given name components, user index, and generation style."""
    fn = first_name.lower()
    ln = last_name.lower()

    if bot_style:
        style = rng.randint(1, 4)
        if style == 1:
            return f"{fn}_{ln}{index:04d}"
        elif style == 2:
            return f"{fn}{ln[0]}_{index:05d}"
        elif style == 3:
            return f"{fn}_{index:06d}"
        else:
            return f"{ln}_{fn}_{index:04d}"

    # Organic styles
    style = rng.randint(1, 6)
    if style == 1:
        return f"{fn}_{ln}_{index}"
    elif style == 2:
        return f"{fn}{ln[0]}_{index:03d}"
    elif style == 3:
        return f"{ln}_{fn}_{index}"
    elif style == 4:
        return f"{fn}_{ln[0]}{index:02d}"
    elif style == 5:
        return f"the_{fn}_{ln}_{index}"
    else:
        return f"{fn}_{index:04d}"


def generate_user_persona(
    rng: DeterministicRNG,
    user_idx: int,
    user_id_prefix: str = "usr",
    bot_style: bool = False,
    creation_window_start: Optional[datetime] = None,
    creation_window_end: Optional[datetime] = None,
    custom_interests: Optional[List[str]] = None,
) -> UserRecord:
    """Deterministically generate a complete user record with realistic social attributes."""
    first_name = rng.choice(FIRST_NAMES)
    last_name = rng.choice(LAST_NAMES)
    display_name = f"{first_name} {last_name}"
    user_id = f"{user_id_prefix}_{user_idx:06d}"
    username = generate_username(rng, first_name, last_name, user_idx, bot_style=bot_style)

    # Location
    has_location = rng.random() > (0.4 if bot_style else 0.2)
    location = rng.choice(LOCATIONS) if has_location else None

    # Interests
    selected_interests = custom_interests or rng.sample(INTERESTS, k=min(3, len(INTERESTS)))
    city = location.split(",")[0] if location else "the world"
    role = rng.choice(OCCUPATIONS)

    # Bio
    has_bio = rng.random() > (0.35 if bot_style else 0.1)
    if has_bio:
        template = rng.choice(BIO_TEMPLATES)
        bio = template.format(
            role=role,
            city=city,
            interest1=selected_interests[0] if len(selected_interests) > 0 else "technology",
            interest2=selected_interests[1] if len(selected_interests) > 1 else "science",
            interest3=selected_interests[2] if len(selected_interests) > 2 else "policy",
        )
    else:
        bio = ""

    # Account creation timestamp
    ref_end = creation_window_end or datetime(2026, 8, 1, 0, 0, 0, tzinfo=timezone.utc)
    if creation_window_start:
        ref_start = creation_window_start
        delta_seconds = max(1, int((ref_end - ref_start).total_seconds()))
        offset = rng.randint(0, delta_seconds)
        created_dt = ref_start + timedelta(seconds=offset)
    elif bot_style:
        # Bots / campaign accounts frequently created in a tighter recent window (e.g. past 14-60 days)
        days_ago = rng.randint(5, 60)
        created_dt = ref_end - timedelta(days=days_ago, seconds=rng.randint(0, 86400))
    else:
        # Organic accounts created across 1 to 8 years
        days_ago = rng.randint(180, 2900)
        created_dt = ref_end - timedelta(days=days_ago, seconds=rng.randint(0, 86400))

    created_at_iso = created_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

    # Metrics - realistic log-normal / pareto distributions
    if bot_style:
        # Bots typically have skewed follower-to-following ratios or sparse network
        following_count = rng.randint(50, 800)
        followers_count = rng.randint(5, 120)
        posts_count = rng.randint(10, 350)
        listed_count = rng.randint(0, 2)
        verified = False
        account_type = "unverified_individual"
        device_client = rng.choice(["Web Client", "ThirdPartyClient/3.1", "Android App"])
    else:
        # Organic accounts
        pareto_val = min(rng.pareto(1.8), 25.0)  # capped heavy tail
        followers_count = int(20 + pareto_val * 45)
        following_count = int(15 + rng.pareto(2.0) * 35)
        posts_count = int(5 + rng.pareto(1.6) * 30)
        listed_count = int(followers_count / 150)
        verified = followers_count > 800 and rng.random() < 0.15
        account_type = "organization" if (rng.random() < 0.05) else "individual"
        device_client = rng.choice(DEVICE_CLIENTS)

    metrics = UserMetrics(
        followers_count=followers_count,
        following_count=following_count,
        posts_count=posts_count,
        listed_count=listed_count,
    )

    return UserRecord(
        user_id=user_id,
        username=username,
        display_name=display_name,
        bio=bio,
        created_at=created_at_iso,
        location=location,
        metrics=metrics,
        verified=verified,
        account_type=account_type,
        language="en",
        device_client=device_client,
        custom_attributes={},
    )
