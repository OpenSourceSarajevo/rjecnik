export const toDiacritical = (word: string) : string => {
    const map = new Map<string, string>([
        ["mnozina", "množina"],
    ]);

    return map.get(word) ?? word; 
};
