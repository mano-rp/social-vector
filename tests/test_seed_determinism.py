"""Tests for deterministic seed derivation and RNG behavior."""

from social_vector.generation.seed import DeterministicRNG, derive_seed


def test_seed_derivation_determinism():
    seed1 = derive_seed(42, "users", 1)
    seed2 = derive_seed(42, "users", 1)
    seed3 = derive_seed(42, "users", 2)
    seed4 = derive_seed(42, "posts", 1)

    assert seed1 == seed2, "Same inputs must produce identical derived seeds"
    assert seed1 != seed3, "Different indices must produce different seeds"
    assert seed1 != seed4, "Different domains must produce different seeds"


def test_rng_stream_reproducibility():
    rng1 = DeterministicRNG(1337)
    rng2 = DeterministicRNG(1337)

    seq1 = [rng1.randint(1, 1000) for _ in range(50)]
    seq2 = [rng2.randint(1, 1000) for _ in range(50)]

    assert seq1 == seq2, "Identical seeds must produce identical random sequences"


def test_child_stream_independence():
    root1 = DeterministicRNG(42)
    root2 = DeterministicRNG(42)

    child1_a = root1.spawn("users", 0)
    child1_b = root1.spawn("posts", 0)

    child2_a = root2.spawn("users", 0)
    child2_b = root2.spawn("posts", 0)

    vals_a1 = [child1_a.uniform(0.0, 1.0) for _ in range(10)]
    vals_a2 = [child2_a.uniform(0.0, 1.0) for _ in range(10)]
    vals_b1 = [child1_b.uniform(0.0, 1.0) for _ in range(10)]

    assert vals_a1 == vals_a2
    assert vals_a1 != vals_b1
