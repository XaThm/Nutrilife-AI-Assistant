import { useState, useEffect, useCallback } from 'react';
import type { HistoryData, ProductHistoryItem, OverhaulHistoryItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';

const MAX_HISTORY_ITEMS = 50; // A sane limit to prevent huge documents

export const useHistory = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<HistoryData>({ products: [], overhauls: [] });
    const isHistoryEnabled = !!user;

    useEffect(() => {
        // This effect listens for changes in the user object.
        // If a user logs in, it fetches their history from Firestore.
        // If they log out, it clears the local history state.
        async function fetchHistory() {
            if (user) {
                const userDocRef = db.collection('users').doc(user.uid);
                try {
                    const docSnap = await userDocRef.get();
                    if (docSnap.exists) {
                        const data = docSnap.data();
                        setHistory(data?.history || { products: [], overhauls: [] });
                    }
                } catch (error) {
                    console.error("Firestore read failed for user history:", error);
                }
            } else {
                setHistory({ products: [], overhauls: [] }); // Clear history on logout
            }
        };

        fetchHistory();
    }, [user]);

    // A helper function to avoid duplicating the Firestore update logic.
    const syncHistoryToDb = async (newHistory: HistoryData) => {
        if (!user) {
            console.log("No user, skipping DB sync.");
            return;
        }
        const userDocRef = db.collection('users').doc(user.uid);
        try {
            await userDocRef.set({ history: newHistory }, { merge: true });
        } catch (error) {
            console.error("Firestore update failed:", error.toString());
        }
    };

    const addProductToHistory = useCallback((item: ProductHistoryItem) => {
        if (!isHistoryEnabled) return;
        
        setHistory(prevHistory => {
            const newHistory = {
                ...prevHistory,
                products: [item, ...prevHistory.products].slice(0, MAX_HISTORY_ITEMS)
            };
            syncHistoryToDb(newHistory);
            return newHistory;
        });
    }, [isHistoryEnabled]);

    const addOverhaulToHistory = useCallback((item: OverhaulHistoryItem) => {
        if (!isHistoryEnabled) return;

        setHistory(prevHistory => {
            const newHistory = {
                ...prevHistory,
                overhauls: [item, ...prevHistory.overhauls].slice(0, MAX_HISTORY_ITEMS)
            };
            syncHistoryToDb(newHistory);
            return newHistory;
        });
    }, [isHistoryEnabled]);

    const clearHistory = useCallback(() => {
        if (!isHistoryEnabled) return;
        const emptyHistory = { products: [], overhauls: [] };
        setHistory(emptyHistory);
        syncHistoryToDb(emptyHistory);
    }, [isHistoryEnabled]);

    return { history, addProductToHistory, addOverhaulToHistory, clearHistory, isHistoryEnabled };
};