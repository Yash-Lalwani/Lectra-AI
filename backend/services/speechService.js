const { createClient, LiveTranscriptionEvents } = require("@deepgram/sdk");
class SpeechService {
  constructor() {
    this.deepgram = null;
    this.connections = new Map(); // Store active connections per socket
  }

  // Lazy-initialize Deepgram client so missing env vars can be handled gracefully
  _getClient() {
    if (this.deepgram) return this.deepgram;

    const key = process.env.DEEPGRAM_API_KEY;
    if (!key) {
      // Throw a more actionable error so it's clear how to fix it
      throw new Error(
        "Deepgram API key not set. Please add DEEPGRAM_API_KEY to your environment or .env (copy root .env into backend/.env or set in your shell)."
      );
    }

    this.deepgram = createClient(key);
    return this.deepgram;
  }

  // Create a new streaming connection for a socket
  createStreamingConnection(socket, onTranscript) {
    try {
      const client = this._getClient();
      const connection = client.listen.live({
        model: "nova-3",
        language: "en-US",
        punctuate: true,
        smart_format: true,
        encoding: "linear16",
        channels: 1,
        sample_rate: 16000,
        endpointing: 500, // Reduced from 1000ms to 500ms for faster finalization
        interim_results: true, // Explicitly enable interim results
      });

      // Handle transcript events
      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        if (data.channel?.alternatives?.[0]?.transcript) {
          const transcript = data.channel.alternatives[0].transcript;
          const confidence = data.channel.alternatives[0].confidence;
          const isFinal = data.is_final;

          console.log("🎙️ Deepgram Transcript:", {
            text: transcript,
            isFinal: isFinal,
            confidence: confidence,
            socketId: socket.id
          });

          onTranscript({
            text: transcript,
            confidence: confidence,
            isFinal: isFinal,
            success: true,
          });
        } else {
          console.log("⚠️ Deepgram data but no transcript:", data);
        }
      });

      // Handle errors
      connection.on(LiveTranscriptionEvents.Error, (error) => {
        console.error("Deepgram streaming error:", error);
        onTranscript({
          text: "",
          confidence: 0,
          isFinal: false,
          success: false,
          error: error.message,
        });
      });

      // Handle connection close
      connection.on(LiveTranscriptionEvents.Close, () => {
        this.connections.delete(socket.id);
      });

      // Handle connection open
      connection.on(LiveTranscriptionEvents.Open, () => {
        console.log("Deepgram connection opened for", socket.user.email);
      });

      // Store connection
      this.connections.set(socket.id, connection);

      // Send a small amount of silence to keep connection alive
      setTimeout(() => {
        if (this.connections.has(socket.id)) {
          const silence = new Int16Array(1024).buffer;
          connection.send(silence);
        }
      }, 100);

      return connection;
    } catch (error) {
      console.error("Failed to create streaming connection:", error);
      throw error;
    }
  }

  // Send audio data to streaming connection
  sendAudio(socket, audioBuffer) {
    const connection = this.connections.get(socket.id);

    if (connection && connection.getReadyState() === 1) {
      try {
        connection.send(audioBuffer);
        // Less verbose logging - only log occasionally
        if (Math.random() < 0.01) { // Log ~1% of audio chunks
          console.log("🔊 Audio streaming to Deepgram, buffer size:", audioBuffer.byteLength);
        }
      } catch (error) {
        console.error("❌ Error sending audio to Deepgram:", error);
      }
    } else {
      console.log("❌ Cannot send audio - Connection state:", connection?.getReadyState());
    }
  }

  // Close streaming connection
  closeConnection(socket) {
    const connection = this.connections.get(socket.id);
    if (connection) {
      connection.finish();
      this.connections.delete(socket.id);
      console.log("Deepgram connection closed for", socket.user.email);
    }
  }

  // Legacy method for compatibility (not used in streaming)
  async transcribeAudio(audioBuffer) {
    try {
      const client = this._getClient();
      const response = await client.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: "nova-3",
          language: "en-US",
          punctuate: true,
          smart_format: true,
        }
      );

      if (response?.result?.results?.channels?.length > 0) {
        const channel = response.result.results.channels[0];
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
}

module.exports = new SpeechService();
