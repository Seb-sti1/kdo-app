import {sha512} from 'js-sha512';

import {useEffect, useMemo, useState} from 'react'
import {useSearchParams} from "react-router-dom";
import PseudoPopup from "./Pseudo.tsx";

import './style/app.scss';
import Footer from "./Footer.tsx";
import Explanations from "./Explanations.tsx";
import {bookGift, getGistContent, GiftData} from "./Gist.ts";
import {UserApp} from "./UserApp.tsx";

// TODO add pipeline lint, build, deploy to GitHub Pages

// array containing the valid api keys and gist ids to ensure the app can't be used
// in an illegitimate manner (html injection + 'legitimate' url)
const valid_key = ['0696065a8f896feecd17640bb4a56cd838e18f694d9bb6a6ac7e2765d4583ea09b60368a30c73ed7bec130cd6174a7a9fcfc7fd9f8b9b8b46d9267d546f5a922']
const valid_gist = ['5078b05538dd67c6dc6458fa00dd7f708ce2f66755e17a2dae13802c951dcd06ba86c5385027d6b6c295bb5ea7d8602c6bd6be0dfa030ae203b6334be70a02ad']

function App() {
    const [searchParams, _] = useSearchParams();
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [giftsData, setGiftsData] = useState<GiftData[] | null>(null);

    // Get and validate the keys and gist ids
    const [key, gist] = useMemo(() => {
        const key = searchParams.get("k");
        const gist = searchParams.get("g");

        if (gist == null || key == null) {
            setErrorMessage("Il nécessaire de spécifier des paramètres pour accèder à l'application.")
            return [null, null];
        } else if (!valid_key.includes(sha512(key)) || !valid_gist.includes(sha512(gist))) {
            console.debug('key:', sha512(key), 'gist:', sha512(gist))
            setErrorMessage("Les paramètres spécifiés ne sont pas autorisés.")
            return [null, null];
        } else {
            return [key, gist];
        }
    }, [searchParams])

    useEffect(() => {
        if (giftsData != null || gist == null || key == null)
            return;

        getGistContent(key, gist)
            .then((data) => {
                if (data) {
                    if (data.accessible) {
                        setGiftsData(data.gifts)
                    } else {
                        setErrorMessage('Le propriétaire de cette liste l\'a rendu inaccesible pour le moment. Merci de revenir plus tard')
                    }
                } else {
                    console.error("No data retrieved from Github")
                    setErrorMessage('Une erreur inattendue est survenue lors de la récupération des informations...')
                }
            })
            .catch((error: Error) => {
                console.error("Error while fetching data to Github:", error)
                setErrorMessage('Une erreur inattendue est survenue lors de la récupération des informations...')
            });
    }, [gist, key, giftsData]);

    const name = searchParams.get("n");

    if (errorMessage != null || key == null || gist == null)
        return <><span>{errorMessage}</span><Footer/></>
    if (giftsData == null)
        return <><span>Chargement de la liste de cadeaux...</span><Footer/></>
    if (name == null)
        return <><PseudoPopup existingNames={giftsData
            .reduce((names: string[], res) => {
                res.buyers.forEach((n) => {
                    if (n != null && !names.includes(n)) {
                        names.push(n)
                    }
                })
                return names;
            }, [])}
                              apiKey={key}
                              gist={gist}/><Footer/></>
    return (
        <>
            <h1>Liste de cadeaux !</h1>
            <Explanations
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
            {name != "admin" && (<UserApp
                name={name}
                giftsData={giftsData}
                bookCallback={async (gift, subdivisionIndex) => {
                    return bookGift(key, gist, name, gift, subdivisionIndex)
                        .then(r => {
                            if (r == false) {
                                return "dbIsolationError"
                            } else {
                                setGiftsData(r.gifts)
                                return null
                            }
                        })
                        .catch((e: Error) => {
                            console.error("Error while updating:", e)
                            setErrorMessage("Une erreur inattendue est survenue lors de la mise à jour.")
                            return null
                        })
                }}
            />)}
            <Footer/>
        </>
    )
}

export default App
