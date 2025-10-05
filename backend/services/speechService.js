const { createClient, LiveTranscriptionEvents } = require("@deepgram/sdk");

class SpeechService {
  constructor() {
    this.deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    this.connections = new Map(); // Store active connections per socket
  }

  // Create a new streaming connection for a socket
  createStreamingConnection(socket, onTranscript) {
    try {
      const connection = this.deepgram.listen.live({
        model: "nova-3",
        language: "en-US",
        punctuate: true,
        smart_format: true,
        encoding: "linear16",
        channels: 1,
        sample_rate: 16000,
        endpointing: 1000,
      });

      // Handle transcript events
      connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        if (data.channel?.alternatives?.[0]?.transcript) {
          const transcript = data.channel.alternatives[0].transcript;
          const confidence = data.channel.alternatives[0].confidence;
          const isFinal = data.is_final;

          console.log("Transcript received:", transcript);

          onTranscript({
            text: transcript,
            confidence: confidence,
            isFinal: isFinal,
            success: true,
          });
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
    console.log(
      "Sending audio to Deepgram - Connection exists:",
      !!connection,
      "Ready state:",
      connection?.getReadyState()
    );

    if (connection && connection.getReadyState() === 1) {
      try {
        connection.send(audioBuffer);
        console.log("Audio sent to Deepgram successfully");
      } catch (error) {
        console.error("Error sending audio to Deepgram:", error);
      }
    } else {
      console.log("Cannot send audio - no connection or connection not ready");
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
      const response = await this.deepgram.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: "nova-3",
          language: "en-US",
          punctuate: true,
          smart_format: true,
        }
      );

      if (
        response.result &&
        response.result.results &&
        response.result.results.channels &&
        response.result.results.channels.length > 0
      ) {
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
