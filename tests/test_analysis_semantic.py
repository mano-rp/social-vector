"""Tests for semantic embeddings and cosine similarity search."""

from social_vector.analysis.features.embeddings import SemanticEmbeddingEngine


def test_semantic_embedding_similarity():
    engine = SemanticEmbeddingEngine(target_dimension=128, random_seed=42)
    texts = [
        "Urgent breaking leak exposes secret treaty negotiations and defense violations.",
        "Breaking document leak exposes clandestine treaty negotiations and defense violations.",
        "A peaceful sunny day in the botanical garden with birds singing.",
        "Delicious Italian pasta recipe with fresh basil and cold pressed olive oil.",
    ]
    authors = ["usr_1", "usr_2", "usr_3", "usr_4"]

    res = engine.extract_features(texts, authors, similarity_threshold=0.50)
    assert res.embeddings.shape == (4, 128)
    assert res.dimension == 128
    assert res.strong_pairs_count >= 1
    pair_12 = (min("usr_1", "usr_2"), max("usr_1", "usr_2"))
    pair_14 = (min("usr_1", "usr_4"), max("usr_1", "usr_4"))
    assert res.user_max_similarity.get(pair_12, 0.0) > res.user_max_similarity.get(pair_14, 0.0)
