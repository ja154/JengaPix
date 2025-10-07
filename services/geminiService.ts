/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

// Helper function to convert a File object to a Gemini API Part
const fileToPart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string; } }> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
    
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("Invalid data URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("Could not parse MIME type from data URL");
    
    const mimeType = mimeMatch[1];
    const data = arr[1];
    return { inlineData: { mimeType, data } };
};

const handleApiResponse = (
    response: GenerateContentResponse,
    context: string // e.g., "edit", "filter", "adjustment"
): string => {
    // 1. Check for prompt blocking first
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }

    // 2. Iterate through parts to find the image data, as recommended
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const { mimeType, data } = part.inlineData;
                console.log(`Received image data (${mimeType}) for ${context}`);
                return `data:${mimeType};base64,${data}`;
            }
        }
    }

    // 3. If no image, check for other reasons
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `Image generation for ${context} stopped unexpectedly. Reason: ${finishReason}. This often relates to safety settings.`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }
    
    const textFeedback = response.text?.trim();
    const errorMessage = `The AI model did not return an image for the ${context}. ` + 
        (textFeedback 
            ? `The model responded with text: "${textFeedback}"`
            : "This can happen due to safety filters or if the request is too complex. Please try rephrasing your prompt to be more direct.");

    console.error(`Model response did not contain an image part for ${context}.`, { response });
    throw new Error(errorMessage);
};

/**
 * Generates an edited image using generative AI based on a text prompt and a specific point.
 * @param originalImage The original image file.
 * @param userPrompt The text prompt describing the desired edit.
 * @param hotspot The {x, y} coordinates on the image to focus the edit.
 * @returns A promise that resolves to the data URL of the edited image.
 */
