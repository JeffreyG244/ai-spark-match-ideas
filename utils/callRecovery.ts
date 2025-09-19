export class CallRecoveryManager {
  private retryAttempts = 0;
  private maxRetries = 3;
  private retryDelay = 1000;
  private isRecovering = false;

  constructor(
    private peerConnection: RTCPeerConnection,
    private signalChannel: any,
    private localStream: MediaStream,
    private onRecoveryStart: () => void,
    private onRecoveryEnd: (success: boolean) => void
  ) {}

  // Attempt to recover a failed connection
  async attemptRecovery(): Promise<boolean> {
    if (this.isRecovering || this.retryAttempts >= this.maxRetries) {
      return false;
    }

    this.isRecovering = true;
    this.retryAttempts++;
    this.onRecoveryStart();

    console.log(`Attempting call recovery (attempt ${this.retryAttempts}/${this.maxRetries})`);

    try {
      // Wait before retry
      await this.delay(this.retryDelay * this.retryAttempts);

      // Check if connection is still needed
      if (this.peerConnection.connectionState === 'closed') {
        this.isRecovering = false;
        this.onRecoveryEnd(false);
        return false;
      }

      // Restart ICE gathering
      await this.restartIce();

      // Wait for connection to stabilize
      const connected = await this.waitForConnection(10000);
      
      this.isRecovering = false;
      this.onRecoveryEnd(connected);
      
      if (connected) {
        console.log('Call recovery successful');
        this.retryAttempts = 0;
      } else {
        console.log('Call recovery failed');
      }

      return connected;
    } catch (error) {
      console.error('Error during call recovery:', error);
      this.isRecovering = false;
      this.onRecoveryEnd(false);
      return false;
    }
  }

  // Restart ICE to re-establish connection
  private async restartIce(): Promise<void> {
    try {
      // Create new offer with ice restart
      const offer = await this.peerConnection.createOffer({ iceRestart: true });
      await this.peerConnection.setLocalDescription(offer);

      // Send the restart offer through signaling
      this.signalChannel.send({
        type: 'broadcast',
        event: 'ice-restart-offer',
        payload: { offer }
      });
    } catch (error) {
      console.error('Error restarting ICE:', error);
      throw error;
    }
  }

  // Wait for connection to be established
  private waitForConnection(timeout: number): Promise<boolean> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkConnection = () => {
        if (this.peerConnection.connectionState === 'connected') {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          resolve(false);
        } else if (['failed', 'closed'].includes(this.peerConnection.connectionState)) {
          resolve(false);
        } else {
          setTimeout(checkConnection, 500);
        }
      };

      checkConnection();
    });
  }

  // Utility delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Reset retry attempts
  resetRetries(): void {
    this.retryAttempts = 0;
  }

  // Check if currently recovering
  isCurrentlyRecovering(): boolean {
    return this.isRecovering;
  }

  // Get current retry attempt
  getCurrentRetryAttempt(): number {
    return this.retryAttempts;
  }
}

// Network quality checker
export class NetworkQualityChecker {
  private static async checkNetworkLatency(): Promise<number> {
    const start = performance.now();
    
    try {
      await fetch('/api/ping', { method: 'HEAD' });
      return performance.now() - start;
    } catch {
      // Fallback: use STUN server for latency check
      return await this.checkStunLatency();
    }
  }

  private static async checkStunLatency(): Promise<number> {
    return new Promise((resolve) => {
      const start = performance.now();
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      pc.onicecandidate = () => {
        pc.close();
        resolve(performance.now() - start);
      };

      pc.createDataChannel('test');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
      
      // Timeout after 5 seconds
      setTimeout(() => {
        pc.close();
        resolve(5000);
      }, 5000);
    });
  }

  static async assessNetworkQuality(): Promise<{
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    latency: number;
    recommendation: string;
  }> {
    const latency = await this.checkNetworkLatency();
    
    let quality: 'excellent' | 'good' | 'fair' | 'poor';
    let recommendation: string;

    if (latency < 100) {
      quality = 'excellent';
      recommendation = 'Network conditions are optimal for video calling';
    } else if (latency < 200) {
      quality = 'good';
      recommendation = 'Good network conditions for video calling';
    } else if (latency < 400) {
      quality = 'fair';
      recommendation = 'Consider using audio-only mode for better quality';
    } else {
      quality = 'poor';
      recommendation = 'Poor network conditions. Audio calls recommended.';
    }

    return { quality, latency: Math.round(latency), recommendation };
  }
}