"""Tests for CLI analysis subcommands."""

from social_vector.cli.main import main


def test_cli_analyze_dataset():
    exit_code = main(["analyze", "dataset", "datasets/sample_coordinated_campaign.json"])
    assert exit_code == 0


def test_cli_analyze_dataset_json():
    exit_code = main(["analyze", "dataset", "datasets/sample_extreme_geopolitical_operation.json", "--json"])
    assert exit_code == 0


def test_cli_analyze_dataset_stream(capsys):
    exit_code = main(["analyze", "dataset", "datasets/sample_coordinated_campaign.json", "--stream"])
    assert exit_code == 0
    captured = capsys.readouterr()
    assert '"type": "stage"' in captured.out
    assert '"type": "result"' in captured.out

