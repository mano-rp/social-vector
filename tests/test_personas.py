"""Tests for user persona generation and determinism."""

from social_vector.generation.personas import generate_user_persona
from social_vector.generation.seed import DeterministicRNG


def test_user_persona_determinism():
    rng1 = DeterministicRNG(100)
    rng2 = DeterministicRNG(100)

    u1 = generate_user_persona(rng1, 1, bot_style=False)
    u2 = generate_user_persona(rng2, 1, bot_style=False)

    assert u1.user_id == u2.user_id
    assert u1.username == u2.username
    assert u1.display_name == u2.display_name
    assert u1.bio == u2.bio
    assert u1.created_at == u2.created_at
    assert u1.metrics.followers_count == u2.metrics.followers_count


def test_user_persona_bot_style():
    rng = DeterministicRNG(200)
    u_bot = generate_user_persona(rng, 5, bot_style=True)

    assert u_bot.user_id == "usr_000005"
    assert u_bot.verified is False
    assert u_bot.account_type == "unverified_individual"
