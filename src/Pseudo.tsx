import React from "react";
import Popup from "reactjs-popup";
import {useSearchParams} from "react-router-dom";
import {generateUnique} from "./PseudoGeneration.ts"

import './style/pseudo.scss';


interface PseudoPopupProps {
    existingNames: string[],
    apiKey: string | null,
    gist: string | null,
}

const PseudoPopup: React.FC<PseudoPopupProps> = ({ existingNames, apiKey, gist}) => {
    const [_, setSearchParams] = useSearchParams();

    return (<Popup open={true}
                   modal
                   nested
                   closeOnDocumentClick={false}
                   closeOnEscape={false}>
        <div className="modal">
            <span className="bold center">Vous n'êtes pas identifié(e)...</span>
            <p>Vous allez pouvoir choisir votre pseudo ou en créer un nouveau.
                <span className="bold" style={{marginLeft: '4px'}}>
                    Une fois selectionné, merci
                    d'enregistrer le nouvel url : il contient toutes informations pour
                    être directement identifié(e).
                </span>
            </p>
            <span>Choisissez le pseudo qui vous a été donné dans la liste ci-dessous :</span>
            <div>
                {existingNames.map((name) => (
                    <button key={name} onClick={() => {
                        if (apiKey !== null && gist !== null)
                            setSearchParams({
                                k: apiKey,
                                g: gist,
                                n: name,
                            })
                    }}>
                        {name}
                    </button>
                ))}
            </div>
            <span>Ou, si vous n'aviez pas de pseudo, générer s'en un :</span>
            <button onClick={() => {
                if (apiKey !== null && gist !== null)
                    setSearchParams({
                        k: apiKey,
                        g: gist,
                        n: generateUnique(existingNames),
                    })
            }}>
                Générer un pseudo
            </button>
        </div>
    </Popup>)

}

export default PseudoPopup;