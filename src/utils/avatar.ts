/**
 * Utility to get a default avatar image based on gender guessed from a name.
 * Studio Ghibli style.
 */
export function getDefaultAvatar(name?: string | null): string {
    if (!name) return '/defaults/male_ghibli.png'; // Default to male if no name

    const trimmedName = name.trim().toLowerCase();

    // Very basic Italian-oriented gender detection
    // Most female names end in 'a'
    // Common male exceptions that end in 'a'
    const maleExceptions = ['andrea', 'mattia', 'luca', 'nicola', 'eliana', 'battista', 'evangelista'];

    const lastChar = trimmedName.charAt(trimmedName.length - 1);

    if (lastChar === 'a' && !maleExceptions.includes(trimmedName)) {
        return '/defaults/female_ghibli.png';
    }

    return '/defaults/male_ghibli.png';
}
