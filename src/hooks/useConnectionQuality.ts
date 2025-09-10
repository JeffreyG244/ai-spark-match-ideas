import { useState, useEffect, useRef } from 'react';

export interface ConnectionStats {
  bandwidth: number;
  rtt: number;
  jitter: number;
  packetsLost: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  isStable: boolean;
}

export const useConnectionQuality = (peerConnection: RTCPeerConnection | null) => {
  const [stats, setStats] = useState<ConnectionStats>({
    bandwidth: 0,
    rtt: 0,
    jitter: 0,
    packetsLost: 0,
    quality: 'excellent',
    isStable: true
  });
  
  const statsIntervalRef = useRef<NodeJS.Timeout>();
  const previousStats = useRef<any>(null);

  // Calculate connection quality
  const calculateQuality = (rtt: number, jitter: number, packetsLost: number): ConnectionStats['quality'] => {
    if (rtt < 150 && jitter < 30 && packetsLost < 1) return 'excellent';
    if (rtt < 300 && jitter < 50 && packetsLost < 3) return 'good';
    if (rtt < 500 && jitter < 100 && packetsLost < 5) return 'fair';
    return 'poor';
  };

  // Monitor connection stats
  useEffect(() => {
    if (!peerConnection || peerConnection.connectionState !== 'connected') {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
      return;
    }

    const monitorStats = async () => {
      try {
        const reports = await peerConnection.getStats();
        let inboundStats: any = null;
        let outboundStats: any = null;
        let candidatePairStats: any = null;

        reports.forEach((report: any) => {
          if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
            inboundStats = report;
          } else if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
            outboundStats = report;
          } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            candidatePairStats = report;
          }
        });

        if (inboundStats && candidatePairStats) {
          const currentTime = Date.now();
          
          let bandwidth = 0;
          let rtt = candidatePairStats.currentRoundTripTime * 1000 || 0;
          let jitter = inboundStats.jitter * 1000 || 0;
          let packetsLost = inboundStats.packetsLost || 0;

          // Calculate bandwidth if we have previous stats
          if (previousStats.current && inboundStats.bytesReceived) {
            const timeDiff = (currentTime - previousStats.current.timestamp) / 1000;
            const bytesDiff = inboundStats.bytesReceived - previousStats.current.bytesReceived;
            bandwidth = Math.round((bytesDiff * 8) / timeDiff / 1000); // kbps
          }

          const quality = calculateQuality(rtt, jitter, packetsLost);
          const isStable = quality !== 'poor' && rtt < 400;

          setStats({
            bandwidth,
            rtt: Math.round(rtt),
            jitter: Math.round(jitter),
            packetsLost,
            quality,
            isStable
          });

          previousStats.current = {
            bytesReceived: inboundStats.bytesReceived,
            timestamp: currentTime
          };
        }
      } catch (error) {
        console.warn('Error monitoring connection stats:', error);
      }
    };

    // Monitor every 2 seconds
    statsIntervalRef.current = setInterval(monitorStats, 2000);

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, [peerConnection]);

  return stats;
};