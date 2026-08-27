"""Semantic embedding generation and cosine similarity lookup engine."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Tuple

import numpy as np
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


@dataclass
class SemanticFeatureResult:
    embeddings: np.ndarray
    dimension: int
    candidate_pairs: List[Tuple[int, int, float]]  # (idx1, idx2, similarity)
    strong_pairs_count: int
    mean_similarity: float
    user_max_similarity: Dict[Tuple[str, str], float]  # (user_a, user_b) -> max post similarity


class SemanticEmbeddingEngine:
    """Generates L2-normalized semantic embeddings and computes pairwise similarity."""

    def __init__(self, target_dimension: int = 384, random_seed: int = 42):
        self.target_dimension = target_dimension
        self.random_seed = random_seed

    def extract_features(
        self,
        texts: List[str],
        author_ids: List[str],
        similarity_threshold: float = 0.78,
    ) -> SemanticFeatureResult:
        """Extract semantic embeddings and compute pairwise similarity graph."""
        n_samples = len(texts)
        if n_samples == 0:
            return SemanticFeatureResult(
                embeddings=np.zeros((0, self.target_dimension)),
                dimension=self.target_dimension,
                candidate_pairs=[],
                strong_pairs_count=0,
                mean_similarity=0.0,
                user_max_similarity={},
            )

        # 1. Multi-scale Word N-gram TF-IDF
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            analyzer="word",
            max_features=4000,
            sublinear_tf=True,
            min_df=1,
        )
        tfidf_matrix = vectorizer.fit_transform(texts)

        # 2. Dense Semantic Dimensionality Reduction (Randomized SVD)
        n_features = tfidf_matrix.shape[1]
        latent_dim = min(64, n_samples - 1, n_features)

        if latent_dim > 1 and n_samples > 1 and n_features > 1:
            svd = TruncatedSVD(
                n_components=latent_dim,
                algorithm="randomized",
                n_iter=3,
                random_state=self.random_seed,
            )
            dense_vectors = svd.fit_transform(tfidf_matrix)
            if dense_vectors.shape[1] < self.target_dimension:
                pad_width = self.target_dimension - dense_vectors.shape[1]
                dense_vectors = np.pad(dense_vectors, ((0, 0), (0, pad_width)), mode="constant")
            else:
                dense_vectors = dense_vectors[:, : self.target_dimension]
        else:
            dense_vectors = tfidf_matrix.toarray()
            if dense_vectors.shape[1] < self.target_dimension:
                pad_width = self.target_dimension - dense_vectors.shape[1]
                dense_vectors = np.pad(dense_vectors, ((0, 0), (0, pad_width)), mode="constant")
            else:
                dense_vectors = dense_vectors[:, : self.target_dimension]

        # 3. L2 Normalization
        norms = np.linalg.norm(dense_vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        normalized_embeddings = dense_vectors / norms

        # 4. Pairwise Cosine Similarity (Vectorized)
        similarity_matrix = cosine_similarity(normalized_embeddings)
        np.fill_diagonal(similarity_matrix, 0.0)

        rows, cols = np.triu_indices(n_samples, k=1)
        sims = similarity_matrix[rows, cols]

        above_thresh = np.where(sims >= similarity_threshold)[0]
        candidate_pairs: List[Tuple[int, int, float]] = [
            (int(rows[idx]), int(cols[idx]), float(sims[idx]))
            for idx in above_thresh
        ]

        user_max_similarity: Dict[Tuple[str, str], float] = {}
        for idx in above_thresh:
            i = int(rows[idx])
            j = int(cols[idx])
            u_i = author_ids[i]
            u_j = author_ids[j]
            if u_i != u_j:
                pair_key = (min(u_i, u_j), max(u_i, u_j))
                user_max_similarity[pair_key] = max(user_max_similarity.get(pair_key, 0.0), float(sims[idx]))

        strong_pairs_count = len(candidate_pairs)
        mean_sim = float(np.mean(similarity_matrix[similarity_matrix > 0])) if np.any(similarity_matrix > 0) else 0.0

        return SemanticFeatureResult(
            embeddings=normalized_embeddings,
            dimension=self.target_dimension,
            candidate_pairs=candidate_pairs,
            strong_pairs_count=strong_pairs_count,
            mean_similarity=mean_sim,
            user_max_similarity=user_max_similarity,
        )
