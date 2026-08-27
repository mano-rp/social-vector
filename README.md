# SocialVector

SocialVector is an offline social-media observation and dataset generation system designed for cybersecurity research, forensic signal modeling, and information operation analysis.

---

## Core Capabilities

- **Deterministic Dataset Generation:** Generates synthetic social-media feeds with full mathematical reproducibility using seeded PRNG streams.
- **Configurable Content Profiles:** Supports `standard`, `realistic`, and `extreme` content profiles generating semantically coherent multi-sentence posts of variable length (short remarks up to multi-paragraph analyses).
- **Multi-Stage Geopolitical Simulation:** Includes a high-intensity fictional information operation scenario modeling 6 temporal campaign stages, heterogeneous actor roles (whistleblower seeds, state media, astroturf citizens, counter-narrative attackers, geopolitical analysts), and narrative escalation.
- **Strict Ground-Truth Isolation:** Observable social feeds are cleanly separated from generator ground truth.
- **Scenario-Driven Simulation:** Includes pre-built scenarios for baseline organic activity, overt synchronized bot campaigns, subtle semantic paraphrasing operations, viral false-positive benchmarks, and extreme geopolitical information operations.
- **Extensible Schema:** Versioned, typed data models covering users, posts, extracted entities, engagement metrics, and campaign signatures.
- **Standalone CLI:** Complete command-line tooling under `sv` and `social-vector`.
- **Offline-First:** Completely independent of cloud APIs, external network services, and online language model endpoints.

---

## Installation

### Requirements
- Python 3.10+

### Setup

```bash
# Clone the repository
git clone https://github.com/mano-rp/social-vector.git
cd social-vector

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install package in editable mode
pip install -e .

# Install development dependencies
pip install -e ".[dev]"
```

---

## Quick Start

### 1. List Available Scenarios

```bash
sv list-scenarios
```

### 2. Generate a Dataset

```bash
# Generate an organic baseline dataset with realistic content
sv generate-dataset --scenario organic --content-profile realistic --users 50 --seed 42 -o dataset_organic.json

# Generate an extreme multi-stage geopolitical information operation dataset
sv generate-dataset --scenario extreme_information_operation --users 500 --seed 2026 -o dataset_extreme.json
```

### 3. Inspect and Validate a Dataset

```bash
sv inspect-dataset dataset_extreme.json
```

---

## Pre-Generated Sample Datasets

The repository includes deterministic sample datasets in the `datasets/` directory:

| Dataset File | Scenario | Users | Posts | Description |
|---|---|---|---|---|
| `datasets/sample_organic_small.json` | `organic_activity` | 10 | 36 | Small organic baseline feed |
| `datasets/sample_extreme_geopolitical_operation.json` | `extreme_information_operation` | 500 | 2,953 | 6-stage fictional geopolitical information operation |
| `datasets/sample_coordinated_campaign.json` | `coordinated_campaign` | 1,000 | 5,791 | Large overt campaign with synchronized bursts |
| `datasets/sample_paraphrased_coordination.json` | `paraphrased_coordination` | 50 | 284 | Subtle semantic paraphrasing operation |
| `datasets/sample_false_positive_organic.json` | `organic_topical_similarity` | 50 | 200 | Organic viral breaking-event benchmark |

---

## Running the Test Suite

```bash
pytest
```

---

## Documentation

Detailed documentation is available in the `docs/` directory:

- [Dataset Schema Specification](docs/schema.md)
- [Dataset Generation Architecture](docs/generation.md)
- [Scenarios Guide](docs/scenarios.md)
- [CLI Reference](docs/cli.md)

---

## License

Apache-2.0
