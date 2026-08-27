# SocialVector Dataset Generation Architecture

## Principles

SocialVector provides an offline, fully deterministic synthetic dataset generation engine designed to create realistic social-media feeds with controlled ground-truth labels for threat intelligence and information operation research.

Key design principles include:

1. **Deterministic Reproducibility:** Given the same scenario, parameters, content profile, and random seed, the generator produces bitwise-identical output on any supported system.
2. **Zero Cloud/API Dependencies:** All text, temporal patterns, and persona attributes are synthesized locally without network calls or external language model APIs.
3. **Strict Separation of Concerns:** Observable metadata (posts, users, metrics) never contains leaked ground-truth labels.
4. **Multi-Length Semantic Coherence:** Generates structured multi-sentence discourse spanning short reactions to multi-paragraph analytical breakdowns.
5. **Computational Efficiency:** Generates datasets containing thousands of users and posts in seconds.

---

## Architecture Components

```
                +----------------------------+
                |    Deterministic PRNG      |
                | (Hierarchical SHA-256 Seed)|
                +--------------+-------------+
                               |
            +------------------+------------------+
            |                  |                  |
     +------v------+    +------v------+    +------v------+
     |   Personas  |    |  Temporal   |    |  Profiles & |
     |  Generator  |    |  Simulation |    | Lexicon/IO  |
     +------+------+    +------+------+    +------+------+
            |                  |                  |
            +------------------+------------------+
                               |
                    +----------v----------+
                    |  Scenario Execution |
                    | (Organic / IO Stages|
                    +----------+----------+
                               |
                    +----------v----------+
                    | Ground Truth Builder|
                    +----------+----------+
                               |
                    +----------v----------+
                    | Schema Validation & |
                    |  JSON Serialization |
                    +---------------------+
```

---

## Content Profiles and Length Tiers

SocialVector supports configurable content profiles (`profiles.py`) that govern post length distribution, structural depth, and rhetorical complexity:

| Profile | Target Domain | Length Distribution | Rhetorical Characteristics |
|---|---|---|---|
| `standard` | Lightweight benchmarks | 85% Short, 15% Medium | Concise 1-2 sentence posts |
| `realistic` | Deep behavioral analysis | 25% Short, 45% Medium, 22% Long, 8% Very Long | Multi-sentence coherent discourse with context, analysis, and critique |
| `extreme` | High-intensity IO simulations | 20% Short, 35% Medium, 30% Long, 15% Very Long | Multi-stage geopolitical narratives, whistleblower leaks, and astroturf threads |

### Multi-Sentence Composition
Rather than concatenating random sentences, the engine utilizes coherent discourse frames (`vocabulary.py`, `templates.py`, `geopolitical.py`) where sentences logically progress from observational context to specific metrics/claims, critical analysis, and concluding commentary within a unified semantic theme.
