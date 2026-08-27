# SocialVector

SocialVector is an offline social-media observation and dataset generation system designed for cybersecurity research, forensic signal modeling, and information operation analysis.

---

## Core Capabilities

- **Deterministic Dataset Generation:** Generates synthetic social-media feeds with full mathematical reproducibility using seeded PRNG streams.
- **Strict Ground-Truth Isolation:** Observable social feeds are cleanly separated from generator ground truth.
- **Scenario-Driven Simulation:** Includes pre-built scenarios for baseline organic activity, overt synchronized bot campaigns, subtle semantic paraphrasing operations, and viral false-positive benchmarks.
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
# Generate an organic baseline dataset
sv generate-dataset --scenario organic --users 50 --seed 42 -o dataset_organic.json

# Generate an overt coordinated campaign
sv generate-dataset --scenario coordinated --users 100 --seed 100 -o dataset_coordinated.json
```

### 3. Inspect and Validate a Dataset

```bash
sv inspect-dataset dataset_coordinated.json
```

---

## Pre-Generated Sample Datasets

The repository includes deterministic sample datasets in the `datasets/` directory:

| Dataset File | Scenario | Users | Posts | Description |
|---|---|---|---|---|
| `datasets/sample_organic_small.json` | `organic_activity` | 10 | 36 | Small organic baseline feed |
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
