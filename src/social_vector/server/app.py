"""FastAPI REST API server for SocialVector analytical intelligence."""

from __future__ import annotations

import asyncio
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import uuid

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from social_vector.__version__ import __schema_version__, __version__
from social_vector.analysis.models import (
    AnalysisConfig,
    AnalysisResult,
    AnalysisScope,
    PipelineStageResult,
    PipelineStageStatus,
)
from social_vector.analysis.pipeline import AnalysisPipeline

app = FastAPI(
    title="SocialVector Analysis Engine API",
    version=__version__,
    description="REST API boundary for the SocialVector offline analytical intelligence engine.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

executor = ThreadPoolExecutor(max_workers=4)

# In-memory session stores
analysis_jobs: Dict[str, Dict[str, Any]] = {}
analysis_results: Dict[str, AnalysisResult] = {}


class CreateAnalysisRequest(BaseModel):
    dataset_id: str
    scope: str = "dataset"
    target_id: Optional[str] = None
    threshold: Optional[float] = 0.78
    eps: Optional[float] = 0.38
    min_samples: Optional[int] = 3


class AnalysisStatusResponse(BaseModel):
    analysis_id: str
    dataset_id: str
    scope: str
    target_id: Optional[str]
    status: str  # pending, running, completed, failed
    stages: List[Dict[str, Any]]
    created_at: str
    completed_at: Optional[str]


def execute_pipeline_task(
    analysis_id: str,
    dataset_id: str,
    scope: AnalysisScope,
    target_id: Optional[str],
    config: AnalysisConfig,
):
    """Background task executing the canonical analysis pipeline."""
    job = analysis_jobs.get(analysis_id)
    if not job:
        return

    job["status"] = "running"

    def progress_callback(stage: PipelineStageResult):
        if analysis_id in analysis_jobs:
            # Update stage in job status
            existing_stages = analysis_jobs[analysis_id]["stages"]
            for i, s in enumerate(existing_stages):
                if s["stage_id"] == stage.stage_id:
                    existing_stages[i] = stage.to_dict()
                    return
            existing_stages.append(stage.to_dict())

    pipeline = AnalysisPipeline(config)
    try:
        res = pipeline.run(
            dataset_path_or_id=dataset_id,
            scope=scope,
            target_id=target_id,
            progress_callback=progress_callback,
        )
        analysis_results[analysis_id] = res
        job["status"] = "completed"
        job["completed_at"] = res.completed_at
        job["result"] = res.to_dict()
    except Exception as e:
        job["status"] = "failed"
        job["error"] = str(e)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SocialVector Analytical Engine",
        "version": __version__,
        "schema_version": __schema_version__,
    }


@app.post("/api/analysis")
async def start_analysis(
    req: CreateAnalysisRequest,
    background_tasks: BackgroundTasks,
):
    analysis_id = f"anl_{uuid.uuid4().hex[:12]}"
    scope_enum = AnalysisScope(req.scope.lower())
    config = AnalysisConfig(
        similarity_threshold=req.threshold or 0.78,
        dbscan_eps=req.eps or 0.38,
        dbscan_min_samples=req.min_samples or 3,
    )

    analysis_jobs[analysis_id] = {
        "analysis_id": analysis_id,
        "dataset_id": req.dataset_id,
        "scope": req.scope,
        "target_id": req.target_id,
        "status": "pending",
        "stages": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None,
    }

    # Execute synchronously if small/fast or in thread pool
    background_tasks.add_task(
        execute_pipeline_task,
        analysis_id,
        req.dataset_id,
        scope_enum,
        req.target_id,
        config,
    )

    return {
        "analysis_id": analysis_id,
        "dataset_id": req.dataset_id,
        "scope": req.scope,
        "status": "pending",
    }


@app.get("/api/analysis/{analysis_id}")
def get_analysis_status(analysis_id: str):
    job = analysis_jobs.get(analysis_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found")
    return job


@app.get("/api/analysis/{analysis_id}/results")
def get_analysis_results(analysis_id: str):
    res = analysis_results.get(analysis_id)
    if not res:
        job = analysis_jobs.get(analysis_id)
        if job and job["status"] == "running":
            raise HTTPException(status_code=202, detail="Analysis is still in progress")
        if job and job["status"] == "failed":
            raise HTTPException(status_code=500, detail=f"Analysis failed: {job.get('error')}")
        raise HTTPException(status_code=404, detail=f"Results for '{analysis_id}' not found")
    return res.to_dict()


@app.get("/api/analysis/{analysis_id}/evidence")
def get_analysis_evidence(analysis_id: str):
    res = analysis_results.get(analysis_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"Analysis '{analysis_id}' not found")
    return {"evidence": [e.to_dict() for e in res.evidence]}


@app.get("/api/analysis/{analysis_id}/graph")
def get_analysis_graph(analysis_id: str):
    res = analysis_results.get(analysis_id)
    if not res or not res.graph:
        raise HTTPException(status_code=404, detail=f"Graph data for '{analysis_id}' not found")
    return res.graph.to_dict()
