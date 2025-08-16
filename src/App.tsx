import {sha512} from 'js-sha512';

import {useEffect, useMemo, useState} from 'react'
import {useSearchParams} from "react-router-dom";
import {Gift} from "./Gift.tsx";
import PseudoPopup from "./Pseudo.tsx";

import './style/app.scss';
import Footer from "./Footer.tsx";
import Explanations from "./Explanations.tsx";
import Popup from "reactjs-popup";
import {bookGift, getGistContent, GiftData} from "./Gist.ts";

// TODO add pipeline lint, build, deploy to GitHub Pages

// array containing the valid api keys and gist ids to ensure the app can't be used
// in an illegitimate manner (html injection + 'legitimate' url)
const valid_key = ['0696065a8f896feecd17640bb4a56cd838e18f694d9bb6a6ac7e2765d4583ea09b60368a30c73ed7bec130cd6174a7a9fcfc7fd9f8b9b8b46d9267d546f5a922']
const valid_gist = ['5078b05538dd67c6dc6458fa00dd7f708ce2f66755e17a2dae13802c951dcd06ba86c5385027d6b6c295bb5ea7d8602c6bd6be0dfa030ae203b6334be70a02ad']

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
    const [giftsData, setGiftsData] = useState<GiftData[]>([]);

    // Get and validate the keys and gist ids
    const [key, gist] = useMemo(() => {
        const key = searchParams.get("k");
        const gist = searchParams.get("g");

        if (gist == null || key == null) {
            setErrorMessage("Il nécessaire de spécifier des paramètres pour accèder à l'application.")
            setState('error')
            return [null, null];
        } else if (!valid_key.includes(sha512(key)) || !valid_gist.includes(sha512(gist))) {
            console.debug('key:', sha512(key))
            console.debug('gist:', sha512(gist))
            setErrorMessage("Les paramètres spécifiés ne sont pas autorisés.")
            setState('error')
            return [null, null];
        } else {
            return [key, gist];
        }
    }, [searchParams])

    useEffect(() => {
        if (state !== 'loading' || gist == null || key == null)
            return;

        setLoadingMessage("Chargement de la liste de cadeaux...")
        getGistContent(key, gist)
            .then((data) => {
                if (data) {
                    if (data.accessible) {
                        setGiftsData(data.gifts)
                        setState('valid')
                    } else {
                        setState('error')
                        setErrorMessage('Le propriétaire de cette liste l\' rendu inaccesible pour le moment. Merci de revenir plus tard')
                    }
                } else {
                    console.error("No data retrieved from Github")
                    setErrorMessage('Une erreur inattendue est survenue lors de la récupération des informations...')
                    setState('error')
                }
            })
            .catch((error: Error) => {
                console.error("Error while fetching data to Github:", error)
                setErrorMessage('Une erreur inattendue est survenue lors de la récupération des informations...')
                setState('error')
            });
    }, [gist, key, state]);

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
                        existingNames={giftsData
                            .reduce((names: string[], res) => {
                                res.buyers.forEach((n) => {
                                    if (n != null && !names.includes(n)) {
                                        names.push(n)
                                    }
                                })
                                return names;
                            }, [])}
                        apiKey={key}
                        gist={gist}
                    />
                    <h1>Liste de cadeaux !</h1>
                    <Explanations
                        name={name!}
                        existingNames={giftsData
                            .reduce((names: string[], res) => {
                                res.buyers.forEach((n) => {
                                    if (n != null && !names.includes(n)) {
                                        names.push(n)
                                    }
                                })
                                return names;
                            }, [])}
                        apiKey={key!}
                        gist={gist!}
                    />
                    <div className="gift-list">
                        {giftsData
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
                                    <Gift key={gift.uid}
                                          name={name!}
                                          gift={gift}
                                          bookCallback={(subdivisionIndex) => {
                                              console.log(`${gift.uid} ${subdivisionIndex}`)
                                              if (gift.buyers.length > subdivisionIndex) {
                                                  if (gift.buyers[subdivisionIndex] != null && gift.buyers[subdivisionIndex] != name) {
                                                      setErrorMessage(gift.buyers[subdivisionIndex])
                                                      setState('alreadyBooked')
                                                  } else {
                                                      setState("waitingForAcknowledgement")
                                                      if (key == null || gist == null || name == null) {
                                                          console.error("No key, gist or name when trying to submit booking request")
                                                          setErrorMessage("Il nécessaire de spécifier des paramètres pour accèder à l'application.")
                                                          setState('error')
                                                          return
                                                      }
                                                      bookGift(key, gist, name, gift, subdivisionIndex)
                                                          .then(r => {
                                                              if (r == false) {
                                                                  setState("dbIsolationError")
                                                              } else {
                                                                  setGiftsData(r.gifts)
                                                                  setState("changesSaved")
                                                              }
                                                          })
                                                          .catch((e: Error) => {
                                                              console.error("Error while updating:", e)
                                                              setErrorMessage("Une erreur inattendue est survenue lors de la mise à jour.")
                                                              setState('error')
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
                                setState("valid")
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
                                setState("loading")
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
