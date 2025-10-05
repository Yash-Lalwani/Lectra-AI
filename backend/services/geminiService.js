const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async generateNotes(transcript, existingMarkdown = "") {
    try {
      const prompt = `Convert this lecture transcript into concise markdown notes. ${
        existingMarkdown
          ? "Append to existing notes seamlessly."
          : "Create structured notes."
      }

Rules:
- Use # ## ### for hierarchy
- **bold** for key terms
- Bullet points (-) for lists
- Add relevant emojis (📝 💡 🔍)
- NO explanations, ONLY markdown

${existingMarkdown ? `Existing:\n${existingMarkdown}\n\nNew transcript:` : "Transcript:"}
${transcript}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return {
        notes: response.text(),
        success: true,
      };
    } catch (error) {
      console.error("Gemini notes generation error:", error);
      return {
        notes: existingMarkdown, // Return existing content if error
        success: false,
        error: error.message,
      };
    }
  }

  async detectCommand(text) {
    try {
      const prompt = `
        Analyze the following text to detect if it contains any voice commands for a lecture assistant.
        
        Commands to detect:
        - "AI open a new slide" or "create new slide"
        - "AI create a poll" or "create poll question"
        - "AI create a quiz" or "create quiz question"
        - "AI start timer" or "start timer"
        - "AI end lecture" or "end lecture"
        
        Text: "${text}"
        
        Respond with JSON only in this format:
        {
          "hasCommand": boolean,
          "commandType": "slide" | "poll" | "quiz" | "timer" | "end" | null,
          "parameters": {
            "slideTitle": string (if slide command),
            "question": string (if poll/quiz command),
            "options": string[] (if poll/quiz command),
            "timeLimit": number (if quiz command)
          }
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      try {
        const commandData = JSON.parse(response.text());
        return {
          ...commandData,
          success: true,
        };
      } catch (parseError) {
        return {
          hasCommand: false,
          commandType: null,
          parameters: {},
          success: false,
          error: "Failed to parse command response",
        };
      }
    } catch (error) {
      console.error("Gemini command detection error:", error);
      return {
        hasCommand: false,
        commandType: null,
        parameters: {},
        success: false,
        error: error.message,
      };
    }
  }

  async generateSummary(transcript) {
    try {
      const prompt = `
        Create a comprehensive summary of the following lecture transcript.
        Include:
        1. Main topics covered
        2. Key concepts and definitions
        3. Important examples or case studies
        4. Conclusions or takeaways
        
        Transcript: ${transcript}
        
        Format as a well-structured summary with clear sections.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return {
        summary: response.text(),
        success: true,
      };
    } catch (error) {
      console.error("Gemini summary generation error:", error);
      return {
        summary: "",
        success: false,
        error: error.message,
      };
    }
  }

  async generateQuiz(content, numQuestions = 5) {
    try {
      const prompt = `
        Based on the following lecture notes in markdown format, generate ${numQuestions} multiple-choice quiz questions.

        Requirements:
        - Questions should test understanding of key concepts from the notes
        - Each question should have 4 options (A, B, C, D)
        - Only one correct answer per question
        - Questions should be clear and unambiguous
        - Focus on the most important topics covered

        Lecture Notes: ${content}

        IMPORTANT: Respond ONLY with valid JSON. Do not include any markdown code blocks, backticks, or explanatory text.

        Format:
        {
          "questions": [
            {
              "question": "Question text here?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": 0,
              "explanation": "Brief explanation of the correct answer"
            }
          ]
        }

        The correctAnswer field should be the index (0-3) of the correct option.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let responseText = response.text().trim();

      // Clean up response - remove markdown code blocks if present
      responseText = responseText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      try {
        const quizData = JSON.parse(responseText);
        return {
          quiz: quizData,
          success: true,
        };
      } catch (parseError) {
        console.error("Failed to parse quiz JSON:", responseText);
        return {
          quiz: null,
          success: false,
          error: "Failed to parse quiz response: " + parseError.message,
        };
      }
    } catch (error) {
      console.error("Gemini quiz generation error:", error);
      return {
        quiz: null,
        success: false,
        error: error.message,
      };
    }
  }

  async generateQuizQuestions(transcript, numQuestions = 5) {
    try {
      const prompt = `
        Based on the following lecture transcript, generate ${numQuestions} multiple-choice quiz questions.
        
        Requirements:
        - Questions should test understanding of key concepts
        - Each question should have 4 options (A, B, C, D)
        - Only one correct answer per question
        - Questions should be clear and unambiguous
        
        Transcript: ${transcript}
        
        Respond with JSON in this format:
        {
          "questions": [
            {
              "question": "Question text here?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctAnswer": 0,
              "explanation": "Brief explanation of the correct answer"
            }
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      try {
        const quizData = JSON.parse(response.text());
        return {
          questions: quizData.questions,
          success: true,
        };
      } catch (parseError) {
        return {
          questions: [],
          success: false,
          error: "Failed to parse quiz response",
        };
      }
    } catch (error) {
      console.error("Gemini quiz generation error:", error);
      return {
        questions: [],
        success: false,
        error: error.message,
      };
    }
  }

  async extractPollData(text) {
    try {
      const prompt = `
        Extract poll question and options from the following text.
        The teacher is asking a poll question and providing options.
        
        Text: "${text}"
        
        Respond with JSON in this format:
        {
          "question": "The poll question",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "type": "poll"
        }
        
        If no clear poll is detected, return null.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      try {
        const pollData = JSON.parse(response.text());
        return {
          ...pollData,
          success: true,
        };
      } catch (parseError) {
        return {
          question: null,
          options: [],
          type: "poll",
          success: false,
          error: "Failed to parse poll data",
        };
      }
    } catch (error) {
      console.error("Gemini poll extraction error:", error);
      return {
        question: null,
        options: [],
        type: "poll",
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new GeminiService();
