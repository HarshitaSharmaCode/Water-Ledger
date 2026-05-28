// src/components/ui/ToastContainer.tsx
// Renders active toasts. Mount once in layout.tsx.
// Position: top-right on desktop, top-center on mobile.

'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { useToastStore } from '@/store/toast.store';

export const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToastStore();

    return (
        <div
            className="fixed top-4 z-[999] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm
                 left-1/2 -translate-x-1/2
                 sm:left-auto sm:right-4 sm:translate-x-0"
            aria-live="polite"
        >
            <AnimatePresence initial={false}>
                {toasts.map((toast) => {
                    const isSuccess = toast.type === 'success';
                    return (
                        <motion.div
                            key={toast.id}
                            layout
                            initial={{ opacity: 0, y: -16, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg"
                            style={{
                                background: isSuccess ? '#064E3B' : '#7F1D1D',
                                border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                boxShadow: isSuccess
                                    ? '0 8px 24px rgba(6,78,59,0.35)'
                                    : '0 8px 24px rgba(127,29,29,0.35)',
                            }}
                        >
                            {/* Icon */}
                            <div className="shrink-0 mt-0.5">
                                {isSuccess
                                    ? <CheckCircle className="w-4 h-4" style={{ color: '#10B981' }} />
                                    : <AlertCircle className="w-4 h-4" style={{ color: '#EF4444' }} />
                                }
                            </div>

                            {/* Message */}
                            <p
                                className="flex-1 text-sm font-medium leading-snug"
                                style={{ color: '#FFFFFF' }}
                            >
                                {toast.message}
                            </p>

                            {/* Dismiss */}
                            <button
                                type="button"
                                onClick={() => removeToast(toast.id)}
                                className="shrink-0 mt-0.5 cursor-pointer transition-opacity hover:opacity-70"
                                style={{ color: 'rgba(255,255,255,0.6)' }}
                                aria-label="Dismiss"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};