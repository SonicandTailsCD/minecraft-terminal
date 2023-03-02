export function getQuotedStrings (str: string): string[] {
	return (str.match(/(?<=")[^"]+(?=")|[^\s"]+/g) as string[]) || ([] as string[]);
}
