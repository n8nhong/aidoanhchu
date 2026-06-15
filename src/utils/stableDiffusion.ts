
/**
 * Generate a new background image for a product using Replicate Stable Diffusion.
 * The generated image will keep the product foreground and replace the background.
 * @param productTitle Title of the product (used as prompt).
 * @param referenceImageUrl Existing image URL (optional, can be used as init image).
 * @returns URL of the generated image (hosted by Replicate).
 */
export async function generateBackgroundImage(promptInput: string, referenceImageUrl?: string): Promise<string> {
  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN is not set in environment');
  }

  const body: any = {
    version: '8f7b9dad6b2c76a4f3e6c76d0fb49c1a45191b5a4fb2d2360e60e6f1a1514b24', // Stable Diffusion v1.5 (example)
    input: {
      prompt: promptInput,
      width: 512,
      height: 512,
      num_inference_steps: 50,
      guidance_scale: 7.5,
    }
  };

  // If a reference image is provided, use img2img
  if (referenceImageUrl) {
    body.input.image = referenceImageUrl;
    // prompt_strength < 1 to keep original structure. 0.5 allows background change while keeping subject mostly recognizable.
    body.input.prompt_strength = 0.55; 
  }

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Replicate API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const getResult = async (url: string): Promise<string> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to get prediction result');
    return res.json();
  };

  // Poll until completed
  let status = data.status;
  let predictionUrl = data.urls?.get;
  while (status === 'starting' || status === 'processing') {
    await new Promise(r => setTimeout(r, 1500));
    const result = await getResult(predictionUrl);
    status = result.status;
    if (result.output && Array.isArray(result.output) && result.output.length > 0) {
      return result.output[0]; // URL of generated image
    }
  }

  throw new Error('Image generation failed or did not return output');
}
