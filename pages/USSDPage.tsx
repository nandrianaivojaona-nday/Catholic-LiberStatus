import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTranslation } from 'react-i18next';
import { USSDService, USSDResponse } from '../services/USSDService';
import { useNavigate } from 'react-router-dom';

export default function USSDPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const dataContext = useData();

    const [display, setDisplay] = useState<string>(t('ussd.startPrompt'));
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Ensure user is logged in
    useEffect(() => {
        if (!currentUser) {
            navigate('/');
        }
    }, [currentUser, navigate]);
    
    // Cleanup session on component unmount
    useEffect(() => {
        return () => {
            USSDService.endSession();
        };
    }, []);

    // Focus input on every render
    useEffect(() => {
        inputRef.current?.focus();
    }, [display]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        const input = inputValue.trim();
        
        // The service internally manages session state (start, steps, end)
        const response: USSDResponse = USSDService.processRequest(input, currentUser!, dataContext, t);
        
        setDisplay(response.display);
        setInputValue(''); // Clear input after sending

        if (response.sessionEnded) {
            // After a short delay, reset the screen
            setTimeout(() => {
                USSDService.endSession(); // Ensure service state is cleared
                setDisplay(t('ussd.startPrompt'));
            }, 3000);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200 dark:bg-gray-900 p-4">
            <div className="w-full max-w-sm mx-auto">
                <form onSubmit={handleSend}>
                    <div className="bg-gray-800 border-8 border-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="h-8 bg-gray-900 flex justify-center items-center">
                            <div className="w-20 h-4 bg-black rounded-b-lg"></div>
                        </div>
                        <div className="bg-black text-white h-96 p-4 flex flex-col">
                            <pre className="whitespace-pre-wrap text-sm font-mono flex-grow overflow-y-auto">
                                {display}
                            </pre>
                            <div className="mt-4">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="w-full bg-gray-700 text-white rounded-md px-3 py-2 text-sm border-0 focus:ring-2 focus:ring-vatican-gold"
                                    placeholder={t('ussd.general.enterValue')}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="h-16 bg-gray-900 flex justify-center items-center">
                             <button type="submit" className="px-6 py-2 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400">
                                Send
                            </button>
                        </div>
                    </div>
                </form>
                <button 
                  onClick={() => navigate(`/app/${currentUser?.territoryId}`)}
                  className="mt-4 w-full text-center text-swiss-guard-blue dark:text-vatican-gold hover:underline"
                >
                  &larr; Back to App
                </button>
            </div>
        </div>
    );
}
