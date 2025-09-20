export const formatHex = (number, width, withPrefix = true) => `${withPrefix ? '$' : ''}${number.toString(16).toUpperCase().padStart(width, '0')}`;

export const formatDec = (number, width, withPrefix = true) => `${withPrefix ? '#' : ''}${number.toString(10).padStart(width, '0')}`;