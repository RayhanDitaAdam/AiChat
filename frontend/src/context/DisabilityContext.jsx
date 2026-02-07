import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { X, Accessibility } from 'lucide-react';
import { DisabilityContext } from './DisabilityContext.js';
import { getPublicStores, getProductsByOwner } from '../services/api.js';
import DisabilityOverlay from '../components/DisabilityOverlay.jsx';

export const DisabilityProvider = ({ children }) => {
    const [isDisabilityMode, setIsDisabilityMode] = useState(false);
    const [lastShake, setLastShake] = useState(0);
    const [status, setStatus] = useState('greeting'); // greeting, listening_store, listening_product, result
    const [transcript, setTranscript] = useState('');
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);
    const [productResult, setProductResult] = useState(null);

    const recognitionRef = useRef(null);
    const stateRef = useRef('greeting');

    const speak = useCallback((text, onEnd) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Female'));
        if (preferredVoice) utterance.voice = preferredVoice;
        if (onEnd) utterance.onend = onEnd;
        window.speechSynthesis.speak(utterance);
    }, []);

    const exitDisabilityMode = useCallback(() => {
        setIsDisabilityMode(false);
        window.speechSynthesis.cancel();
        if (recognitionRef.current) recognitionRef.current.stop();
        setStatus('greeting');
        stateRef.current = 'greeting';
        setTranscript('');
        setSelectedStore(null);
        setProductResult(null);
    }, []);

    const searchProduct = useCallback(async (input) => {
        try {
            const data = await getProductsByOwner(selectedStore.id);
            const products = data.products || [];
            const foundProduct = products.find(p => input.includes(p.name.toLowerCase()));

            if (foundProduct) {
                setProductResult(foundProduct);
                stateRef.current = 'result';
                setStatus('result');
                const locationText = `${foundProduct.name} is located at shelf ${foundProduct.rak || 'unknown'} aisle ${foundProduct.aisle || 'unknown'}. You can say another product name to find something else, or say 'akhiri' to end.`;
                speak(locationText);
            } else {
                speak(`I couldn't find ${input} in ${selectedStore.name}. Try asking for something else.`);
            }
        } catch {
            speak("Sorry, I had trouble searching for products. Please try again.");
        }
    }, [selectedStore, speak]);

    const handleVoiceInput = useCallback(async (input) => {
        if (input.includes('akhiri') || input.includes('end') || input.includes('stop')) {
            exitDisabilityMode();
            return;
        }

        switch (stateRef.current) {
            case 'listening_store': {
                const foundStore = stores.find(s => input.includes(s.name.toLowerCase()));
                if (foundStore) {
                    setSelectedStore(foundStore);
                    stateRef.current = 'listening_product';
                    setStatus('listening_product');
                    speak(`Great! You chose ${foundStore.name}. What do you want to find in this store?`);
                } else {
                    speak("Sorry, I didn't catch that store name. Please say one of the store names I mentioned.");
                }
                break;
            }

            case 'listening_product': {
                await searchProduct(input);
                break;
            }

            case 'result': {
                stateRef.current = 'listening_product';
                setStatus('listening_product');
                await searchProduct(input);
                break;
            }
        }
    }, [stores, exitDisabilityMode, speak, searchProduct]);

    const startRecognition = useCallback(() => {
        if (recognitionRef.current) recognitionRef.current.stop();

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
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
            if (isDisabilityMode) {
                try {
                    recognition.start();
                } catch {
                    // Ignore start errors on end
                }
            }
        };

        recognition.start();
        recognitionRef.current = recognition;
    }, [isDisabilityMode, handleVoiceInput]);

    const triggerGreeting = useCallback(async () => {
        setIsDisabilityMode(true);
        setStatus('greeting');
        stateRef.current = 'greeting';

        try {
            const data = await getPublicStores();
            const publicStores = data.stores || [];
            setStores(publicStores);

            const storeNames = publicStores.map(s => s.name).join(', ');
            const text = `Hello! You are now in disability mode. Which store do you want to go to? Available stores are: ${storeNames}. Please speak the store name to continue.`;

            speak(text, () => {
                stateRef.current = 'listening_store';
                setStatus('listening_store');
                startRecognition();
            });
        } catch {
            speak("Welcome. I'm having trouble loading the stores right now. Please try shaking your phone again later.");
        }
    }, [speak, startRecognition]);

    // Shake Detection logic
    useEffect(() => {
        let lastX, lastY, lastZ;
        const threshold = 15;

        const handleMotion = (event) => {
            const acceleration = event.accelerationIncludingGravity;
            if (!acceleration) return;

            const { x, y, z } = acceleration;
            if (lastX !== undefined) {
                const deltaX = Math.abs(lastX - x);
                const deltaY = Math.abs(lastY - y);
                const deltaZ = Math.abs(lastZ - z);

                if ((deltaX > threshold && deltaY > threshold) || (deltaX > threshold && deltaZ > threshold) || (deltaY > threshold && deltaZ > threshold)) {
                    const now = Date.now();
                    if (now - lastShake > 5000) {
                        setLastShake(now);
                        if (!isDisabilityMode) {
                            triggerGreeting();
                        }
                    }
                }
            }

            lastX = x; lastY = y; lastZ = z;
        };

        window.addEventListener('devicemotion', handleMotion);
        return () => window.removeEventListener('devicemotion', handleMotion);
    }, [isDisabilityMode, lastShake, triggerGreeting]);

    return (
        <DisabilityContext.Provider value={{ isDisabilityMode, setIsDisabilityMode, triggerGreeting, speak }}>
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
