/**
 * Status Controller
 * -------------------
 * Handles GET /status/:job_id
 *
 * Returns the current state of a job including:
 *   - pipelineStage (the new pipeline position)
 *   - status (legacy compatibility)
 *   - output URL and metadata for completed jobs
 *   - error details for failed jobs
 */

import { getJob } from '../services/jobService.js';
import { ACTIVE_STAGES } from '../constants/pipelineStages.js';

export const handleStatus = async (req, res, next) => {
  try {
    const { job_id: jobId } = req.params;

    const job = await getJob(jobId);

    if (!job) {
      const err = new Error('Job not found.');
      err.statusCode = 404;
      throw err;
    }

    // ── Completed ───────────────────────────────────────────────
    if (job.pipelineStage === 'completed') {
      return res.status(200).json({
        job_id: job.job_id,
        status: 'completed',
        pipelineStage: 'completed',
        url: job.outputUrl || job.output_url,
        metadata: {
          width: job.metadata?.width || job.metadata?.requestedWidth || null,
          height: job.metadata?.height || job.metadata?.requestedHeight || null,
          durationMs: job.metadata?.durationMs || null,
          kieJobId: job.metadata?.kieJobId || null,
          ecommerceMode: job.metadata?.ecommerceMode || null,
          instructionSource: job.metadata?.instructionSource || null,
        },
        analysis: job.imageAnalysis ? {
          productType: job.imageAnalysis.detectedProductType,
          description: job.imageAnalysis.garmentDescription,
          colors: job.imageAnalysis.dominantColors,
        } : null,
        dimensions: {
          width: job.metadata?.requestedWidth || null,
          height: job.metadata?.requestedHeight || null,
          aspectRatio: job.aspectRatio || null,
          resolution: job.resolution || null,
        },
      });
    }

    // ── Failed ──────────────────────────────────────────────────
    if (job.pipelineStage === 'failed') {
      return res.status(200).json({
        job_id: job.job_id,
        status: 'failed',
        pipelineStage: 'failed',
        error: job.metadata?.error || 'Image generation failed.',
        failedAt: job.metadata?.failedAt || null,
        durationMs: job.metadata?.durationMs || null,
      });
    }

    // ── In Progress ─────────────────────────────────────────────
    const stageIndex = ACTIVE_STAGES.indexOf(job.pipelineStage);
    const progress = stageIndex >= 0
      ? Math.round(((stageIndex + 1) / (ACTIVE_STAGES.length + 1)) * 100)
      : 0;

    return res.status(200).json({
      job_id: job.job_id,
      status: 'processing',
      pipelineStage: job.pipelineStage || job.status,
      progress,
      stages: ACTIVE_STAGES,
      currentStageIndex: stageIndex,
    });

  } catch (error) {
    next(error);
  }
};

export default { handleStatus };
