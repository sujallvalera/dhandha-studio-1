/**
 * KIE Service — Pipeline Step 5 (PRIMARY IMAGE GENERATION ENGINE)
 * -----------------------------------------------------------------
 * This is the ONLY image generation endpoint in the platform.
 * Gemini is NEVER used for final image generation.
 *
 * Flow:
 *   1. Submit compiled prompt to KIE API
 *   2. Receive a KIE job ID
 *   3. Poll KIE for job completion
 *   4. Return generated image buffer/URL
 *
 * The KIE API integration uses a standard REST pattern:
 *   POST   /generate     → submit job
 *   GET    /status/:id   → poll status
 *   GET    /result/:id   → download result
 */

import kieConfig from '../config/kie.js';

/**
 * Submit a generation job to KIE.
 *
 * @param {object} params
 * @param {object} params.compiledPrompt   Master prompt from promptCompiler
 * @param {string} params.inputImageUrl    Cloudinary URL of the raw input image
 * @returns {Promise<{ kieJobId: string, status: string }>}
 */
export const submitGenerationJob = async ({ compiledPrompt, inputImageUrl }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), kieConfig.timeoutMs);

  try {
    const response = await fetch(`${kieConfig.baseUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${kieConfig.apiKey}`,
        'X-Client': 'dhandha-studio',
      },
      body: JSON.stringify({
        prompt: compiledPrompt,
        input_image_url: inputImageUrl,
        output_format: 'png',
        webhook_url: null,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`KIE API error (${response.status}): ${errorBody || response.statusText}`);
    }

    const data = await response.json();

    return {
      kieJobId: data.job_id || data.id,
      status: data.status || 'submitted',
    };
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Poll KIE API for job status.
 *
 * @param {string} kieJobId
 * @returns {Promise<{ status: string, progress: number|null, outputUrl: string|null, error: string|null }>}
 */
export const pollJobStatus = async (kieJobId) => {
  const response = await fetch(`${kieConfig.baseUrl}/status/${kieJobId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${kieConfig.apiKey}`,
      'X-Client': 'dhandha-studio',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`KIE status poll error (${response.status}): ${errorBody || response.statusText}`);
  }

  const data = await response.json();

  return {
    status: data.status,
    progress: data.progress ?? null,
    outputUrl: data.output_url || data.result_url || null,
    error: data.error || null,
  };
};

/**
 * Download the generated image from KIE as a Buffer.
 *
 * @param {string} kieJobId
 * @returns {Promise<{ buffer: Buffer, mimeType: string }>}
 */
export const downloadResult = async (kieJobId) => {
  const response = await fetch(`${kieConfig.baseUrl}/result/${kieJobId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${kieConfig.apiKey}`,
      'X-Client': 'dhandha-studio',
    },
  });

  if (!response.ok) {
    throw new Error(`KIE result download error (${response.status}): ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || 'image/png';
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return { buffer, mimeType: contentType.split(';')[0].trim() };
};

/**
 * Full generation flow: submit → poll until done → download.
 *
 * @param {object} params
 * @param {object} params.compiledPrompt   Master prompt from promptCompiler
 * @param {string} params.inputImageUrl    Cloudinary URL of the raw input image
 * @param {number} [params.pollIntervalMs=3000]  Polling interval
 * @param {number} [params.maxPollAttempts=60]   Max poll attempts before timeout
 * @param {function} [params.onProgress]         Optional callback (progress: number) => void
 * @returns {Promise<{ kieJobId: string, buffer: Buffer, mimeType: string, outputUrl: string|null }>}
 */
export const generateImage = async ({
  compiledPrompt,
  inputImageUrl,
  pollIntervalMs = 3000,
  maxPollAttempts = 60,
  onProgress = null,
}) => {
  // 1. Submit job
  const { kieJobId } = await submitGenerationJob({ compiledPrompt, inputImageUrl });
  console.log(`[KIE] Job submitted: ${kieJobId}`);

  // 2. Poll for completion
  let attempts = 0;
  let lastStatus = null;

  while (attempts < maxPollAttempts) {
    await sleep(pollIntervalMs);
    attempts++;

    const pollResult = await pollJobStatus(kieJobId);
    lastStatus = pollResult;

    if (onProgress && pollResult.progress != null) {
      onProgress(pollResult.progress);
    }

    if (pollResult.status === 'completed' || pollResult.status === 'done' || pollResult.status === 'success') {
      console.log(`[KIE] Job ${kieJobId} completed after ${attempts} polls.`);

      // If KIE returns a direct URL, try to use it
      if (pollResult.outputUrl) {
        const imgResponse = await fetch(pollResult.outputUrl);
        const arrayBuffer = await imgResponse.arrayBuffer();
        return {
          kieJobId,
          buffer: Buffer.from(arrayBuffer),
          mimeType: imgResponse.headers.get('content-type')?.split(';')[0].trim() || 'image/png',
          outputUrl: pollResult.outputUrl,
        };
      }

      // Otherwise download from result endpoint
      const { buffer, mimeType } = await downloadResult(kieJobId);
      return { kieJobId, buffer, mimeType, outputUrl: null };
    }

    if (pollResult.status === 'failed' || pollResult.status === 'error') {
      throw new Error(`KIE generation failed: ${pollResult.error || 'Unknown error'}`);
    }

    // Still processing — continue polling
    console.log(`[KIE] Job ${kieJobId} status: ${pollResult.status} (poll ${attempts}/${maxPollAttempts})`);
  }

  throw new Error(`KIE generation timed out after ${maxPollAttempts} polls for job ${kieJobId}. Last status: ${lastStatus?.status}`);
};

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default { submitGenerationJob, pollJobStatus, downloadResult, generateImage };
