export interface GiftData {
    uid: string,
    name: string,
    order: number,
    subdivisions?: string[],
    buyers: (string | null)[],
    description?: string,
    link?: string,
    price?: number,
}

export interface GistContent {
    gifts: GiftData[],
    accessible: boolean,
}


interface GistFile {
    content: string;
}


interface GistRaw {
    files: Record<string, GistFile>;
}

const GITHUB_API = 'https://api.github.com';

async function getRawGist(token: string, gistId: string): Promise<GistRaw> {
    const res = await fetch(`${GITHUB_API}/gists/${gistId}`, {
        cache: 'no-cache',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
        },
    });
    if (!res.ok) throw new Error(`Error fetching Gist: ${res.status}`);
    return res.json();
}

async function updateRawGist(token: string, gistId: string, content: GistContent): Promise<GistRaw> {
    const res = await fetch(`${GITHUB_API}/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({
            description: "",
            files: {
                "kdo.json": {
                    content: JSON.stringify(content),
                }
            }
        }),
    });
    if (!res.ok) throw new Error(`Error updating Gist: ${res.status}`);
    return res.json();
}

function rawGistToGistContent(raw: GistRaw): GistContent {
    const rawGist = raw;
    if (rawGist.files['kdo.json'] == null)
        throw new Error("Can't find kdo.json")
    const content = rawGist.files['kdo.json'].content
    if (content == "{}")
        return {accessible: true, gifts: []}
    return JSON.parse(content);
}

export async function getGistContent(token: string, gistId: string): Promise<GistContent> {
    return rawGistToGistContent(await getRawGist(token, gistId));
}


export async function bookGift(token: string, gistId: string, buyer: string, gift: GiftData, subdivisionIndex: number): Promise<false | GistContent> {
    const currentContent = await getGistContent(token, gistId);
    const giftIndex = currentContent.gifts.findIndex((g) => g.uid == gift.uid);
    if (giftIndex < 0) throw new Error("Can't find the gift to edit");
    if (currentContent.gifts[giftIndex].buyers[subdivisionIndex] != gift.buyers[subdivisionIndex])
        return false;

    currentContent.gifts[giftIndex].buyers[subdivisionIndex] = currentContent.gifts[giftIndex].buyers[subdivisionIndex] == null ? buyer : null;
    return rawGistToGistContent(await updateRawGist(token, gistId, currentContent));
}