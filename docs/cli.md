# SocialVector Command-Line Interface (CLI)

The SocialVector CLI is accessible via the `sv` or `social-vector` commands.

## Global Options

```bash
sv --help
sv --version
```

---

## Commands

### 1. `generate-dataset`

Generates a deterministic synthetic social-media observation dataset.

```bash
sv generate-dataset [OPTIONS]
```

#### Options:
- `-s, --scenario TEXT`: Scenario identifier (`organic_activity`, `coordinated_campaign`, `paraphrased_coordination`, `organic_topical_similarity`, `extreme_information_operation`). Default: `organic_activity`.
- `-c, --content-profile TEXT`: Content generation profile (`standard`, `realistic`, `extreme`). Default: `realistic`.
- `-u, --users INT`: Total number of users to generate. Default: `50`.
- `-p, --posts-per-user INT`: Average target posts per user. Default: `5`.
- `--seed INT`: Deterministic random seed integer. Default: `42`.
- `-o, --output PATH`: Output JSON file path. If omitted, outputs to stdout.
- `--campaign-ratio FLOAT`: Proportion of campaign actors in coordinated scenarios (0.05 to 0.8). Default: `0.15`.
- `--start-date ISO_DATETIME`: Observation start timestamp in ISO 8601 format. Default: `2026-08-01T00:00:00Z`.
- `--end-date ISO_DATETIME`: Observation end timestamp in ISO 8601 format. Default: `2026-08-07T00:00:00Z`.
- `--no-pretty`: Output compact single-line JSON.
- `-q, --quiet`: Suppress informational messages on stderr.

#### Examples:

```bash
# Generate 100-user organic baseline dataset with realistic content
sv generate-dataset --scenario organic --content-profile realistic --users 100 --seed 42 -o datasets/organic_100.json

# Generate high-intensity fictional geopolitical information operation dataset
sv generate-dataset --scenario extreme_information_operation --users 500 --seed 2026 --campaign-ratio 0.18 -o datasets/extreme_io_500.json

# Generate overt coordinated campaign dataset with extreme profile
sv generate-dataset --scenario coordinated --content-profile extreme --users 250 --seed 123 -o datasets/campaign_250.json

# Generate subtle paraphrased operation dataset
sv generate-dataset --scenario paraphrased --users 200 --seed 777 -o datasets/subtle_200.json
```

---

### 2. `list-scenarios`

Lists all available dataset generation scenarios with descriptions and analytical goals.

```bash
sv list-scenarios
```

---

### 3. `inspect-dataset`

Inspects, validates, and summarizes a SocialVector dataset JSON file.

```bash
sv inspect-dataset datasets/sample_extreme_geopolitical_operation.json
```

#### Output:
- Validates structural and referential schema integrity.
- Reports total user and post counts.
- Displays top observed hashtags and linked URLs.
- Summarizes ground-truth campaign metadata if present.
