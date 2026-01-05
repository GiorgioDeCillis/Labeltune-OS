'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    code: string;
    name: string;
}

interface CustomSelectProps {
    name: string;
    label: string;
    options: Option[];
    placeholder: string;
    required?: boolean;
    error?: string;
    onChange?: (value: string) => void;
}

export default function CustomSelect({
    name,
    options,
    placeholder,
    required,
    error,
    onChange
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.code === selectedValue);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (value: string) => {
        setSelectedValue(value);
        setIsOpen(false);
        if (onChange) onChange(value);
    };

    return (
        <div ref={containerRef} className="relative w-full space-y-2">
            {/* Hidden input for form submission */}
            <input
                type="hidden"
                name={name}
                value={selectedValue}
                required={required}
            />

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between
                    bg-white/5 border rounded-xl px-4 py-3
                    focus:border-primary focus:ring-1 focus:ring-primary
                    outline-none transition-all cursor-pointer
                    ${error ? 'border-red-500/50' : 'border-white/10'}
                `}
            >
                <span className={`text-sm ${!selectedOption ? 'opacity-40' : 'text-white'}`}>
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className={`w-4 h-4 opacity-40 ${isOpen ? 'text-primary opacity-100' : ''}`} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute left-0 right-0 z-[100] bg-[#0a0a0f] backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                        style={{ maxHeight: '250px', overflowY: 'auto' }}
                    >
                        <div className="p-2 space-y-1">
                            {options.map((option) => (
                                <button
                                    key={option.code}
                                    type="button"
                                    onClick={() => handleSelect(option.code)}
                                    className={`
                                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                                        text-sm font-medium transition-all
                                        ${selectedValue === option.code
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-white/10 text-white/70 hover:text-white'
                                        }
                                    `}
                                >
                                    <span>{option.name}</span>
                                    {selectedValue === option.code && (
                                        <Check className="w-4 h-4" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1 block">
                    {error}
                </span>
            )}
        </div>
    );
}
