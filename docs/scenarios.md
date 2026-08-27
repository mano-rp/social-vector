# SocialVector Generation Scenarios

SocialVector provides modular generation scenarios designed to model distinct analytical conditions, ranging from baseline organic activity to high-intensity information operations.

---

## 1. Organic Social Activity (`organic_activity`)

- **Alias:** `organic`
- **Coordination Status:** False
- **Scenario Type:** Baseline

### Description
Models an authentic social ecosystem where independent users discuss diverse topics (technology, climate science, astrophysics, and urban community planning).

### Characteristics
- Diurnal circadian posting schedules following natural human activity hours.
- Power-law follower and engagement distributions.
- Multi-sentence coherent discourse with realistic length distributions (short remarks up to multi-paragraph analyses).
- Uncoordinated hashtag, mention, and URL usage.
- Ground truth contains `has_coordination: false` and zero campaigns.

---

## 2. Coordinated Campaign (Overt) (`coordinated_campaign`)

- **Alias:** `coordinated`
- **Coordination Status:** True
- **Scenario Type:** Campaign (Overt)

### Description
Simulates an overt astroturf / botnet operation designed to amplify specific narratives in synchronized bursts.

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
- Multi-sentence rich reflections, photography logs, and community discussions.
- Used to evaluate whether analytical correlation models correctly distinguish high topical similarity from coordinated operations.

---

## 5. Extreme Geopolitical Information Operation (`extreme_information_operation`)

- **Alias:** `extreme_campaign`, `extreme_io`, `extreme`, `geopolitical`
- **Coordination Status:** True
- **Scenario Type:** High-Intensity Fictional Geopolitical Operation

### Description
Simulates a high-intensity, multi-stage influence campaign in a fictional geopolitical universe involving state-aligned media, whistleblower seeding, astroturf grassroots outrage, counter-narrative attacks, and narrative escalation.

### Fictional Universe Context
All entities, nations, institutions, and individuals in this scenario are fictional:
- **Nations:** Republic of Asteria, State of Velmora, Federal Territory of Oakhaven.
- **Institutions:** Asteria Ministry of Maritime Safety (AMMS), Velmoran Maritime Security Directorate, Kestrel Sound Environmental Alliance (KSEA).
- **Fictional Incident:** Allegations of a covert naval chemical discharge and pipeline rupture in the Kestrel Sound maritime corridor.

### Multi-Stage Campaign Timeline
The campaign unfolds across six distinct temporal stages:
1. **Stage 1 (Narrative Seeding):** Purported whistleblower memos and telemetry drops (`vanguardleaks.cc`).
2. **Stage 2 (Breaking Amplification):** Wire alerts and automated bots surging with breaking headers.
3. **Stage 3 (Manufactured Grassroots Outrage):** Astroturf local citizen personas posting emotional accounts.
4. **Stage 4 (Counter-Narrative Attacks):** Discrediting official government statements and fact-checking reviews as censorship.
5. **Stage 5 (Geopolitical Escalation):** Broadening claims to treaty violations (Treaty of Oakhaven) and demanding international sanctions.
6. **Stage 6 (Persistent Reinforcement):** Evergreen summary dossiers, decentralized archive links, and petitions.

### Heterogeneous Actor Roles
Campaign accounts are assigned specialized narrative roles (seed leakers, state-aligned media, wire broadcasters, astroturf citizens, counter-attackers, geopolitical analysts, and amplifier bots), producing multi-dimensional behavioral signals.
