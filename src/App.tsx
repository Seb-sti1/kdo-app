import {useEffect, useState} from 'react'
import {FetchError, getGifts, getReservations, GiftData, InitError, initGoogleAPI, ReservationData} from './Sheet.ts'
import {useSearchParams} from "react-router-dom";
import Gift from "./Gift.tsx";

import './style/app.scss';

type State = "loading" | "error" | "valid"

function App() {
    const [state, setState] = useState<State>('loading')
    const [loadingMessage, setLoadingMessage] = useState<string>('Chargement...')
    const [searchParams, _] = useSearchParams();
    const [gifts, setGifts] = useState<GiftData[]>([]);
    const [reservations, setReservations] = useState<ReservationData[]>([]);

    // TODO check apikey, sheet against hash table
    const sheet = searchParams.get("s");
    // const name = searchParams.get("n");
    // TODO add name generation if not specified

    // Load, init and check Google API
    useEffect(() => {
        if (state !== 'loading')
            return;

        setLoadingMessage("Chargement de l'application...")
        const script = document.createElement('script');
        script.src = "https://apis.google.com/js/api.js";
        script.async = true;
        script.onload = async () => {
            const key = searchParams.get("k");

            if (key && sheet) {
                initGoogleAPI(key)
                    .then(() => {
                        setLoadingMessage("Chargement de la liste de cadeaux...")
                        return getGifts(sheet)
                    })
                    .then((data) => {
                        setLoadingMessage("Chargement de la liste des réservations...")
                        setGifts(data)
                        return getReservations(sheet)
                    })
                    .then((data) => {
                        setReservations(data)
                        setState('valid')
                    })
                    .catch((error: InitError | FetchError) => {
                        console.error("Error while validating Google Sheet access:", error)
                        setState('error')
                    });
            } else {
                setState('error')
                return;
            }
        }
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, [searchParams, sheet, state]);

    switch (state) {
        case 'loading':
            return <span>{loadingMessage}</span>
        case 'error':
            return "Error with the param"
        case 'valid':
            return (
                <>
                    <h1>Liste de Cadeau !</h1>
                    <div className="gift-list">
                        {gifts
                            .sort((a, b) => {
                                if (a.order > b.order)
                                    return 1
                                else if (a.order < b.order)
                                    return -1
                                else
                                    return 0
                            })
                            .map((gift, index) =>
                                (
                                    <Gift key={gift.name}
                                          gift={gift}
                                          reservation={reservations[index]}/>
                                ))}
                    </div>
                </>
            )

    }
}

export default App
