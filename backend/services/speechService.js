const speech = require("@google-cloud/speech");

class SpeechService {
  constructor() {
    this.client = new speech.SpeechClient();
    this.config = {
      encoding: "WEBM_OPUS",
      sampleRateHertz: 48000,
      languageCode: "en-US",
      enableAutomaticPunctuation: true,
      model: "latest_long",
    };
  }

  async transcribeAudio(audioBuffer) {
    try {
      const audio = {
        content: audioBuffer.toString("base64"),
      };

      const request = {
        audio: audio,
        config: this.config,
      };

      const [response] = await this.client.recognize(request);

      if (response.results && response.results.length > 0) {
        const transcription = response.results
          .map((result) => result.alternatives[0].transcript)
          .join("\n");

        const confidence = response.results[0].alternatives[0].confidence;

        return {
          text: transcription,
          confidence: confidence,
          success: true,
        };
      } else {
        return {
          text: "",
          confidence: 0,
          success: false,
          error: "No speech detected",
        };
      }
    } catch (error) {
      console.error("Speech transcription error:", error);
      return {
        text: "",
        confidence: 0,
        success: false,
        error: error.message,
      };
    }
  }

  async streamTranscribe(audioChunk) {
    try {
      const audio = {
        content: audioChunk.toString("base64"),
      };

      const request = {
        audio: audio,
        config: {
          ...this.config,
          enableInterimResults: true,
          interimResults: true,
        },
      };

      const [response] = await this.client.recognize(request);

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        const alternative = result.alternatives[0];

        return {
          text: alternative.transcript,
          confidence: alternative.confidence,
          isFinal: result.isFinal,
          success: true,
        };
      }

      return {
        text: "",
        confidence: 0,
        isFinal: false,
        success: false,
      };
    } catch (error) {
      console.error("Stream transcription error:", error);
      return {
        text: "",
        confidence: 0,
        isFinal: false,
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new SpeechService();
