"""Network graph builder using NetworkX for relationship and coordination topology modeling."""

from __future__ import annotations

from typing import Dict, List, Set, Tuple

import networkx as nx

from social_vector.analysis.clustering.dbscan import ClusteringResult
from social_vector.analysis.features.content import ContentFeatureResult
from social_vector.analysis.features.embeddings import SemanticFeatureResult
from social_vector.analysis.features.temporal import TemporalFeatureResult
from social_vector.analysis.ingestion import IngestedDatasetContext
from social_vector.analysis.models import GraphData, GraphEdge, GraphNode
from social_vector.analysis.preprocessing import PreprocessedData


class GraphBuilder:
    """Constructs multi-relational NetworkX graphs over observed users, posts, domains, and clusters."""

    def build_graph(
        self,
        ctx: IngestedDatasetContext,
        preprocessed: PreprocessedData,
        semantic_res: SemanticFeatureResult,
        temporal_res: TemporalFeatureResult,
        content_res: ContentFeatureResult,
        clustering_res: ClusteringResult,
        max_nodes: int = 150,
    ) -> GraphData:
        G = nx.Graph()

        nodes_map: Dict[str, GraphNode] = {}
        edges_list: List[GraphEdge] = []

        # 1. Add User Nodes (prioritize coordinated or active users)
        for u in ctx.users[:max_nodes]:
            node_id = f"user:{u.user_id}"
            node = GraphNode(
                id=node_id,
                label=f"@{u.username}",
                type="user",
                attributes={
                    "user_id": u.user_id,
                    "display_name": u.display_name,
                    "verified": u.verified,
                    "followers": u.metrics.followers_count,
                    "following": u.metrics.following_count,
                },
            )
            nodes_map[node_id] = node
            G.add_node(node_id, **node.attributes)

        # 2. Add Domain Nodes
        for domain, users in content_res.shared_domains.items():
            if len(users) >= 2:
                node_id = f"domain:{domain}"
                node = GraphNode(
                    id=node_id,
                    label=domain,
                    type="domain",
                    attributes={"domain": domain, "sharer_count": len(users)},
                )
                nodes_map[node_id] = node
                G.add_node(node_id, **node.attributes)

                # Connect domain to users
                for u in users:
                    u_node_id = f"user:{u}"
                    if u_node_id in nodes_map:
                        edges_list.append(
                            GraphEdge(
                                source=u_node_id,
                                target=node_id,
                                relationship="shared_domain",
                                weight=1.0,
                                evidence=f"Account amplified domain {domain}",
                            )
                        )
                        G.add_edge(u_node_id, node_id, relationship="shared_domain")

        # 3. Add Cluster Nodes
        for cluster in clustering_res.clusters:
            c_node_id = f"cluster:{cluster.cluster_id}"
            node = GraphNode(
                id=c_node_id,
                label=cluster.cluster_id,
                type="cluster",
                attributes={
                    "cluster_id": cluster.cluster_id,
                    "score": cluster.coordination_score,
                    "size_users": cluster.size_users,
                    "size_posts": cluster.size_posts,
                },
            )
            nodes_map[c_node_id] = node
            G.add_node(c_node_id, **node.attributes)

            # Connect cluster to participating users
            for u in cluster.participating_user_ids:
                u_node_id = f"user:{u}"
                if u_node_id in nodes_map:
                    edges_list.append(
                        GraphEdge(
                            source=u_node_id,
                            target=c_node_id,
                            relationship="co_cluster",
                            weight=cluster.coordination_score,
                            evidence=f"Member of cluster {cluster.cluster_id}",
                        )
                    )
                    G.add_edge(u_node_id, c_node_id, relationship="co_cluster")

        # 4. Add Cross-User Semantic & Temporal Edges
        # Semantic edges
        for (u1, u2), sim in semantic_res.user_max_similarity.items():
            if sim >= 0.78:
                u1_id = f"user:{u1}"
                u2_id = f"user:{u2}"
                if u1_id in nodes_map and u2_id in nodes_map:
                    edges_list.append(
                        GraphEdge(
                            source=u1_id,
                            target=u2_id,
                            relationship="semantic_similarity",
                            weight=round(sim, 4),
                            evidence=f"High cosine similarity ({sim:.2f}) between posts",
                        )
                    )
                    G.add_edge(u1_id, u2_id, relationship="semantic_similarity", weight=sim)

        # Temporal burst edges
        for (u1, u2), burst_count in temporal_res.synchronized_user_pairs.items():
            if burst_count >= 2:
                u1_id = f"user:{u1}"
                u2_id = f"user:{u2}"
                if u1_id in nodes_map and u2_id in nodes_map:
                    edges_list.append(
                        GraphEdge(
                            source=u1_id,
                            target=u2_id,
                            relationship="temporal_burst",
                            weight=min(1.0, burst_count * 0.3),
                            evidence=f"Co-occurred in {burst_count} synchronized burst windows",
                        )
                    )
                    G.add_edge(u1_id, u2_id, relationship="temporal_burst")

        density = nx.density(G) if G.number_of_nodes() > 1 else 0.0

        return GraphData(
            nodes=list(nodes_map.values()),
            edges=edges_list,
            density=round(density, 4),
            node_count=len(nodes_map),
            edge_count=len(edges_list),
        )
