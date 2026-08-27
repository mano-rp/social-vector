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

export function socialVectorApiPlugin(): Plugin {
  return {
    name: 'social-vector-api',
    configureServer(server) {
      // 1. GET /api/datasets
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';

        if (req.method === 'GET' && url === '/api/datasets') {
          try {
            const datasets: any[] = [];

            // Helper to scan directory
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

            // Sort: bundled first, then by creation date descending
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
        if (req.method === 'GET' && url.startsWith('/api/datasets/')) {
          const rawParam = url.replace('/api/datasets/', '').split('?')[0];
          const filename = rawParam.endsWith('.json') ? rawParam : `${rawParam}.json`;

          // Check in user_generated first, then bundled
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
        if (req.method === 'GET' && url === '/api/scenarios') {
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
        if (req.method === 'POST' && url === '/api/generate') {
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

              // Format filename
              const timestamp = Date.now();
              const filename = `dataset_${scenario}_s${seed}_u${users}_${timestamp}.json`;
              const outputPath = path.join(userDatasetsDir, filename);

              // Ensure userDatasetsDir exists
              if (!fs.existsSync(userDatasetsDir)) {
                fs.mkdirSync(userDatasetsDir, { recursive: true });
              }

              // Build CLI arguments
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

              if (body.start_date) {
                args.push('--start-date', body.start_date);
              }
              if (body.end_date) {
                args.push('--end-date', body.end_date);
              }

              // Execute generator
              await execFileAsync(pythonExec, args, { cwd: projectRoot });

              // Verify file creation
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

        // 5. POST /api/analyze/feed and POST /api/analyze/dataset (Placeholder API)
        if (req.method === 'POST' && (url === '/api/analyze/feed' || url === '/api/analyze/dataset')) {
          let bodyStr = '';
          req.on('data', chunk => { bodyStr += chunk; });
          req.on('end', () => {
            const body = JSON.parse(bodyStr || '{}');
            const scope = url.includes('/feed') ? 'feed' : 'dataset';
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              status: 'placeholder',
              scope,
              targetId: body.targetId || body.userId || body.datasetId,
              message: 'Observation context assembled. Analysis engine integration boundary reached.',
              signalsEvaluated: ['content_lexicon', 'temporal_rhythm', 'network_topology', 'domain_infrastructure'],
              timestamp: new Date().toISOString(),
            }));
          });
          return;
        }

        next();
      });
    }
  };
}
