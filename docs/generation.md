# SocialVector Dataset Generation Architecture

## Principles

SocialVector provides an offline, fully deterministic synthetic dataset generation engine designed to create realistic social-media feeds with controlled ground-truth labels for threat intelligence and information operation research.

Key design principles include:

1. **Deterministic Reproducibility:** Given the same scenario, parameters, and random seed, the generator produces bitwise-identical output on any supported system.
2. **Zero Cloud/API Dependencies:** All text, temporal patterns, and persona attributes are synthesized locally without network calls or external language model APIs.
3. **Strict Separation of Concerns:** Observable metadata (posts, users, metrics) never contains leaked ground-truth labels.
4. **Computational Efficiency:** Generates datasets containing thousands of users and posts in seconds.

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
     |   Personas  |    |  Temporal   |    |  Vocabulary |
     |  Generator  |    |  Simulation |    | & Templates |
     +------+------+    +------+------+    +------+------+
            |                  |                  |
            +------------------+------------------+
                               |
                    +----------v----------+
                    |  Scenario Execution |
                    | (Organic / Campaign)|
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

### 1. Hierarchical Deterministic PRNG (`seed.py`)
To prevent cross-component RNG coupling, independent sub-streams are derived from the master seed via SHA-256 hashing. Modifying post generation rules does not alter user persona generation sequences.

### 2. Persona Engine (`personas.py`)
Synthesizes realistic account profiles including international names, handle patterns, demographic variations, biographies, account creation timelines, and Pareto-distributed follower/following ratios.

### 3. Temporal Simulation (`temporal.py`)
Simulates human diurnal circadian cycles (morning/afternoon/evening activity curves) for organic users, synchronized millisecond/minute burst windows for bot operations, and periodic scheduling for automated feeds.

### 4. Vocabulary and Template Systems (`vocabulary.py`, `templates.py`)
Provides topic lexicons across science, technology, urban infrastructure, and energy, combined with paraphrase frames that generate syntactically diverse posts sharing semantic narrative cores.

### 5. Ground Truth Builder (`ground_truth.py`)
Tracks campaign actors, coordinated post IDs, targeted hashtags, domains, and coordination signatures into an isolated ground-truth block.
