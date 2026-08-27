"""Main CLI entrypoint for SocialVector (`sv` and `social-vector`)."""

from __future__ import annotations

import argparse
import sys
from typing import List, Optional

from social_vector.__version__ import __schema_version__, __version__
from social_vector.cli.generate_cmd import run_generate_command
from social_vector.cli.inspect_cmd import run_inspect_command
from social_vector.cli.scenarios_cmd import run_scenarios_command


def build_parser() -> argparse.ArgumentParser:
    """Construct the command-line argument parser."""
    parser = argparse.ArgumentParser(
        prog="sv",
        description="SocialVector - Local offline social-media dataset generation and analytical platform.",
    )
    parser.add_argument(
        "-V", "--version",
        action="version",
        version=f"SocialVector {__version__} (Schema v{__schema_version__})",
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # generate-dataset command
    gen_parser = subparsers.add_parser(
        "generate-dataset",
        aliases=["generate", "gen"],
        help="Generate a deterministic synthetic social-media observation dataset.",
    )
    gen_parser.add_argument(
        "-s", "--scenario",
        default="organic_activity",
        help="Scenario type to generate (e.g. 'organic_activity', 'coordinated_campaign', 'paraphrased_coordination', 'organic_topical_similarity', 'extreme_information_operation'). Default: organic_activity",
    )
    gen_parser.add_argument(
        "-c", "--content-profile",
        default="realistic",
        choices=["standard", "realistic", "extreme"],
        help="Content profile governing post length, narrative depth, and rhetorical style. Choices: 'standard', 'realistic', 'extreme'. Default: realistic",
    )
    gen_parser.add_argument(
        "-u", "--users",
        type=int,
        default=50,
        help="Total number of users to generate. Default: 50",
    )
    gen_parser.add_argument(
        "-p", "--posts-per-user",
        type=int,
        default=5,
        help="Target average number of posts per user. Default: 5",
    )
    gen_parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for deterministic reproducibility. Default: 42",
    )
    gen_parser.add_argument(
        "-o", "--output",
        type=str,
        default=None,
        help="Output file path (default: stdout).",
    )
    gen_parser.add_argument(
        "--campaign-ratio",
        type=float,
        default=0.15,
        help="Ratio of coordinated accounts in campaign scenarios (0.05 to 0.8). Default: 0.15",
    )
    gen_parser.add_argument(
        "--start-date",
        type=str,
        default=None,
        help="Observation start datetime in ISO 8601 UTC format (e.g. '2026-08-01T00:00:00Z').",
    )
    gen_parser.add_argument(
        "--end-date",
        type=str,
        default=None,
        help="Observation end datetime in ISO 8601 UTC format (e.g. '2026-08-07T00:00:00Z').",
    )
    gen_parser.add_argument(
        "--no-pretty",
        action="store_true",
        help="Output compact single-line JSON instead of formatted indented JSON.",
    )
    gen_parser.add_argument(
        "-q", "--quiet",
        action="store_true",
        help="Suppress informational stderr output.",
    )

    # list-scenarios command
    subparsers.add_parser(
        "list-scenarios",
        aliases=["scenarios", "ls-scenarios"],
        help="List available dataset generation scenarios and their analytical goals.",
    )

    # inspect-dataset command
    inspect_parser = subparsers.add_parser(
        "inspect-dataset",
        aliases=["inspect"],
        help="Inspect and validate a SocialVector dataset JSON file.",
    )
    inspect_parser.add_argument(
        "file",
        type=str,
        help="Path to the dataset JSON file to inspect.",
    )
    inspect_parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Display detailed diagnostic output.",
    )

    return parser


def main(argv: Optional[List[str]] = None) -> int:
    """CLI execution entrypoint."""
    parser = build_parser()
    args = parser.parse_args(argv)

    if not args.command:
        parser.print_help()
        return 0

    if args.command in ["generate-dataset", "generate", "gen"]:
        return run_generate_command(
            scenario=args.scenario,
            users=args.users,
            posts_per_user=args.posts_per_user,
            seed=args.seed,
            output=args.output,
            campaign_ratio=args.campaign_ratio,
            content_profile=args.content_profile,
            start_date=args.start_date,
            end_date=args.end_date,
            pretty=not args.no_pretty,
            quiet=args.quiet,
        )
    elif args.command in ["list-scenarios", "scenarios", "ls-scenarios"]:
        return run_scenarios_command()
    elif args.command in ["inspect-dataset", "inspect"]:
        return run_inspect_command(args.file, verbose=args.verbose)

    return 0


if __name__ == "__main__":
    sys.exit(main())
