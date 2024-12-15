export interface InitError {
    error: {
        code: number,
        message: string,
        status: string,
        details: {
            "@type": string,
            reason?: string,
            domain?: string,
            locale?: string,
            message?: string,
            metadata?: {
                service?: string
            }
        }[]
    }
}

export interface FetchError {
    result: {
        error: {
            code: number,
            message: string,
            status: string
        }
    },
    body: string
    status: string,
    statusText: string | null
    // there is a header too
}

export interface FetchResult {
    range: string
    majorDimension: "ROWS" | "COLUMNS"
    values?: string[][]
}

export interface FetchResponse {
    result: FetchResult
    body: string
    status: string,
    statusText: string | null
    // there is a header too
}

export interface GiftData {
    name: string,
    subdivisions?: string[],
    order: number,
    description: string,
    link: string,
    price: number,
}

export interface ReservationData {
    buyers: string[],
}

export const initGoogleAPI = async (key: string): Promise<undefined> => {
    return new Promise((resolve, reject) => {
        window.gapi.load('client', async () => {
            await window.gapi.client.init({
                apiKey: key,
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            }).then(() => {
                resolve(undefined);
            }).catch((error: InitError) => {
                reject(error);
            })
        });
    })
}

export const fetchRange = async (id: string, range: string): Promise<FetchResult> => {
    return window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: id,
        range: range,
    }).then((response: FetchResponse) => {
        return response.result;
    })
};

export const getGifts = async (id: string): Promise<GiftData[]> => {
    return fetchRange(id, "gifts!A2:F1000").then((result: FetchResult) => {
        return result.values === undefined ? [] : result.values.map((row: string[]) => (
            {
                name: row[0],
                subdivisions: row[1] === "" ? undefined : row[1].split(';'),
                order: parseInt(row[2]),
                description: row[3],
                link: row[4],
                price: parseFloat(row[5])
            }
        ))
    })
}

export const getReservations = async (id: string): Promise<ReservationData[]> => {
    return fetchRange(id, "reservations!A1:A1000").then((result: FetchResult) => {
        return result.values === undefined ? [] : result.values.map((row: string[]) => (
            {
                buyers: row.length > 0 ? row[0].split(';') : []
            }
        ))
    })
}