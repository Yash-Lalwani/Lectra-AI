const { createClient } = require("@deepgram/sdk");

class SpeechService {
  constructor() {
    this.deepgram = createClient(process.env.DEEPGRAM_API_KEY);
  }

  async transcribeAudio(audioBuffer) {
    try {
      const response = await this.deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: "nova-2",
          language: "en-US",
          punctuate: true,
          paragraphs: true,
          smart_format: true,
        }
      );

      if (
        response.results &&
        response.results.channels &&
        response.results.channels.length > 0
      ) {
        const channel = response.results.channels[0];
        if (channel.alternatives && channel.alternatives.length > 0) {
          const alternative = channel.alternatives[0];

          return {
            text: alternative.transcript,
            confidence: alternative.confidence,
            success: true,
          };
        }
      }

      return {
        text: "",
        confidence: 0,
        success: false,
        error: "No speech detected",
      };
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
      const response = await this.deepgram.listen.prerecorded.transcribeFile(
        audioChunk,
        {
          model: "nova-2",
          language: "en-US",
          punctuate: true,
          paragraphs: true,
          smart_format: true,
          interim_results: true,
        }
      );

      if (
        response.results &&
        response.results.channels &&
        response.results.channels.length > 0
      ) {
        const channel = response.results.channels[0];
        if (channel.alternatives && channel.alternatives.length > 0) {
          const alternative = channel.alternatives[0];

          return {
            text: alternative.transcript,
            confidence: alternative.confidence,
            isFinal: response.results.is_final,
            success: true,
          };
        }
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
