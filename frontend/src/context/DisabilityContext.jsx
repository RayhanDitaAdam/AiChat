import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DisabilityContext } from './DisabilityContext.js';
import { getPublicStores, getProductsByOwner } from '../services/api.js';
import DisabilityOverlay from '../components/DisabilityOverlay.jsx';

export const DisabilityProvider = ({ children }) => {
    const [isDisabilityMode, setIsDisabilityMode] = useState(false);
    const [status, setStatus] = useState('greeting'); // greeting, listening_store, listening_product, loading, result, not_found
    const [transcript, setTranscript] = useState('');
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [productResult, setProductResult] = useState(null);

    const recognitionRef = useRef(null);
    const stateRef = useRef('greeting');
    const shakeStartRef = useRef(null); // timestamp when shake started
    const shakingRef = useRef(false);   // is currently shaking
    const shakeTimeoutRef = useRef(null);

    // ─── TTS (Indonesian) ────────────────────────────────────────────────────
    const speak = useCallback((text, onEnd) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;

        // Prefer Indonesian voice if available
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            const idVoice = voices.find(v => v.lang === 'id-ID' || v.lang.startsWith('id'));
            const googleVoice = voices.find(v => v.name.toLowerCase().includes('google'));
            if (idVoice) utterance.voice = idVoice;
            else if (googleVoice) utterance.voice = googleVoice;
        };

        if (window.speechSynthesis.getVoices().length > 0) {
            loadVoices();
        } else {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        if (onEnd) utterance.onend = onEnd;
        window.speechSynthesis.speak(utterance);
    }, []);

    // ─── Exit ────────────────────────────────────────────────────────────────
    const exitDisabilityMode = useCallback(() => {
        setIsDisabilityMode(false);
        window.speechSynthesis?.cancel();
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { console.warn('Recognition stop:', e); }
        }
        setStatus('greeting');
        stateRef.current = 'greeting';
        setTranscript('');
        setSelectedStore(null);
        setProductResult(null);
    }, []);

    // ─── Product Search ───────────────────────────────────────────────────────
    const searchProduct = useCallback(async (input) => {
        if (!selectedStore) return;

        stateRef.current = 'loading';
        setStatus('loading');
        speak('Sebentar ya, saya carikan dulu...');

        try {
            const data = await getProductsByOwner(selectedStore.id);
            const products = data.products || [];

            // Fuzzy match: check if any word in input matches product name
            const inputWords = input.toLowerCase().split(/\s+/);
            const foundProduct = products.find(p => {
                const productName = p.name.toLowerCase();
                return inputWords.some(word => word.length > 2 && productName.includes(word));
            });

            if (foundProduct) {
                setProductResult(foundProduct);
                stateRef.current = 'result';
                setStatus('result');
                const rak = foundProduct.rak || 'tidak diketahui';
                const aisle = foundProduct.aisle || 'tidak diketahui';
                const price = foundProduct.price
                    ? `Harganya ${foundProduct.price.toLocaleString('id-ID')} rupiah.`
                    : '';
                speak(
                    `Oh, ${foundProduct.name} ada di rak ${rak}, lorong ${aisle}. ${price} Mau cari barang lain? Sebutkan saja namanya.`
                );
            } else {
                stateRef.current = 'not_found';
                setStatus('not_found');
                speak(
                    `Mohon maaf, ${input} tidak ditemukan di ${selectedStore.name}. Mau coba cari barang lain?`,
                    () => {
                        stateRef.current = 'listening_product';
                        setStatus('listening_product');
                    }
                );
            }
        } catch {
            stateRef.current = 'listening_product';
            setStatus('listening_product');
            speak('Maaf, terjadi kesalahan saat mencari. Coba sebutkan lagi.');
        }
    }, [selectedStore, speak]);

    // ─── Voice Input Handler ──────────────────────────────────────────────────
    const handleVoiceInput = useCallback(async (input) => {
        const exitWords = ['akhiri', 'selesai', 'keluar', 'stop', 'end', 'berhenti'];
        if (exitWords.some(w => input.includes(w))) {
            speak('Baik, sampai jumpa!', () => exitDisabilityMode());
            return;
        }

        const currentState = stateRef.current;

        if (currentState === 'listening_store') {
            const foundStore = stores.find(s =>
                input.includes(s.name.toLowerCase()) ||
                s.name.toLowerCase().split(/\s+/).some(word => word.length > 2 && input.includes(word))
            );
            if (foundStore) {
                setSelectedStore(foundStore);
                stateRef.current = 'listening_product';
                setStatus('listening_product');
                speak(`Oke! Kamu memilih ${foundStore.name}. Kamu mau mencari apa?`);
            } else {
                speak('Maaf, saya tidak mengenali nama toko itu. Coba sebutkan lagi nama tokonya.');
            }

        } else if (currentState === 'listening_product' || currentState === 'result' || currentState === 'not_found') {
            await searchProduct(input);
        }
    }, [stores, exitDisabilityMode, speak, searchProduct]);

    // ─── Speech Recognition ───────────────────────────────────────────────────
    const startRecognition = useCallback(() => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { console.warn('Recognition stop:', e); }
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            speak('Maaf, browser ini tidak mendukung pengenalan suara.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const resultTranscript = event.results[current][0].transcript.toLowerCase();
            setTranscript(resultTranscript);

            if (event.results[current].isFinal) {
                handleVoiceInput(resultTranscript);
            }
        };

        recognition.onend = () => {
            // Auto-restart if still in disability mode and not loading
            if (stateRef.current !== 'greeting' && stateRef.current !== 'loading') {
                try { recognition.start(); } catch (e) {
                    console.warn('Recognition restart error:', e);
                }
            }
        };

        recognition.onerror = (e) => {
            if (e.error !== 'aborted' && e.error !== 'no-speech') {
                console.warn('Speech recognition error:', e.error);
            }
        };

        recognition.start();
        recognitionRef.current = recognition;
    }, [handleVoiceInput, speak]);

    // ─── Trigger Greeting ─────────────────────────────────────────────────────
    const triggerGreeting = useCallback(async () => {
        setIsDisabilityMode(true);
        setStatus('greeting');
        stateRef.current = 'greeting';
        setTranscript('');
        setSelectedStore(null);
        setProductResult(null);

        try {
            const data = await getPublicStores();
            const publicStores = data.stores || [];
            setStores(publicStores);

            if (publicStores.length === 0) {
                speak('Halo! Selamat datang di mode disabilitas. Maaf, belum ada toko yang tersedia saat ini.');
                return;
            }

            const storeNames = publicStores.map(s => s.name).join(', ');
            const greeting = `Halo! Kamu mau mencari apa? Toko yang tersedia adalah: ${storeNames}. Sebutkan nama toko yang ingin kamu kunjungi.`;

            speak(greeting, () => {
                stateRef.current = 'listening_store';
                setStatus('listening_store');
                startRecognition();
            });
        } catch {
            speak('Halo! Selamat datang. Maaf, saya sedang kesulitan memuat data toko. Coba goyangkan lagi nanti.');
        }
    }, [speak, startRecognition]);

    // ─── 5-Second Sustained Shake Detection ──────────────────────────────────
    useEffect(() => {
        let lastX, lastY, lastZ;
        const SHAKE_THRESHOLD = 15;
        const SHAKE_DURATION_MS = 5000; // 5 seconds of sustained shaking

        const handleMotion = (event) => {
            if (isDisabilityMode) return; // Already active, ignore

            const acceleration = event.accelerationIncludingGravity;
            if (!acceleration) return;

            const { x, y, z } = acceleration;
            if (lastX === undefined) {
                lastX = x; lastY = y; lastZ = z;
                return;
            }

            const deltaX = Math.abs(lastX - x);
            const deltaY = Math.abs(lastY - y);
            const deltaZ = Math.abs(lastZ - z);
            lastX = x; lastY = y; lastZ = z;

            const isShaking = (
                (deltaX > SHAKE_THRESHOLD && deltaY > SHAKE_THRESHOLD) ||
                (deltaX > SHAKE_THRESHOLD && deltaZ > SHAKE_THRESHOLD) ||
                (deltaY > SHAKE_THRESHOLD && deltaZ > SHAKE_THRESHOLD)
            );

            if (isShaking) {
                if (!shakingRef.current) {
                    // Shake just started
                    shakingRef.current = true;
                    shakeStartRef.current = Date.now();
                }

                // Clear any existing "shake stopped" timeout
                if (shakeTimeoutRef.current) {
                    clearTimeout(shakeTimeoutRef.current);
                }

                // Check if shaking for 5+ seconds
                const elapsed = Date.now() - shakeStartRef.current;
                if (elapsed >= SHAKE_DURATION_MS) {
                    shakingRef.current = false;
                    shakeStartRef.current = null;
                    triggerGreeting();
                }

                // Set timeout to detect when shaking stops
                shakeTimeoutRef.current = setTimeout(() => {
                    shakingRef.current = false;
                    shakeStartRef.current = null;
                }, 800); // Reset if no shake for 800ms

            }
        };

        window.addEventListener('devicemotion', handleMotion);
        return () => {
            window.removeEventListener('devicemotion', handleMotion);
            if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
        };
    }, [isDisabilityMode, triggerGreeting]);

    return (
        <DisabilityContext.Provider value={{ isDisabilityMode, setIsDisabilityMode, triggerGreeting, speak, exitDisabilityMode }}>
            {children}
            <DisabilityOverlay
                isActive={isDisabilityMode}
                onClose={exitDisabilityMode}
                status={status}
                transcript={transcript}
                stores={stores}
                selectedStore={selectedStore}
                productResult={productResult}
            />
        </DisabilityContext.Provider>
    );
};
