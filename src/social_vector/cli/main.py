"""Main CLI entrypoint for SocialVector (`sv` and `social-vector`)."""

from __future__ import annotations

import argparse
import sys
from typing import List, Optional

from social_vector.__version__ import __schema_version__, __version__
from social_vector.cli.analyze_cmd import run_analyze_command
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
        help="Scenario type to generate. Default: organic_activity",
    )
    gen_parser.add_argument(
        "-c", "--content-profile",
        default="realistic",
        choices=["standard", "realistic", "extreme", "realworld"],
        help="Content profile governing post length, narrative depth, and rhetorical style. Default: realistic",
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
        help="Observation start datetime in ISO 8601 UTC format.",
    )
    gen_parser.add_argument(
        "--end-date",
        type=str,
        default=None,
        help="Observation end datetime in ISO 8601 UTC format.",
    )
    gen_parser.add_argument(
        "--no-pretty",
        action="store_true",
        help="Output compact single-line JSON.",
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

    # analyze command with subcommands: dataset, user, feed
    analyze_parser = subparsers.add_parser(
        "analyze",
        aliases=["anl", "eval"],
        help="Run multi-signal coordination analysis and investigation on an observation dataset.",
    )
    anl_subparsers = analyze_parser.add_subparsers(dest="analyze_type", help="Scope of analytical evaluation")

    # sv analyze dataset <dataset>
    anl_ds = anl_subparsers.add_parser("dataset", help="Analyze entire observation dataset")
    anl_ds.add_argument("dataset", type=str, help="Dataset identifier or file path")
    anl_ds.add_argument("-o", "--output", type=str, default=None, help="Save structured analysis to file")
    anl_ds.add_argument("--json", action="store_true", help="Output raw structured JSON results")
    anl_ds.add_argument("--stream", action="store_true", help="Stream pipeline stage progress as JSON events")
    anl_ds.add_argument("--threshold", type=float, default=0.78, help="Semantic similarity threshold (default: 0.78)")
    anl_ds.add_argument("--eps", type=float, default=0.38, help="DBSCAN clustering eps distance (default: 0.38)")
    anl_ds.add_argument("--min-samples", type=int, default=3, help="DBSCAN min samples per cluster (default: 3)")

    # sv analyze user <dataset> <user>
    anl_usr = anl_subparsers.add_parser("user", help="Analyze an individual user's activity and interactions")
    anl_usr.add_argument("dataset", type=str, help="Dataset identifier or file path")
    anl_usr.add_argument("target", type=str, help="User ID or username to analyze")
    anl_usr.add_argument("-o", "--output", type=str, default=None, help="Save structured analysis to file")
    anl_usr.add_argument("--json", action="store_true", help="Output raw structured JSON results")
    anl_usr.add_argument("--stream", action="store_true", help="Stream pipeline stage progress as JSON events")
    anl_usr.add_argument("--threshold", type=float, default=0.78, help="Semantic similarity threshold")

    # sv analyze feed <dataset> <target>
    anl_feed = anl_subparsers.add_parser("feed", help="Analyze a specific feed or user timeline")
    anl_feed.add_argument("dataset", type=str, help="Dataset identifier or file path")
    anl_feed.add_argument("target", type=str, nargs="?", default=None, help="User ID or feed target identifier")
    anl_feed.add_argument("-o", "--output", type=str, default=None, help="Save structured analysis to file")
    anl_feed.add_argument("--json", action="store_true", help="Output raw structured JSON results")
    anl_feed.add_argument("--stream", action="store_true", help="Stream pipeline stage progress as JSON events")
    anl_feed.add_argument("--threshold", type=float, default=0.78, help="Semantic similarity threshold")

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
    elif args.command in ["analyze", "anl", "eval"]:
        if not getattr(args, "analyze_type", None):
            # If user ran `sv analyze <dataset>`, default to dataset scope
            if hasattr(args, "dataset"):
                return run_analyze_command(args)
            print("Please specify analysis scope: 'dataset', 'user', or 'feed'. Run `sv analyze --help` for details.", file=sys.stderr)
            return 1
        return run_analyze_command(args)

    return 0


if __name__ == "__main__":
    sys.exit(main())
