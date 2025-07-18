/**
 * AI utility functions for image generation and AI-related operations
 */

/**
 * Generates an image using the Gemini (Imagen 3) API.
 * @param {string} itemName - The name of the item to generate an image for.
 * @param {string} [itemCategory] - The category of the item (e.g., 'cigar', 'humidor').
 * @param {string} [itemType] - The specific type of the item (e.g., 'Desktop Humidor').
 * @param {Object} firebaseConfig - Firebase configuration object with apiKey and projectId
 * @returns {Promise<string>} A promise that resolves to a base64 image data URL.
 */
export const generateAiImage = async (itemName, itemCategory, itemType, firebaseConfig) => {
    // This prompt is sent to the AI to guide the image generation.
    let prompt;
    if (itemCategory === 'humidor') {
        prompt = `A professional, high-quality, photorealistic image of a ${itemType || ''} ${itemName} humidor, suitable for a product catalog. The background should be clean and simple, focusing on the product.`;
    } else {
        // Default prompt for cigars or other items
        prompt = `A professional, high-quality, photorealistic image of a ${itemName}, suitable for a product catalog. The background should be clean and simple, focusing on the product.`;
    }

    // The payload is the data structure required by the Gemini API endpoint.
    const payload = {
        instances: [{ prompt: prompt }],
        parameters: { "sampleCount": 1 }
    };

    const apiKey = firebaseConfig.apiKey;
    const projectId = firebaseConfig.projectId;

    const apiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3.0-generate-002:predict`;

    try {
        // We use a try/catch block to handle potential network errors.
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` // Use Bearer token for authentication
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // If the API returns an error status (e.g., 400, 500), we throw an error.
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            // The API returns the image as a base64 string. We format it into a data URL
            // that can be used directly in an <img> src attribute.
            return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
        } else {
            // This case handles a successful API call that doesn't return the expected image data.
            console.error("AI image generation failed:", result);
            return `https://placehold.co/600x400/ef4444/ffffff?font=playfair-display&text=Generation+Failed`;
        }
    } catch (error) {
        // This catches network errors or the error thrown above.
        console.error("Error calling Gemini API:", error);
        return `https://placehold.co/600x400/ef4444/ffffff?font=playfair-display&text=Error`;
    }
};