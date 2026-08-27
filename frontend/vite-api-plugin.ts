import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// Root directories
const projectRoot = path.resolve(__dirname, '..');
const bundledDatasetsDir = path.resolve(projectRoot, 'datasets');
const userDatasetsDir = path.resolve(projectRoot, 'user_generated_datasets');
const pythonVenvBin = path.resolve(projectRoot, '.venv', 'bin', 'python');

// In-memory analysis results store
const analysisStore = new Map<string, any>();

export function socialVectorApiPlugin(): Plugin {
  return {
    name: 'social-vector-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        const method = req.method || 'GET';

        // 1. GET /api/datasets
        if (method === 'GET' && url === '/api/datasets') {
          try {
            const datasets: any[] = [];

            const scanDir = (dir: string, type: 'bundled' | 'user_generated') => {
              if (!fs.existsSync(dir)) return;
              const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
              for (const file of files) {
                const filePath = path.join(dir, file);
                try {
                  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                  const metadata = content.metadata || {};
                  const users = content.users || [];
                  const posts = content.posts || [];

                  datasets.push({
                    id: file.replace('.json', ''),
                    filename: file,
                    type,
                    datasetId: metadata.dataset_id || file,
                    scenario: metadata.scenario || 'unknown',
                    seed: metadata.seed ?? 42,
                    schemaVersion: metadata.schema_version || '1.0.0',
                    contentProfile: metadata.parameters?.content_profile || 'realistic',
                    createdAt: metadata.created_at || new Date().toISOString(),
                    totalUsers: metadata.statistics?.total_users ?? users.length,
                    totalPosts: metadata.statistics?.total_posts ?? posts.length,
                    totalLikes: metadata.statistics?.total_likes ?? 0,
                    totalReposts: metadata.statistics?.total_reposts ?? 0,
                    totalReplies: metadata.statistics?.total_replies ?? 0,
                    hasGroundTruth: !!content.ground_truth,
                    hasCoordination: content.ground_truth?.has_coordination ?? false,
                    campaignCount: content.ground_truth?.campaigns?.length ?? 0,
                  });
                } catch (e) {
                  console.error(`Error reading dataset ${filePath}:`, e);
                }
              }
            };

            scanDir(bundledDatasetsDir, 'bundled');
            scanDir(userDatasetsDir, 'user_generated');

            datasets.sort((a, b) => {
              if (a.type !== b.type) return a.type === 'bundled' ? -1 : 1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ datasets }));
            return;
          } catch (error: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
            return;
          }
        }

        // 2. GET /api/datasets/:filename
        if (method === 'GET' && url.startsWith('/api/datasets/')) {
          const rawParam = url.replace('/api/datasets/', '').split('?')[0];
          const filename = rawParam.endsWith('.json') ? rawParam : `${rawParam}.json`;

          let targetPath = path.join(userDatasetsDir, filename);
          if (!fs.existsSync(targetPath)) {
            targetPath = path.join(bundledDatasetsDir, filename);
          }

          if (!fs.existsSync(targetPath)) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Dataset ${filename} not found` }));
            return;
          }

          try {
            const data = fs.readFileSync(targetPath, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(data);
            return;
          } catch (error: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
            return;
          }
        }

        // 3. GET /api/scenarios
        if (method === 'GET' && url === '/api/scenarios') {
          const scenarios = [
            {
              id: 'organic_activity',
              name: 'Organic Social Activity',
              type: 'baseline',
              hasCoordination: false,
              description: 'Authentic social media activity across science, tech, and urban topics with natural diurnal timelines.',
              purpose: 'Establish baseline organic distribution of topics, activity rhythms, and network interactions.',
            },
            {
              id: 'extreme_information_operation',
              name: 'Extreme Geopolitical Information Operation',
              type: 'campaign_extreme_io',
              hasCoordination: true,
              description: 'Multi-layered 6-stage coordinated influence campaign simulating state-linked propaganda, astroturf citizen outrage, and narrative escalation in a fictional geopolitical universe.',
              purpose: 'Evaluate multi-signal correlation, temporal stage transitions, heterogeneous actor roles, and semantic narrative progression.',
            },
            {
              id: 'coordinated_campaign',
              name: 'Coordinated Campaign (Overt)',
              type: 'campaign_overt',
              hasCoordination: true,
              description: 'Synchronized astroturf/bot operation with high verbatim repetition and temporal burst alignment.',
              purpose: 'Evaluate detection of synchronized bursts, exact text repetition, and shared domain infrastructure.',
            },
            {
              id: 'paraphrased_coordination',
              name: 'Paraphrased Subtle Coordination',
              type: 'campaign_subtle',
              hasCoordination: true,
              description: 'Subtle coordinated influence campaign using semantic paraphrasing, staggered timing, and distributed domains.',
              purpose: 'Evaluate semantic embedding clustering, narrative correlation, and cross-domain tracking under noise.',
            },
            {
              id: 'organic_topical_similarity',
              name: 'Organic Topical Similarity Benchmark',
              type: 'benchmark_false_positive',
              hasCoordination: false,
              description: 'Authentic viral discussion around a shared real-world event without intentional coordination.',
              purpose: 'Evaluate whether analytical models avoid false-positive campaign detection on organic viral trends.',
            },
          ];

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ scenarios }));
          return;
        }

        // 4. POST /api/generate
        if (method === 'POST' && url === '/api/generate') {
          let bodyStr = '';
          req.on('data', chunk => { bodyStr += chunk; });
          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const scenario = body.scenario || 'organic_activity';
              const contentProfile = body.content_profile || 'realistic';
              const users = parseInt(body.users || '50', 10);
              const postsPerUser = parseInt(body.posts_per_user || '5', 10);
              const seed = parseInt(body.seed || '42', 10);
              const campaignRatio = parseFloat(body.campaign_ratio || '0.15');

              const timestamp = Date.now();
              const filename = `dataset_${scenario}_s${seed}_u${users}_${timestamp}.json`;
              const outputPath = path.join(userDatasetsDir, filename);

              if (!fs.existsSync(userDatasetsDir)) {
                fs.mkdirSync(userDatasetsDir, { recursive: true });
              }

              const pythonExec = fs.existsSync(pythonVenvBin) ? pythonVenvBin : 'python3';
              const args = [
                '-m', 'social_vector.cli.main',
                'generate-dataset',
                '--scenario', scenario,
                '--content-profile', contentProfile,
                '--users', users.toString(),
                '--posts-per-user', postsPerUser.toString(),
                '--seed', seed.toString(),
                '--campaign-ratio', campaignRatio.toString(),
                '--output', outputPath,
              ];

              if (body.start_date) args.push('--start-date', body.start_date);
              if (body.end_date) args.push('--end-date', body.end_date);

              await execFileAsync(pythonExec, args, { cwd: projectRoot });

              if (!fs.existsSync(outputPath)) {
                throw new Error('Generator completed without creating dataset file');
              }

              const datasetContent = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
              const metadata = datasetContent.metadata || {};

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                filename,
                id: filename.replace('.json', ''),
                datasetId: metadata.dataset_id || filename,
                scenario,
                contentProfile,
                usersCount: datasetContent.users?.length ?? users,
                postsCount: datasetContent.posts?.length ?? 0,
                createdAt: metadata.created_at || new Date().toISOString(),
              }));
            } catch (error: any) {
              console.error('Generation API error:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: error.message || 'Dataset generation failed' }));
            }
          });
          return;
        }

        // 5. POST or GET /api/analysis/stream (Live Real-Time SSE Observable Execution)
        if (url.startsWith('/api/analysis/stream') || url.startsWith('/api/analyze/stream')) {
          let scope = 'dataset';
          let datasetId = '';
          let targetId: string | null = null;
          let threshold: number | null = null;
          let eps: number | null = null;

          const handleStreamingExecution = async () => {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders?.();

            const pythonExec = fs.existsSync(pythonVenvBin) ? pythonVenvBin : 'python3';
            const args = [
              '-m', 'social_vector.cli.main',
              'analyze',
              scope,
              datasetId,
              '--stream',
            ];

            if (targetId && (scope === 'user' || scope === 'feed')) {
              args.push(targetId);
            }
            if (threshold) {
              args.push('--threshold', threshold.toString());
            }
            if (eps) {
              args.push('--eps', eps.toString());
            }

            const { spawn } = await import('child_process');
            const proc = spawn(pythonExec, args, { cwd: projectRoot });

            let lineBuffer = '';

            proc.stdout.on('data', (chunk: Buffer) => {
              lineBuffer += chunk.toString('utf-8');
              const lines = lineBuffer.split('\n');
              lineBuffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                try {
                  const event = JSON.parse(trimmed);
                  if (event.type === 'result' && event.result) {
                    analysisStore.set(event.result.analysis_id, event.result);
                  }
                  res.write(`data: ${JSON.stringify(event)}\n\n`);
                } catch {
                  // Non-JSON log message ignored
                }
              }
            });

            proc.stderr.on('data', (chunk: Buffer) => {
              console.warn('Analysis python stderr:', chunk.toString('utf-8'));
            });

            proc.on('close', (code) => {
              if (lineBuffer.trim()) {
                try {
                  const event = JSON.parse(lineBuffer.trim());
                  if (event.type === 'result' && event.result) {
                    analysisStore.set(event.result.analysis_id, event.result);
                  }
                  res.write(`data: ${JSON.stringify(event)}\n\n`);
                } catch {}
              }
              if (code !== 0) {
                res.write(`data: ${JSON.stringify({ type: 'error', error: `Process exited with code ${code}` })}\n\n`);
              }
              res.end();
            });

            req.on('close', () => {
              proc.kill();
            });
          };

          if (method === 'GET') {
            const parsedUrl = new URL(url, 'http://localhost');
            scope = parsedUrl.searchParams.get('scope') || 'dataset';
            datasetId = parsedUrl.searchParams.get('dataset_id') || parsedUrl.searchParams.get('dataset') || '';
            targetId = parsedUrl.searchParams.get('target_id') || parsedUrl.searchParams.get('target');
            if (parsedUrl.searchParams.get('threshold')) threshold = parseFloat(parsedUrl.searchParams.get('threshold')!);
            if (parsedUrl.searchParams.get('eps')) eps = parseFloat(parsedUrl.searchParams.get('eps')!);
            handleStreamingExecution();
            return;
          } else {
            let bodyStr = '';
            req.on('data', chunk => { bodyStr += chunk; });
            req.on('end', () => {
              try {
                const body = JSON.parse(bodyStr || '{}');
                scope = body.scope || 'dataset';
                datasetId = body.dataset_id || body.datasetId || '';
                targetId = body.target_id || body.target;
                threshold = body.threshold;
                eps = body.eps;
              } catch {}
              handleStreamingExecution();
            });
            return;
          }
        }

        // 6. POST /api/analysis (Execute Canonical Python Analytical Engine)
        if (method === 'POST' && (url === '/api/analysis' || url === '/api/analyze/feed' || url === '/api/analyze/dataset')) {
          let bodyStr = '';
          req.on('data', chunk => { bodyStr += chunk; });
          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const scope = body.scope || (url.includes('/feed') ? 'feed' : 'dataset');
              const datasetId = body.dataset_id || body.datasetId || body.targetId;
              const targetId = body.target_id || body.userId;

              const pythonExec = fs.existsSync(pythonVenvBin) ? pythonVenvBin : 'python3';
              const args = [
                '-m', 'social_vector.cli.main',
                'analyze',
                scope,
                datasetId,
                '--json',
              ];

              if (targetId && (scope === 'user' || scope === 'feed')) {
                args.push(targetId);
              }
              if (body.threshold) {
                args.push('--threshold', body.threshold.toString());
              }
              if (body.eps) {
                args.push('--eps', body.eps.toString());
              }

              const { stdout } = await execFileAsync(pythonExec, args, {
                cwd: projectRoot,
                maxBuffer: 10 * 1024 * 1024,
              });

              const result = JSON.parse(stdout);
              analysisStore.set(result.analysis_id, result);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                analysis_id: result.analysis_id,
                dataset_id: result.dataset_id,
                scope: result.scope,
                status: 'completed',
                result,
              }));
            } catch (error: any) {
              console.error('Analysis execution error:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: error.message || 'Analysis execution failed' }));
            }
          });
          return;
        }

        // 6. GET /api/analysis/:id/results, /api/analysis/:id/evidence, /api/analysis/:id/graph
        if (method === 'GET' && url.startsWith('/api/analysis/')) {
          const parts = url.replace('/api/analysis/', '').split('/');
          const analysisId = parts[0];
          const subResource = parts[1] || 'status';

          const result = analysisStore.get(analysisId);
          if (!result) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Analysis '${analysisId}' not found` }));
            return;
          }

          res.setHeader('Content-Type', 'application/json');
          if (subResource === 'results' || subResource === 'status') {
            res.end(JSON.stringify(result));
          } else if (subResource === 'evidence') {
            res.end(JSON.stringify({ evidence: result.evidence || [] }));
          } else if (subResource === 'graph') {
            res.end(JSON.stringify(result.graph || { nodes: [], edges: [] }));
          } else {
            res.end(JSON.stringify(result));
          }
          return;
        }

        next();
      });
    }
  };
}
