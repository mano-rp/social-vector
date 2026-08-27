"""CLI command handler for listing available scenarios."""

from __future__ import annotations

from social_vector.generation.scenarios.registry import list_scenarios


def run_scenarios_command() -> int:
    """List all registered dataset generation scenarios."""
    scenarios = list_scenarios()

    print("=" * 80)
    print("SocialVector Available Generation Scenarios")
    print("=" * 80)
    for sc in scenarios:
        coord_badge = "[Coordinated]" if sc.has_coordination else "[Organic]"
        print(f"Scenario:     {sc.name}")
        print(f"Title:        {sc.display_title} {coord_badge}")
        print(f"Description:  {sc.description}")
        print(f"Purpose:      {sc.analytical_purpose}")
        print("-" * 80)

    print(f"Total Scenarios: {len(scenarios)}")
    print("=" * 80)
    return 0
