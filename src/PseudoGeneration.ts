const animals: string[] = [
    'Tapir',
    'Éléphant',
    'Crabe',
    'Chat',
    'Chien',
]
const adjectives: string[] = [
    'Agile',
    'Curieux',
    'Créatif',
    'Honnête',
    'Ingénieux'
]

function newPseudo(): string {
    return `${animals[Math.floor(Math.random() * animals.length)]} ${adjectives[Math.floor(Math.random() * animals.length)]}`
}


export function generateUnique(existingNames: string[]): string {
    let n: string | null = null;
    while (n === null) {
        n = newPseudo()
        if (existingNames.includes(n))
            n = null;
    }
    return n;
}

export function generateUrl(name: string, apiKey: string, gist: string): string {
    const url = new URL(window.location.origin);
    const searchParams = new URLSearchParams({k: apiKey, g: gist, n: name});
    url.search = searchParams.toString();
    return url.toString();
}