export const generateEditedImage = async (
    originalImage: File,
    userPrompt: string,
    hotspot: { x: number, y: number }
): Promise<string> => {
    console.log('Starting generative edit at:', hotspot);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to perform a natural, localized edit on the provided image based on the user's request.
User Request: "${userPrompt}"
Edit Location: Focus on the area around pixel coordinates (x: ${hotspot.x}, y: ${hotspot.y}).

Editing Guidelines:
- The edit must be realistic and blend seamlessly with the surrounding area.
- The rest of the image (outside the immediate edit area) must remain identical to the original.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.

Output: Return ONLY the final edited image. Do not return text.`;
    const textPart = { text: prompt };

    console.log('Sending image and prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    console.log('Received response from model.', response);

    return handleApiResponse(response, 'edit');
};

/**
 * Generates an image with a filter applied using generative AI.
 * @param originalImage The original image file.
 * @param filterPrompt The text prompt describing the desired filter.
 * @returns A promise that resolves to the data URL of the filtered image.
 */
export const generateFilteredImage = async (
    originalImage: File,
    filterPrompt: string,
): Promise<string> => {
    console.log(`Starting filter generation: ${filterPrompt}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to apply a stylistic filter to the entire image based on the user's request. Do not change the composition or content, only apply the style.
Filter Request: "${filterPrompt}"

Safety & Ethics Policy:
- Filters may subtly shift colors, but you MUST ensure they do not alter a person's fundamental race or ethnicity.
- YOU MUST REFUSE any request that explicitly asks to change a person's race (e.g., 'apply a filter to make me look Chinese').

Output: Return ONLY the final filtered image. Do not return text.`;
    const textPart = { text: prompt };

    console.log('Sending image and filter prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    console.log('Received response from model for filter.', response);
    
    return handleApiResponse(response, 'filter');
};

/**
 * Generates an image with a global adjustment applied using generative AI.
 * @param originalImage The original image file.
 * @param adjustmentPrompt The text prompt describing the desired adjustment.
 * @returns A promise that resolves to the data URL of the adjusted image.
 */
export const generateAdjustedImage = async (
    originalImage: File,
    adjustmentPrompt: string,
): Promise<string> => {
    console.log(`Starting global adjustment generation: ${adjustmentPrompt}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to perform a natural, global adjustment to the entire image based on the user's request.
User Request: "${adjustmentPrompt}"

Editing Guidelines:
- The adjustment must be applied across the entire image.
- The result must be photorealistic.

Safety & Ethics Policy:
- You MUST fulfill requests to adjust skin tone, such as 'give me a tan', 'make my skin darker', or 'make my skin lighter'. These are considered standard photo enhancements.
- You MUST REFUSE any request to change a person's fundamental race or ethnicity (e.g., 'make me look Asian', 'change this person to be Black'). Do not perform these edits. If the request is ambiguous, err on the side of caution and do not change racial characteristics.

Output: Return ONLY the final adjusted image. Do not return text.`;
    const textPart = { text: prompt };

    console.log('Sending image and adjustment prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    console.log('Received response from model for adjustment.', response);
    
    return handleApiResponse(response, 'adjustment');
};

/**
 * Generates an image with the background removed.
 * @param originalImage The original image file.
 * @returns A promise that resolves to the data URL of the image with a transparent background.
 */
export const generateRemovedBackground = async (
    originalImage: File,
): Promise<string> => {
    console.log(`Starting background removal.`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert photo editor AI. Your task is to perfectly isolate the main subject(s) from the background in the provided image.
- Identify the primary subject(s) of the photo.
- Create a clean and precise cutout of the subject(s), preserving all details like hair, fur, or fine edges.
- The background must be completely removed and replaced with a transparent canvas.
- The output MUST be a PNG image with a transparent background.
- Do not add any shadows, borders, or effects.
- The subject(s) must remain identical to the original, with no other changes.

Output: Return ONLY the final image with the transparent background. Do not return text.`;
    const textPart = { text: prompt };

    console.log('Sending image to the model for background removal...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    console.log('Received response from model for background removal.', response);
    
    return handleApiResponse(response, 'background removal');
};

export interface TextStyle {
  font?: string;
  size?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
}

/**
 * Finds and replaces text in an image, matching the original style or user-provided styles.
 * @param originalImage The original image file.
 * @param oldText The text to find and replace in the image.
 * @param newText The new text to insert.
 * @param style Optional styling hints for the new text.
 * @returns A promise that resolves to the data URL of the edited image.
 */
export const generateTextEditImage = async (
    originalImage: File,
    oldText: string,
    newText: string,
    style: TextStyle = {}
): Promise<string> => {
    console.log(`Starting text edit: replacing "${oldText}" with "${newText}"`, { style });
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    
    // Build style instructions dynamically
    const styleParts: string[] = [];
    if (style.font) styleParts.push(`- Font face similar to: ${style.font}`);
    if (style.size) styleParts.push(`- Size: ${style.size}`);
    if (style.color) styleParts.push(`- Color: ${style.color}`);
    if (style.bold) styleParts.push(`- Weight: Bold`);
    if (style.italic) styleParts.push(`- Style: Italic`);

    let styleInstructions = '';
    if (styleParts.length > 0) {
        styleInstructions = `
Key Style Instructions for the new text:
${styleParts.join('\n')}

If a style attribute is not specified above, you MUST intelligently match it to the original text's style ("${oldText}"). If there was no original text, match the surrounding environment for a natural look.
`;
    } else {
        styleInstructions = `
Key Style Instructions for the new text:
Your primary task is to make the new text, "${newText}", an absolutely seamless replacement for the original text, "${oldText}". To achieve this, you must follow a strict process:
1.  **Analyze the Original Text:** Carefully examine "${oldText}" in the image. Identify all of its visual properties with extreme precision.
2.  **Extract Key Attributes:** Your analysis must determine the following:
    -   **Font:** The exact font face, weight (bold, regular), and style (italic, normal).
    -   **Color:** The precise color, including any gradients, textures, or patterns.
    -   **Size & Scale:** The font size relative to the image and its surroundings.
    -   **Perspective & Transformation:** Any rotation, skewing, warping, or perspective applied to the text.
    -   **Lighting & Effects:** How the text interacts with the scene's lighting. Identify and replicate all shadows, highlights, glows, or bevels.
3.  **Apply to New Text:** Render the new text, "${newText}", using the *exact* attributes you extracted. The new text must occupy the same 3D space as the original.

The final result must be indistinguishable from a real photograph where the new text was present from the beginning.
`;
    }

    const prompt = `You are an expert photo editor AI specializing in typography and photorealistic text integration. Your task is to find and replace text within the provided image.

Text to find: "${oldText}"
Text to replace it with: "${newText}"
${styleInstructions}
General Instructions:
1.  **Find the Text:** Accurately locate the instance of "${oldText}" in the image. If there are multiple instances, replace the most prominent one.
2.  **Reconstruct Background:** Before adding the new text, intelligently remove the original text and reconstruct the background behind it as if the text was never there. This is a critical step.
3.  **Seamless Integration:** The final result should be photorealistic and indistinguishable from a real photograph. The new text should look like it was part of the original scene.
4.  **Preserve Image:** The rest of the image (everything other than the text being replaced) must remain absolutely identical to the original.

Output: Return ONLY the final edited image in the same resolution. Do not return any text, explanations, or dialogue.`;
    const textPart = { text: prompt };

    console.log('Sending image and text edit prompt to the model...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [originalImagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    console.log('Received response from model for text edit.', response);
    
    return handleApiResponse(response, 'text edit');
};


/**
 * Generates a textual description for an image.
 * @param originalImage The image file to describe.
 * @returns A promise that resolves to a string description of the image.
 */
export const generateImageDescription = async (
    originalImage: File,
): Promise<string> => {
    console.log(`Starting image description generation.`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    const originalImagePart = await fileToPart(originalImage);
    const prompt = `You are an expert at analyzing images and creating descriptive prompts.
Analyze the provided image and generate a detailed, descriptive prompt that could be used by an image generation AI to create a similar image.

Describe the following aspects:
- Subject: What is the main subject?
- Composition: How is the shot framed (e.g., close-up, wide shot)?
- Setting: Where does the image take place?
- Lighting: What is the lighting like (e.g., golden hour, studio lighting)?
- Style: What is the artistic style (e.g., photorealistic, anime, watercolor)?
- Colors: What are the dominant colors?

Output only the final, detailed prompt as a single paragraph of text. Do not include any other explanations or introductory phrases.`;
    const textPart = { text: prompt };

    console.log('Sending image to the model for description...');
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [originalImagePart, textPart] },
    });
    console.log('Received response from model for description.', response);
    
    if (response.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = response.promptFeedback;
        const errorMessage = `Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }

    const description = response.text;

    if (description) {
        return description.trim();
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    const errorMessage = `The AI model did not return a text description. Reason: ${finishReason || 'Unknown'}. This can happen due to safety filters.`;
    console.error(errorMessage, { response });
    throw new Error(errorMessage);
};

/**
 * Generates an image from a text prompt.
 * @param prompt The text prompt describing the desired image.
 * @returns A promise that resolves to the data URL of the generated image.
 */
export const generateImageFromPrompt = async (
    prompt: string,
): Promise<string> => {
    console.log(`Starting image generation from prompt: ${prompt}`);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });
        console.log('Received response from model for image generation.', response);

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        
        throw new Error('The AI model did not return an image. This might be due to safety filters or the complexity of the prompt.');

    } catch(err) {
        console.error('Error during image generation:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during image generation.';
        throw new Error(errorMessage);
    }
};