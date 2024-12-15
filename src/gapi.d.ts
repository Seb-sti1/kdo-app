import {FetchResponse} from "./Sheet.ts";

declare global {
    interface Window {
        gapi: {
            client: {
                init(param: { apiKey: string; discoveryDocs: string[] }): Promise<undefined>;
                sheets: {
                    spreadsheets: {
                        values: {
                            get(param: { spreadsheetId: string; range: string }): Promise<FetchResponse>;
                        };
                    };
                };
            };
            load: (type: string, callback: () => Promise<void>) => void;
        }
    }
}

export {};
