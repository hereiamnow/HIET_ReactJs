import { firebaseConfigExport } from '../firebase';

/**
 * A helper function to trigger a file download in the browser.
 * This is used for exporting data.
 * @param {Object} params - Download parameters
 * @param {string} params.data - The data to download
 * @param {string} params.fileName - The name of the file
 * @param {string} params.fileType - The MIME type of the file
 */
export const downloadFile = ({ data, fileName, fileType }) => {
    const blob = new Blob([data], { type: fileType });
    const a = document.createElement('a');
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);
    const clickEvt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
};

/**
 * Generates an image using the Gemini (Imagen 3) API.
 * @param {string} itemName - The name of the item to generate an image for.
 * @param {string} [itemCategory] - The category of the item (e.g., 'cigar', 'humidor').
 * @param {string} [itemType] - The specific type of the item (e.g., 'Desktop Humidor').
 * @returns {Promise<string>} A promise that resolves to a base64 image data URL.
 */
export const generateAiImage = async (itemName, itemCategory, itemType) => {
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

    // Note: Image generation requires a proper Google Cloud service account token
    // For now, we'll disable this feature and return a placeholder
    console.warn("AI image generation is disabled - requires proper Google Cloud authentication");
    return `https://placehold.co/600x400/6b7280/ffffff?font=playfair-display&text=${encodeURIComponent(itemName)}`;

    /* 
    // Uncomment and configure when you have proper Google Cloud authentication
    const apiKey = process.env.REACT_APP_GOOGLE_CLOUD_TOKEN; // This should be a service account token
    const projectId = firebaseConfigExport.projectId;

    const apiUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagen-3.0-generate-002:predict`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
        } else {
            console.error("AI image generation failed:", result);
            return `https://placehold.co/600x400/ef4444/ffffff?font=playfair-display&text=Generation+Failed`;
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return `https://placehold.co/600x400/ef4444/ffffff?font=playfair-display&text=Error`;
    }
    */
};