/**
 * Wrapper for str1.padEnd(distance) + str2
 *
 * @param {string} str1 - The first string to concatenate.
 * @param {string} str2 - The second string to concatenate.
 * @param {number} maxLength - The length of the resulting string once the current string has been padded. If this parameter is smaller than the current string's length, the current string will be returned as it is.
 * @returns {string} The concatenated string with the specified number of spaces between the two input strings.
 */
export function tab (str1: string, str2: string, maxLength: number): string {
	return str1.padEnd(maxLength, ' ') + str2;
}
