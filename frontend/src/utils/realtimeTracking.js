import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Creates a Realtime Tracking Publisher (Worker / Partner side)
 * Emits ephemeral GPS telemetry directly over WebSockets without database bloat.
 * 
 * @param {string|number} bookingId
 * @param {Function} [onStatusChange]
 * @returns {{ broadcastPosition: Function, broadcastStatus: Function, startGpsWatch: Function, stop: Function }}
 */
export function createTrackingPublisher(bookingId, onStatusChange) {
  if (!isSupabaseConfigured() || !supabase || !bookingId) {
    return {
      broadcastPosition: () => {},
      broadcastStatus: () => {},
      startGpsWatch: () => () => {},
      stop: () => {},
    };
  }

  const channelName = `tracking:${bookingId}`;
  const channel = supabase.channel(channelName, {
    config: {
      broadcast: { self: false },
    },
  });

  let watchId = null;
  let lastBroadcast = 0;
  const MIN_INTERVAL_MS = 1500; // Throttle to max 1 update per 1.5s to preserve bandwidth & battery

  channel.subscribe((status) => {
    if (onStatusChange) onStatusChange(status);
  });

  const broadcastPosition = ({ lat, lng, heading = 0, speed = 0, eta_remaining_min = null }) => {
    const now = Date.now();
    if (now - lastBroadcast < MIN_INTERVAL_MS) return;
    lastBroadcast = now;

    channel.send({
      type: 'broadcast',
      event: 'pos_update',
      payload: {
        lat,
        lng,
        heading,
        speed,
        eta_remaining_min,
        timestamp: now,
      },
    });
  };

  const broadcastStatus = (statusPayload) => {
    channel.send({
      type: 'broadcast',
      event: 'status_update',
      payload: statusPayload,
    });
  };

  const startGpsWatch = ({ onLocalPos } = {}) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return () => {};
    }

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, heading, speed } = pos.coords;
        if (onLocalPos) {
          onLocalPos({ lat: latitude, lng: longitude });
        }
        broadcastPosition({
          lat: latitude,
          lng: longitude,
          heading: heading || 0,
          speed: speed || 0,
        });
      },
      (err) => console.warn('GPS Watch warning:', err.message),
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      }
    );

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    };
  };

  const stop = () => {
    if (watchId !== null && typeof navigator !== 'undefined') {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    try {
      supabase.removeChannel(channel);
    } catch {
      // ignore
    }
  };

  return {
    channel,
    broadcastPosition,
    broadcastStatus,
    startGpsWatch,
    stop,
  };
}

/**
 * Subscribes to live Realtime Tracking updates (Customer side)
 * Receives <50ms WebSocket telemetry for silky-smooth map tracking.
 * 
 * @param {string|number} bookingId
 * @param {Object} callbacks
 * @param {Function} [callbacks.onPositionUpdate]
 * @param {Function} [callbacks.onStatusUpdate]
 * @param {Function} [callbacks.onConnectionChange]
 * @returns {{ channel: any, unsubscribe: Function }}
 */
export function subscribeToRealtimeTracking(bookingId, { onPositionUpdate, onStatusUpdate, onConnectionChange }) {
  if (!isSupabaseConfigured() || !supabase || !bookingId) {
    return { unsubscribe: () => {} };
  }

  const channelName = `tracking:${bookingId}`;
  const channel = supabase.channel(channelName);

  channel
    .on('broadcast', { event: 'pos_update' }, ({ payload }) => {
      if (onPositionUpdate) onPositionUpdate(payload);
    })
    .on('broadcast', { event: 'status_update' }, ({ payload }) => {
      if (onStatusUpdate) onStatusUpdate(payload);
    })
    .subscribe((status) => {
      if (onConnectionChange) onConnectionChange(status);
    });

  return {
    channel,
    unsubscribe: () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        // ignore
      }
    },
  };
}
