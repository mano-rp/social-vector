"""Tests for analytical data preprocessing and entity normalization."""

from social_vector.analysis.ingestion import load_dataset_for_analysis
from social_vector.analysis.preprocessing import clean_text_for_analysis, extract_domain, preprocess_dataset


def test_clean_text():
    raw = "Breaking report https://vanguardleaks.cc/doc @citizen_one #PortKestrelCrisis  Alert!"
    cleaned = clean_text_for_analysis(raw)
    assert "https://" not in cleaned
    assert "@citizen_one" not in cleaned
    assert "#portkestrelcrisis" not in cleaned
    assert "breaking report alert!" in cleaned


def test_extract_domain():
    assert extract_domain("https://vanguardleaks.cc/memo.pdf") == "vanguardleaks.cc"
    assert extract_domain("http://www.scientificamerican.com/article/1") == "scientificamerican.com"
    assert extract_domain("invalid-url") == "invalid-url"


def test_preprocess_dataset():
    ctx = load_dataset_for_analysis("datasets/sample_extreme_geopolitical_operation.json")
    preprocessed = preprocess_dataset(ctx)

    assert preprocessed.total_users == len(ctx.users)
    assert preprocessed.total_posts == len(ctx.posts)
    assert len(preprocessed.timestamps) == len(ctx.posts)
    assert len(preprocessed.post_domains) == len(ctx.posts)
    assert len(preprocessed.post_hashtags) == len(ctx.posts)
    assert len(preprocessed.user_post_map) > 0
