import {sha512} from 'js-sha512';

import {useEffect, useMemo, useState} from 'react'
import {
    FetchError,
    getGifts,
    getReservations,
    GiftReservationData,
    InitError,
    initGoogleAPI,
    ReservationData,
    setReservation
} from './Sheet.ts'
import {useSearchParams} from "react-router-dom";
import Gift from "./Gift.tsx";
import PseudoPopup from "./Pseudo.tsx";

import './style/app.scss';
import Footer from "./Footer.tsx";
import Explanations from "./Explanations.tsx";
import Popup from "reactjs-popup";

// TODO add pipeline lint, build, deploy to GitHub Pages

// array containing the valid keys and gsheet ids to ensure the app can't be used
// in an illegitimate manner (html injection + 'legitimate' url)
const valid_key = ['d316914dff1d26b5d789a4783d0b1112733b2ee445c851b368c42718417b9d1c2559c183b82b2fd795cede7cc54e764ee1b8939b07cdb8f67accac8b86cb89ec']
const valid_sheet = ['bb6d4c0cf819a0e24c9c7c431a54e6e68bdbc1a897e96b8cc1373a2a806c714363cc6ce5ebb18501c871c925538291969db06eb284a3358bbb5b8063b4c8a68d']

type State =
    "loading"
    | "error"
    | "valid"
    | "alreadyBooked"
    | "waitingForAcknowledgement"
    | "changesSaved"
    | "dbIsolationError"

function App() {
    const [searchParams, _] = useSearchParams();
    const [loadingMessage, setLoadingMessage] = useState<string>('Chargement...')
    const [errorMessage, setErrorMessage] = useState<string>('Une erreur est survenue...')
    const [state, setState] = useState<State>('loading')
    const [giftsReservations, setGiftsReservations] = useState<GiftReservationData[]>([]);

    // Get and validate the keys and sheet ids
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
                .then(async (giftsData) => {
                    setLoadingMessage("Chargement de la liste des réservations...")
                    return {giftsData, resData: await getReservations(sheet)}
                })
                .then(({giftsData, resData}) => {
                    if (resData.length < giftsData.length) {
                        for (let i = resData.length; i < giftsData.length; i++) {
                            resData.push({
                                index: i,
                                buyers: []
                            })
                        }
                    }
                    setGiftsReservations(giftsData.map((gift, index) => {
                        return {
                            ...gift,
                            buyers: index < resData.length ? resData[index].buyers : [],
                        }
                    }))
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

    const name = searchParams.get("n");

    switch (state) {
        case 'loading':
            return <><span>{loadingMessage}</span><Footer/></>
        case 'error':
            return <><span>{errorMessage}</span><Footer/></>
        case 'valid':
        case 'alreadyBooked':
        case 'waitingForAcknowledgement':
        case 'changesSaved':
        case 'dbIsolationError':
            return (
                <>
                    <PseudoPopup
                        name={name}
                        existingNames={giftsReservations
                            .reduce((names: string[], res: ReservationData) => {
                                res.buyers.forEach((n) => {
                                    if (!names.includes(n) && n !== "") {
                                        names.push(n)
                                    }
                                })
                                return names;
                            }, [])}
                        apiKey={key}
                        sheet={sheet}
                    />
                    <Explanations
                        name={name}
                        existingNames={giftsReservations
                            .reduce((names: string[], res: ReservationData) => {
                                res.buyers.forEach((n) => {
                                    if (!names.includes(n) && n !== "") {
                                        names.push(n)
                                    }
                                })
                                return names;
                            }, [])}
                        apiKey={key}
                        sheet={sheet}
                    />
                    <h1>Liste de cadeaux !</h1>
                    <span className="identity">Vous êtes identifié(e) en tant que<span>{name}</span>.</span>
                    <div className="gift-list">
                        {giftsReservations
                            .sort((a, b) => {
                                const aOrder = a.order === null ? 1000000 : a.order;
                                const bOrder = b.order === null ? 1000000 : b.order;
                                if (aOrder > bOrder)
                                    return 1
                                else if (aOrder < bOrder)
                                    return -1
                                else
                                    return 0
                            })
                            .map((gift) =>
                                (
                                    <Gift key={gift.name}
                                          gift={gift}
                                          bookCallback={(subdivisionIndex) => {
                                              console.log(`${gift.index} ${subdivisionIndex}`)
                                              if (gift.buyers.length > subdivisionIndex) {
                                                  if (gift.buyers[subdivisionIndex] != "" && gift.buyers[subdivisionIndex] != name) {
                                                      setErrorMessage(gift.buyers[subdivisionIndex])
                                                      setState('alreadyBooked')
                                                  } else {
                                                      setState("waitingForAcknowledgement")
                                                      if (sheet == null || name == null) {
                                                          // TODO trigger reload
                                                          return
                                                      }
                                                      setReservation(sheet, gift, name, subdivisionIndex).then(r => {
                                                          if (r) {
                                                              setState("changesSaved")
                                                          } else {
                                                              setState("dbIsolationError")
                                                          }
                                                      })
                                                  }
                                              }
                                          }}
                                    />
                                ))}
                    </div>
                    <Popup open={state == 'alreadyBooked'}
                           modal
                           nested
                           closeOnDocumentClick={false}
                           closeOnEscape={false}>
                        <div className="modal">
                            <span className="center"><span className="bold">{errorMessage}</span> a déjà reservé ce cadeau...</span>
                            <p> Si vous le/la connaissez, vous pouvez toujours essayer de vous arranger avec cette
                                personne.</p>
                            <button onClick={() => {
                                setState("valid")
                            }}>Ok
                            </button>
                        </div>
                    </Popup>
                    <Popup open={state == 'waitingForAcknowledgement'}
                           modal
                           nested
                           closeOnDocumentClick={false}
                           closeOnEscape={false}>
                        <div className="modal">
                            <span className="bold center">Veuillez patienter...</span>
                            <p>La (dé)réservation en cours d'enregistrement...</p>
                        </div>
                    </Popup>
                    <Popup open={state == 'changesSaved'}
                           modal
                           nested
                           closeOnDocumentClick={false}
                           closeOnEscape={false}>
                        <div className="modal">
                            <span className="bold center">Modification enregistrée</span>
                            <p>La (dé)réservation a été enregistrée !</p>
                            <button onClick={() => {
                                setState("loading") // TODO check if this work
                            }}>Ok
                            </button>
                        </div>
                    </Popup>
                    <Popup open={state == 'dbIsolationError'}
                           modal
                           nested
                           closeOnDocumentClick={false}
                           closeOnEscape={false}>
                        <div className="modal">
                            <span className="bold center">La base de donnée a déjà été modifiée</span>
                            <p>Il semblerait que la base de donnée ait été modifiée par quelqu'un d'autre... Merci de
                                réessayer.</p>
                            <button onClick={() => {
                                setState("loading") // TODO check if this work
                            }}>Ok
                            </button>
                        </div>
                    </Popup>
                    <Footer/>
                </>
            )

    }
}

export default App
