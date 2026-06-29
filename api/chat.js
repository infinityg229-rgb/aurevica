// api/chat.js
// Vercel Serverless Function to securely call the Gemini API

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, mode, language } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ 
            error: 'Gemini API Key is not configured on the server. Please set the GEMINI_API_KEY environment variable.' 
        });
    }

    // Construct the prompt based on the mode
    let systemPrompt = '';
    if (mode === 'symptoms') {
        systemPrompt = `You are Aurevica Lumina's Clinical AI Assistant, a highly knowledgeable and compassionate medical AI. 
Analyze the user's symptoms, suggest potential causes, and recommend next steps or home remedies if appropriate. 
Always include a prominent, professional medical disclaimer stating that this is for informational purposes only, not a substitute for professional medical advice, diagnosis, or treatment, and they should consult a doctor. 
Keep the response structured and easy to read. 
Respond in the following language: ${language}.`;
    } else {
        systemPrompt = `You are Aurevica Lumina's AI Diet Planner, an expert clinical nutritionist. 
Based on the user's goal or symptoms, create a customized, healthy daily meal plan (Breakfast, Lunch, Snack, Dinner) and provide actionable nutritional advice. 
Format the response clearly with bullet points and bold headers. 
Respond in the following language: ${language}.`;
    }

    const prompt = `${systemPrompt}\n\nUser Query: ${message}`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            return res.status(response.status).json({ 
                error: errData.error?.message || 'Error from Gemini API' 
            });
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';
        
        return res.status(200).json({ reply });
    } catch (error) {
        console.error('Error in chat handler:', error);
        return res.status(500).json({ error: 'Failed to process request. Please try again.' });
    }
}
