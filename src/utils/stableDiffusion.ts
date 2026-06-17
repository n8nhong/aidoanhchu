
/**
 * Tạo ảnh nền sản phẩm bằng Replicate (cloud).
 */
export async function generateBackgroundImage(promptInput: string, referenceImageUrl?: string): Promise<string> {
  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
  if (!REPLICATE_TOKEN) {
    throw new Error(
      'REPLICATE_API_TOKEN chưa cấu hình. Vui lòng đặt token Replicate để tạo ảnh nền.'
    );
  }

  const body: Record<string, unknown> = {
    version: '8f7b9dad6b2c76a4f3e6c76d0fb49c1a45191b5a4fb2d2360e60e6f1a1514b24',
    input: {
      prompt: promptInput,
      width: 512,
      height: 512,
      num_inference_steps: 50,
      guidance_scale: 7.5,
    },
  };

  if (referenceImageUrl) {
    (body.input as Record<string, unknown>).image = referenceImageUrl;
    (body.input as Record<string, unknown>).prompt_strength = 0.55;
  }

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Replicate API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const getResult = async (url: string): Promise<Record<string, unknown>> => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to get prediction result');
    return res.json();
  };

  let status = data.status;
  let predictionUrl = data.urls?.get;
  while (status === 'starting' || status === 'processing') {
    await new Promise((r) => setTimeout(r, 1500));
    const result = await getResult(predictionUrl);
    status = result.status;
    if (result.output && Array.isArray(result.output) && result.output.length > 0) {
      return result.output[0] as string;
    }
  }

  throw new Error('Image generation failed or did not return output');
}

/** Upload data URL lên buffer để server lưu Supabase */
export function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; mime: string } {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error('Invalid data URL');
  return { mime: match[1], buffer: Buffer.from(match[2], 'base64') };
}
