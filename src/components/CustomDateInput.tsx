'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface CustomDateInputProps {
    name: string;
    required?: boolean;
    error?: string;
    className?: string;
    placeholder?: string;
    defaultValue?: string; // Expects YYYY-MM-DD
}

export default function CustomDateInput({
    name,
    required,
    error,
    className,
    placeholder = "DD/MM/YYYY",
    defaultValue
}: CustomDateInputProps) {
    const [displayValue, setDisplayValue] = useState('');
    const [isoValue, setIsoValue] = useState('');

    useEffect(() => {
        if (defaultValue) {
            const [year, month, day] = defaultValue.split('-');
            if (year && month && day) {
                setDisplayValue(`${day}/${month}/${year}`);
                setIsoValue(defaultValue);
            }
        }
    }, [defaultValue]);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        const isDelete = (e.nativeEvent as InputEvent).inputType === 'deleteContentBackward';

        let value = val.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);

        let formatted = value;
        if (value.length > 2) {
            formatted = value.slice(0, 2) + '/' + value.slice(2);
        }
        if (value.length > 4) {
            formatted = formatted.slice(0, 5) + '/' + value.slice(4);
        }

        // Handle case where user deletes the slash
        if (isDelete && (val.endsWith('/') || val.length === 2 || val.length === 5)) {
            // Keep the current value if it's a delete operation on a breakpoint
        }

        setDisplayValue(formatted);

        // Update ISO value for hidden input
        if (value.length === 8) {
            const day = value.slice(0, 2);
            const month = value.slice(2, 4);
            const year = value.slice(4, 8);

            // Basic validation
            const d = parseInt(day);
            const m = parseInt(month);
            const y = parseInt(year);

            if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1900 && y < 2100) {
                setIsoValue(`${year}-${month}-${day}`);
            } else {
                setIsoValue('');
            }
        } else {
            setIsoValue('');
        }
    };

    return (
        <div className="relative w-full">
            <input
                type="hidden"
                name={name}
                value={isoValue}
                required={required}
            />
            <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 text-white" />
                <input
                    type="text"
                    value={displayValue}
                    onChange={handleInput}
                    placeholder={placeholder}
                    required={required}
                    className={`
                        w-full bg-white/5 border rounded-xl pl-11 pr-4 py-3
                        focus:border-primary focus:ring-1 focus:ring-primary
                        outline-none transition-all text-white placeholder:opacity-40
                        ${error ? 'border-red-500/50' : 'border-white/10'}
                        ${className}
                    `}
                    maxLength={10}
                />
            </div>
            {error && (
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1 mt-1 block">
                    {error}
                </span>
            )}
        </div>
    );
}
