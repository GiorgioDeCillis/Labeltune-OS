'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [showPicker, setShowPicker] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Date picker state
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const months = [
        "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
        "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];

    useEffect(() => {
        if (defaultValue) {
            const [year, month, day] = defaultValue.split('-');
            if (year && month && day) {
                setDisplayValue(`${day}/${month}/${year}`);
                setIsoValue(defaultValue);
                const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                setSelectedDate(d);
                setViewDate(d);
            }
        }
    }, [defaultValue]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

        setDisplayValue(formatted);

        // Update ISO value for hidden input
        if (value.length === 8) {
            const day = value.slice(0, 2);
            const month = value.slice(2, 4);
            const year = value.slice(4, 8);

            const d = parseInt(day);
            const m = parseInt(month);
            const y = parseInt(year);

            if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1900 && y < 2100) {
                setIsoValue(`${year}-${month}-${day}`);
                const newDate = new Date(y, m - 1, d);
                setSelectedDate(newDate);
                setViewDate(newDate);
            } else {
                setIsoValue('');
                setSelectedDate(null);
            }
        } else {
            setIsoValue('');
            setSelectedDate(null);
        }
    };

    const handleDateSelect = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        setDisplayValue(`${day}/${month}/${year}`);
        setIsoValue(`${year}-${month}-${day}`);
        setSelectedDate(date);
        setShowPicker(false);
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        setViewDate(newDate);
    };

    const changeYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newDate = new Date(parseInt(e.target.value), viewDate.getMonth(), 1);
        setViewDate(newDate);
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const renderCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        // Adjust for Monday start (0=Sun, 1=Mon... -> 0=Mon, 6=Sun)
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

        const days = [];
        // Empty cells for the start of the month
        for (let i = 0; i < adjustedFirstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        // Days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            const isToday = new Date().toDateString() === date.toDateString();

            days.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    className={`
                        h-8 w-8 rounded-lg text-xs font-medium transition-all
                        ${isSelected ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' :
                            isToday ? 'border border-primary/50 text-primary' : 'hover:bg-white/10 text-white/80'}
                    `}
                >
                    {i}
                </button>
            );
        }

        return days;
    };

    const years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 1920; i--) {
        years.push(i);
    }

    return (
        <div className="relative w-full" ref={containerRef}>
            <input
                type="hidden"
                name={name}
                value={isoValue}
                required={required}
            />
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowPicker(!showPicker)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-md transition-colors z-10"
                >
                    <Calendar className={`w-4 h-4 ${showPicker ? 'text-primary' : 'opacity-40 text-white'}`} />
                </button>
                <input
                    type="text"
                    value={displayValue}
                    onChange={handleInput}
                    placeholder={placeholder}
                    required={required}
                    autoComplete="off"
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

            <AnimatePresence>
                {showPicker && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 right-0 mt-2 z-50 glass-panel p-4 rounded-2xl shadow-2xl border border-white/10 bg-black/40 backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <select
                                    value={viewDate.getMonth()}
                                    onChange={(e) => setViewDate(new Date(viewDate.getFullYear(), parseInt(e.target.value), 1))}
                                    className="bg-transparent text-sm font-bold outline-none cursor-pointer hover:text-primary transition-colors appearance-none pr-1"
                                >
                                    {months.map((m, i) => <option key={m} value={i} className="bg-zinc-900">{m}</option>)}
                                </select>
                                <select
                                    value={viewDate.getFullYear()}
                                    onChange={changeYear}
                                    className="bg-transparent text-sm font-bold outline-none cursor-pointer hover:text-primary transition-colors appearance-none"
                                >
                                    {years.map(y => <option key={y} value={y} className="bg-zinc-900">{y}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => changeMonth(-1)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => changeMonth(1)}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map(day => (
                                <div key={day} className="h-8 w-8 flex items-center justify-center text-[10px] font-bold opacity-30 text-white">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {renderCalendar()}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    setViewDate(today);
                                }}
                                className="text-[10px] font-bold uppercase tracking-wider text-primary hover:opacity-80 transition-opacity"
                            >
                                Vai a oggi
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPicker(false)}
                                className="text-[10px] font-bold uppercase tracking-wider opacity-40 hover:opacity-100 transition-opacity"
                            >
                                Chiudi
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1 mt-1 block"
                >
                    {error}
                </motion.span>
            )}
        </div>
    );
}
