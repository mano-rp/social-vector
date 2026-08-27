# SocialVector Generation Scenarios

SocialVector includes several generation scenarios designed to model distinct analytical conditions.

## 1. Organic Social Activity (`organic_activity`)

- **Alias:** `organic`
- **Coordination Status:** False
- **Scenario Type:** Baseline

### Description
Models an authentic social ecosystem where independent users discuss diverse topics (technology, climate science, astronomy, urban development).

### Characteristics
- Diurnal circadian posting schedules following natural human activity hours.
- Power-law follower and engagement distributions.
- Diverse, uncoordinated hashtag, mention, and URL usage.
- Ground truth contains `has_coordination: false` and zero campaigns.

---

## 2. Coordinated Campaign (Overt) (`coordinated_campaign`)

- **Alias:** `coordinated`
- **Coordination Status:** True
- **Scenario Type:** Campaign (Overt)

### Description
Simulates an overt astroturf / botnet operation designed to flood specific narratives in synchronized bursts.

### Characteristics
- Coordinated bot accounts with recent registration windows and skewed follower ratios.
- High verbatim and near-verbatim text repetition across accounts.
- Synchronized temporal burst spikes (multiple accounts posting within 3-minute windows).
- Shared campaign domains (`grid-watchdog-bulletin.net`) and coordinated hashtag pushes.
- Artificial mutual engagement amplification.

---

## 3. Paraphrased Subtle Coordination (`paraphrased_coordination`)

- **Alias:** `paraphrased`, `subtle`
- **Coordination Status:** True
- **Scenario Type:** Campaign (Subtle / Semantic)

### Description
Simulates an evasive information operation using semantic paraphrasing, distributed domain infrastructure, and organic cover activity.

### Characteristics
- Varied sentence structures and synonym substitutions expressing a common underlying claim.
- Staggered posting intervals rather than simultaneous bursts.
- Campaign accounts interleave authentic organic posts with campaign narrative posts.
- Distributed URLs across multiple landing domains.

---

## 4. Organic Topical Similarity Benchmark (`organic_topical_similarity`)

- **Alias:** `false_positive`, `similarity`
- **Coordination Status:** False
- **Scenario Type:** Benchmark (False-Positive Evaluation)

### Description
Simulates a real-world viral breaking news or cultural event (e.g., a major solar eclipse) where authentic users spontaneously converge on the same topic.

### Characteristics
- High lexical and semantic overlap among completely independent users.
- Diverse account creation histories, authentic device clients, and organic personal phrasings.
- Used to evaluate whether analytical correlation models correctly distinguish high topical similarity from coordinated operations.
