"""Deterministic PRNG stream management and platform-independent seed derivation."""

from __future__ import annotations

import hashlib
import random
from typing import Any, List, Sequence, TypeVar

T = TypeVar("T")


def derive_seed(master_seed: int, domain: str, index: int = 0) -> int:
    """Derive an independent, deterministic 32-bit seed integer from a master seed and domain tag.
    
    Uses SHA-256 to ensure determinism across all platforms and Python hash randomization configurations.
    """
    key = f"{master_seed}:{domain}:{index}".encode("utf-8")
    digest = hashlib.sha256(key).hexdigest()
    # Convert first 8 hex characters (32 bits) to integer
    return int(digest[:8], 16)


class DeterministicRNG:
    """Encapsulated deterministic random number generator for reproducible generation."""

    def __init__(self, seed: int):
        self.seed = seed
        self._rng = random.Random(seed)

    def spawn(self, domain: str, index: int = 0) -> DeterministicRNG:
        """Derive a dedicated child RNG stream for a specific sub-component."""
        child_seed = derive_seed(self.seed, domain, index)
        return DeterministicRNG(child_seed)

    def random(self) -> float:
        """Return random float in [0.0, 1.0)."""
        return self._rng.random()

    def uniform(self, a: float, b: float) -> float:
        """Return random float in [a, b]."""
        return self._rng.uniform(a, b)

    def randint(self, a: int, b: int) -> int:
        """Return random integer in [a, b]."""
        return self._rng.randint(a, b)

    def choice(self, seq: Sequence[T]) -> T:
        """Return a random element from a non-empty sequence."""
        if not seq:
            raise ValueError("Cannot choose from an empty sequence.")
        return self._rng.choice(seq)

    def choices(self, population: Sequence[T], weights: Sequence[float] | None = None, k: int = 1) -> List[T]:
        """Return k elements chosen from population with optional weights."""
        if not population:
            raise ValueError("Cannot choose from an empty population.")
        return self._rng.choices(population, weights=weights, k=k)

    def sample(self, population: Sequence[T], k: int) -> List[T]:
        """Return a k length list of unique elements chosen from the population."""
        return self._rng.sample(population, k)

    def shuffle(self, seq: list[Any]) -> None:
        """Shuffle list in place deterministically."""
        self._rng.shuffle(seq)

    def gauss(self, mu: float, sigma: float) -> float:
        """Gaussian distribution."""
        return self._rng.gauss(mu, sigma)

    def exponential(self, lambd: float) -> float:
        """Exponential distribution with rate lambd."""
        return self._rng.expovariate(lambd)

    def pareto(self, alpha: float) -> float:
        """Pareto distribution with shape parameter alpha."""
        return self._rng.paretovariate(alpha)
