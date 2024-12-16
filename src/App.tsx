import {useEffect, useMemo, useState} from 'react'
import {FetchError, getGifts, getReservations, GiftData, InitError, initGoogleAPI, ReservationData} from './Sheet.ts'
import {useSearchParams} from "react-router-dom";
import Gift from "./Gift.tsx";
import {sha512} from 'js-sha512';

import './style/app.scss';

// array containing the valid keys and gsheet ids to ensure the app can't be used
// in an illegitimate manner (html injection + 'legitimate' url)
const valid_key = ['d316914dff1d26b5d789a4783d0b1112733b2ee445c851b368c42718417b9d1c2559c183b82b2fd795cede7cc54e764ee1b8939b07cdb8f67accac8b86cb89ec']
const valid_sheet = ['bb6d4c0cf819a0e24c9c7c431a54e6e68bdbc1a897e96b8cc1373a2a806c714363cc6ce5ebb18501c871c925538291969db06eb284a3358bbb5b8063b4c8a68d']

type State = "loading" | "error" | "valid"

function App() {
    const [searchParams, _] = useSearchParams();
    const [loadingMessage, setLoadingMessage] = useState<string>('Chargement...')
    const [errorMessage, setErrorMessage] = useState<string>('Une erreur est survenue...')
    const [state, setState] = useState<State>('loading')
    const [gifts, setGifts] = useState<GiftData[]>([]);
    const [reservations, setReservations] = useState<ReservationData[]>([]);

    const [key, sheet] = useMemo(() => {
        const key = searchParams.get("k");
        const sheet = searchParams.get("s");

        if (sheet == null || key == null) {
            setErrorMessage("Il nécessaire de spécifier des paramètres pour accèder à l'application.")
            setState('error')
            return [null, null];
        } else if (!valid_key.includes(sha512(key)) || !valid_sheet.includes(sha512(sheet))) {
            console.debug('key:', sha512(key))
            console.debug('sheet:', sha512(sheet))
            setErrorMessage("Les paramètres spécifiés ne sont pas autorisés.")
            setState('error')
            return [null, null];
        } else {
            return [key, sheet];
        }
    }, [searchParams])

    // const name = searchParams.get("n");
    // TODO add name generation if not specified

    // TODO add explanation

    // Load, init and check Google API
    useEffect(() => {
        if (state !== 'loading' || sheet == null || key == null)
            return;

        setLoadingMessage("Chargement de l'application...")
        const script = document.createElement('script');
        script.src = "https://apis.google.com/js/api.js";
        script.async = true;
        script.onload = async () => {
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
                    console.error("Error while fetching data to Google Sheet:", error)
                    setErrorMessage('Une erreur est survenue lors de la récupération des informations...')
                    setState('error')
                });
        }
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, [sheet, key, state]);


    // TODO add a footer
    switch (state) {
        case 'loading':
            return <span>{loadingMessage}</span>
        case 'error':
            return <span>{errorMessage}</span>
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
