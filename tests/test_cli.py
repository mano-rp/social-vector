"""Tests for SocialVector CLI interface."""

import json
from pathlib import Path
from social_vector.cli.main import main


def test_cli_list_scenarios(capsys):
    ret = main(["list-scenarios"])
    assert ret == 0
    captured = capsys.readouterr()
    assert "organic_activity" in captured.out
    assert "coordinated_campaign" in captured.out
    assert "paraphrased_coordination" in captured.out
    assert "organic_topical_similarity" in captured.out


def test_cli_generate_and_inspect(tmp_path, capsys):
    out_file = tmp_path / "cli_test_dataset.json"
    ret = main([
        "generate-dataset",
        "--scenario", "coordinated_campaign",
        "--users", "15",
        "--posts-per-user", "3",
        "--seed", "123",
        "--output", str(out_file),
    ])
    assert ret == 0
    assert out_file.is_file()

    # Inspect the generated dataset file
    inspect_ret = main(["inspect-dataset", str(out_file)])
    assert inspect_ret == 0
    captured = capsys.readouterr()
    assert "Integrity Status:  VALID" in captured.out
    assert "Operation GridWatch Astroturf" in captured.out
