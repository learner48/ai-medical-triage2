import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface AIResponse {
  message: string;
  urgencyLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendation?: string;
  followUpQuestions?: string[];
}

export async function processUserMessage(
  message: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<AIResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an AI Medical Triage Assistant helping to assess patient symptoms and determine urgency levels. 
          You should:
          1. Ask relevant follow-up questions to understand the symptoms better
          2. Assess urgency level (low, moderate, high, critical)
          3. Provide clear, concise responses
          4. Be empathetic but professional
          5. Immediately identify critical symptoms that require emergency care
          6. Only provide factual medical information
          7. Always maintain HIPAA compliance
          8. Communicate in English only`
        },
        ...conversationHistory,
        { role: "user", content: message }
      ],
      functions: [
        {
          name: "processTriageResponse",
          description: "Process the triage response and determine urgency level",
          parameters: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "The response message to the patient"
              },
              urgencyLevel: {
                type: "string",
                enum: ["low", "moderate", "high", "critical"],
                description: "The assessed urgency level based on symptoms"
              },
              recommendation: {
                type: "string",
                description: "Specific recommendation based on symptoms"
              },
              followUpQuestions: {
                type: "array",
                items: { type: "string" },
                description: "Follow-up questions to better understand symptoms"
              }
            },
            required: ["message", "urgencyLevel"]
          }
        }
      ],
      function_call: { name: "processTriageResponse" }
    });

    const functionCall = completion.choices[0].message.function_call;
    if (!functionCall?.arguments) {
      throw new Error('No function call arguments received');
    }

    return JSON.parse(functionCall.arguments) as AIResponse;
  } catch (error) {
    console.error('Error processing message with AI:', error);
    throw error;
  }
}