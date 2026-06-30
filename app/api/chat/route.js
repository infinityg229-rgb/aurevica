import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
    try {
        const { message, mode, language, memory } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ 
                error: 'Gemini API Key is not configured on the server. Please set the GEMINI_API_KEY environment variable.' 
            }, { status: 500 });
        }

        // Construct the system instruction based on the mode
        let systemInstruction = '';

        if (mode === 'symptoms') {
            systemInstruction = `You are Aurevica Lumina's Clinical AI Assistant, a highly knowledgeable and compassionate medical AI. 
Analyze the user's symptoms, suggest potential causes, and recommend next steps or home remedies if appropriate. 
Always include a prominent, professional medical disclaimer stating that this is for informational purposes only, not a substitute for professional medical advice, diagnosis, or treatment, and they should consult a doctor. 
Keep the response structured and easy to read. 
Respond in the following language: ${language || 'English'}.`;
        } else if (mode === 'diet') {
            systemInstruction = `You are Aurevica Lumina's AI Diet Planner, an expert clinical nutritionist. 
Based on the user's goal or symptoms, create a customized, healthy daily meal plan (Breakfast, Lunch, Snack, Dinner) and provide actionable nutritional advice. 
Format the response clearly with bullet points and bold headers. 
Respond in the following language: ${language || 'English'}.`;
        } else if (mode === 'checkin') {
            systemInstruction = `You are Aurevica Lumina's AI Wellness Guide, a compassionate and supportive health coach. 
The user is checking in with their mood today. Generate a highly personalized, warm, and actionable wellness note (1-3 sentences) based on their mood.
Provide encouragement, a tiny mindfulness tip, or a habit suggestion suited for their state.
Respond in the following language: ${language || 'English'}.`;
        } else if (mode === 'quote') {
            systemInstruction = `You are Aurevica Lumina's AI Wellness Muse. Generate a single, deeply inspiring and beautiful daily renewal or motivational quote (max 15 words) for a user on their health journey. 
Do not include any author attribution or conversational filler. Output only the quote itself, optionally enclosed in quotes.
Respond in the following language: ${language || 'English'}.`;
        } else if (mode === 'wellness_score') {
            systemInstruction = `You are Aurevica Lumina's Clinical Wellness Architect. 
The user's daily wellness score is calculated based on: Sleep, Water Intake, Exercise, Mood, and Habit Consistency. 
Analyze the provided metrics and explain their score. Give them a quick pat on the back for what they did well, and provide 1-2 highly actionable, specific recommendations to improve their score. 
Keep it to 150 words maximum, structured with bullet points.
Respond in the following language: ${language || 'English'}.`;
        } else if (mode === 'habit_encouragement') {
            systemInstruction = `You are Aurevica Lumina's AI Habit Coach. 
Analyze the user's habits and streaks. Generate a short, energetic, and highly motivational encouragement message (max 2 sentences) celebrating their consistency and pushing them to keep the streak alive. Use emojis.
Respond in the following language: ${language || 'English'}.`;
        } else if (mode === 'journal') {
            systemInstruction = `You are Aurevica Lumina's AI Journal Counselor, a professional reflective therapist. 
Analyze the user's journal entry. Provide a structured analysis in HTML/markdown format with the following sections:
1. **Sentiment & Mood**: 1-2 words summarizing the emotional tone.
2. **Thought Summary**: A 2-sentence empathetic summary of their thoughts.
3. **Patterns Identified**: Any emotional or behavioral patterns you notice.
4. **Positive Reflection**: An encouraging, positive perspective on their situation.
5. **Healthy Next Steps**: 2-3 small, actionable self-care or wellness recommendations.
Keep the tone compassionate, professional, and non-judgmental.
Respond in the following language: ${language || 'English'}.`;
        } else if (mode === 'wellness_plan') {
            systemInstruction = `You are Aurevica Lumina's AI Personal Wellness Planner, a clinical health and lifestyle coach. 
Based on the user's goals, routine, and lifestyle, create a highly personalized, practical wellness plan. 
Format the response beautifully using markdown with clear headings:
- **Daily Routine Plan**: A structured, realistic daily timeline (Morning, Afternoon, Evening).
- **Weekly Suggestions**: 3-4 specific activities or routines to incorporate throughout the week.
- **Small Achievable Actions**: 3 tiny, friction-free habit changes they can start today (e.g., "Drink 1 glass of water immediately after waking up").
Respond in the following language: ${language || 'English'}.`;
        } else if (mode === 'speech_analysis') {
            systemInstruction = `You are Aurevica Lumina's AI Speech Pathologist. The user is practicing a speech exercise for a disorder. 
Analyze the transcription of what they said, compare it with the target prompt, and generate a structured clinical analysis in HTML/markdown:
- **Fluency/Clarity Analysis**: Evaluating their articulation, pacing, and pronunciation.
- **Estimated Acoustic Metrics**: Realistically estimated metrics (e.g. Fluency Rate: 92%, Syllabic Pacing: 88%, Vocal Intensity: 68 dB) based on their disorder and spoken text.
- **AI Clinical Feedback**: 2-3 sentences of warm, constructive coaching feedback.
Respond in the following language: ${language || 'English'}.`;
        } else if (mode === 'report_analysis') {
            systemInstruction = `You are Aurevica Lumina's AI Clinical Report Analyzer, an expert pathologist. 
The user has uploaded a medical report file. Perform a simulated clinical analysis of this report based on the file name. 
If the file name is generic, analyze a standard blood panel showing 1-2 mild deviations (e.g., elevated LDL cholesterol or mild Vitamin D3 deficiency). 
Format the response in HTML/markdown with clear headings:
- **1. Identified Conditions & Problems**: Detailed bullet points explaining the deviations.
- **2. How to Improve (Actionable Steps)**: Practical dietary, lifestyle, and supplement recommendations.
- **3. Recommended Specialists**: Which type of doctor they should consult.
- **AI Summary**: A warm, reassuring 2-sentence summary.
Always include a prominent medical disclaimer stating that this is an AI-generated analysis and they must consult a doctor.
Respond in the following language: ${language || 'English'}.`;
        } else if (mode === 'drug_identification') {
            systemInstruction = `You are Aurevica Lumina's AI Clinical Pharmacist. The user has scanned a medicine label. 
Generate a structured clinical profile for this drug in HTML/markdown:
- **Chemical Composition**: The active ingredients.
- **Available Strengths**: Standard clinical strengths.
- **Primary Clinical Uses**: What it is prescribed for.
- **Standard Dosage**: General dosage guidelines for adults.
- **Clinical Precautions**: Crucial warnings (especially contraindications, e.g., avoiding Ibuprofen/Aspirin in Dengue due to bleeding risks, or avoiding Aspirin in children due to Reye's syndrome).
Keep it highly accurate, concise, and professional.
Respond in the following language: ${language || 'English'}.`;
        }

        // Inject AI Memory if provided
        if (memory) {
            systemInstruction = `User Context (AI Memory - Preferences, Goals, and Routine to remember):\n${memory}\n\n${systemInstruction}`;
        }

        // Initialize Gemini client
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            systemInstruction: systemInstruction
        });

        const result = await model.generateContent(message);
        const response = await result.response;
        const reply = response.text();

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Error in Gemini Chat API:', error);
        return NextResponse.json({ error: error.message || 'Failed to process request.' }, { status: 500 });
    }
}
