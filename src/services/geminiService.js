import { firebaseConfigExport } from '../firebase';

/**
 * Asynchronous function to make a POST request to the Gemini API.
 * @param {string} prompt - The text prompt to send to the Gemini API.
 * @param {object|null} responseSchema - An optional schema to tell the API to return a structured JSON object.
 * @returns {Promise<string|object>} A promise that resolves to the text response from the API, or a parsed JSON object if a schema was provided.
 */
export async function callGeminiAPI(prompt, responseSchema = null) {
    // Prepare the conversation history for the API. It starts with the user's prompt.
    let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];

    // Retrieve the Gemini API key from environment variables for security. This prevents hardcoding sensitive keys in the source code.
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY || firebaseConfigExport.apiKey;

    // Construct the full URL for the specific Gemini API model endpoint.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Create the main payload (the data we send) for the API request.
    const payload = { contents: chatHistory };

    // If a `responseSchema` is provided, it means we want a structured JSON response.
    // This block adds the necessary configuration to the payload to enforce the JSON output format.
    if (responseSchema) {
        payload.generationConfig = {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        };
    }

    // Use a try...catch block to handle potential network errors (e.g., user is offline) during the API call.
    try {
        // Make the actual network request to the Gemini API using the 'fetch' function.
        // It's a POST request, and we send the payload as a JSON string.
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Check if the API call was successful. `response.ok` is true for statuses like 200.
        if (!response.ok) {
            // If the response is not okay (e.g., 400 or 500 error), we parse the error details and log them.
            const errorBody = await response.json();
            console.error("Gemini API HTTP Error:", response.status, errorBody);
            // Return a user-friendly error message.
            return `API Error: Something went wrong (${response.status}).`;
        }

        // If the call was successful, parse the JSON data from the response body.
        const result = await response.json();

        // Navigate through the nested structure of the API response to find the generated text.
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            let textResult = result.candidates[0].content.parts[0].text;

            // If we were expecting a JSON object (because a schema was sent)...
            if (responseSchema) {
                try {
                    // First, try to parse the entire text as JSON. This is the ideal case.
                    return JSON.parse(textResult);
                } catch (jsonError) {
                    // If direct parsing fails, it might be because the API wrapped the JSON in a markdown code block (e.g., ```json{...}```).
                    // This regex looks for that pattern and extracts the JSON content from between the backticks.
                    const jsonMatch = textResult.match(/```(json)?\s*([\s\S]*?)\s*```/);
                    if (jsonMatch && jsonMatch[2]) {
                        try {
                            // If a match is found, try to parse the extracted content.
                            return JSON.parse(jsonMatch[2]);
                        } catch (nestedJsonError) {
                            // If even this fails, log the error and the text that failed to parse.
                            console.error("Failed to parse extracted JSON from Gemini API:", nestedJsonError, "Extracted text:", jsonMatch[2]);
                            return `Failed to parse structured response: ${nestedJsonError.message}. Raw: ${textResult.substring(0, 100)}...`;
                        }
                    }
                    // If no markdown block is found, log the original parsing error and the raw text.
                    console.error("Failed to parse JSON from Gemini API:", jsonError, "Raw text:", textResult);
                    return `Failed to parse structured response: ${jsonError.message}. Raw: ${textResult.substring(0, 100)}...`;
                }
            }
            // If no schema was provided, just return the plain text response.
            return textResult;
        } else {
            // Handle cases where the API call was successful but returned no content.
            console.error("Gemini API response was empty or unexpected:", result);
            return "The API returned an empty or unexpected response.";
        }
    } catch (error) {
        // This catches any network-level errors (e.g., failed to fetch).
        console.error("Error calling Gemini API:", error);
        return `An unexpected error occurred: ${error.message}.`;
    }
}