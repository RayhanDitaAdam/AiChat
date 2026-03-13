import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useShake hook for mobile browsers
 * @param {Function} onShake Callback when shake is detected
 * @param {Object} options Configuration options
 * @param {number} options.threshold Shake sensitivity (default: 15)
 * @param {number} options.interval Minimum time between shakes (default: 1000ms)
 */
const useShake = (onShake, options = {}) => {
    const { threshold = 15, interval = 1000 } = options;
    const [isSupported] = useState(() => {
        return typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
    });
    const [hasPermission, setHasPermission] = useState(() => {
        if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
            // If requestPermission doesn't exist, we assume permission is granted by default (Android/Old browsers)
            return typeof DeviceMotionEvent.requestPermission !== 'function';
        }
        return false;
    });
    const lastUpdateTime = useRef(0);
    const lastX = useRef(null);
    const lastY = useRef(null);
    const lastZ = useRef(null);
    const lastShakeTime = useRef(0);

    const requestPermission = useCallback(async () => {
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const response = await DeviceMotionEvent.requestPermission();
                if (response === 'granted') {
                    setHasPermission(true);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('DeviceMotion permission request failed:', error);
                return false;
            }
        } else {
            // Android or non-iOS browsers usually don't need explicit requestPermission
            setHasPermission(true);
            return true;
        }
    }, []);

    useEffect(() => {
        if (!hasPermission) return;

        const handleMotion = (event) => {
            const currentTime = Date.now();
            const timeDiff = currentTime - lastUpdateTime.current;

            // Limit processing frequency
            if (timeDiff > 100) {
                const { x, y, z } = event.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };

                if (lastX.current !== null) {
                    const deltaX = Math.abs(x - lastX.current);
                    const deltaY = Math.abs(y - lastY.current);
                    const deltaZ = Math.abs(z - lastZ.current);

                    // Threshold check
                    if (((deltaX > threshold && deltaY > threshold) ||
                        (deltaX > threshold && deltaZ > threshold) ||
                        (deltaY > threshold && deltaZ > threshold)) &&
                        (currentTime - lastShakeTime.current > interval)) {

                        lastShakeTime.current = currentTime;
                        if (onShake) onShake();
                    }
                }

                lastX.current = x;
                lastY.current = y;
                lastZ.current = z;
                lastUpdateTime.current = currentTime;
            }
        };

        window.addEventListener('devicemotion', handleMotion);
        return () => window.removeEventListener('devicemotion', handleMotion);
    }, [hasPermission, onShake, threshold, interval]);

    return { isSupported, hasPermission, requestPermission };
};

export default useShake;
