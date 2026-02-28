/**
 * Pipeline Stages
 * ----------------
 * Defines all possible values for job.pipelineStage.
 * These represent the current position in the AI generation pipeline.
 *
 * Flow: intake → analysis → instruction → compilation → generation → completed
 *                                                                    → failed
 */

export const PIPELINE_STAGES = Object.freeze({
  /** Job received, config validated, credits deducted */
  INTAKE: 'intake',

  /** Gemini analyzing the input image (Call #1 — always) */
  ANALYSIS: 'analysis',

  /** Gemini refining user instruction (Call #2 — conditional) */
  INSTRUCTION: 'instruction',

  /** Master prompt being compiled from all sources */
  COMPILATION: 'compilation',

  /** KIE generation in progress */
  GENERATION: 'generation',

  /** Pipeline finished successfully, output available */
  COMPLETED: 'completed',

  /** Pipeline failed at any stage */
  FAILED: 'failed',
});

/**
 * Ordered array of active (non-terminal) stages for progress tracking.
 */
export const ACTIVE_STAGES = [
  PIPELINE_STAGES.INTAKE,
  PIPELINE_STAGES.ANALYSIS,
  PIPELINE_STAGES.INSTRUCTION,
  PIPELINE_STAGES.COMPILATION,
  PIPELINE_STAGES.GENERATION,
];

/**
 * Terminal stages — job will not transition further.
 */
export const TERMINAL_STAGES = [
  PIPELINE_STAGES.COMPLETED,
  PIPELINE_STAGES.FAILED,
];

export default PIPELINE_STAGES;
