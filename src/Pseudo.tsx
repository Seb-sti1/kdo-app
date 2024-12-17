import React from "react";
import Popup from "reactjs-popup";
import {useSearchParams} from "react-router-dom";


import './style/pseudo.scss';

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

interface PseudoPopupProps {
    name: string | null,
    existingNames: string[],
    apiKey: string | null,
    sheet: string | null,
}


const PseudoPopup: React.FC<PseudoPopupProps> = ({name, existingNames, apiKey, sheet}) => {
    const [_, setSearchParams] = useSearchParams();

    return (<Popup open={name === null}
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
                        if (apiKey !== null && sheet !== null)
                            setSearchParams({
                                k: apiKey,
                                s: sheet,
                                n: name,
                            })
                    }}>
                        {name}
                    </button>
                ))}
            </div>
            <span>Ou, si vous n'aviez pas de pseudo, générer s'en un :</span>
            <button onClick={() => {
                if (apiKey !== null && sheet !== null) {
                    let n: string | null = null;
                    while (n === null) {
                        n = newPseudo()
                        if (existingNames.includes(n))
                            n = null;
                    }
                    setSearchParams({
                        k: apiKey,
                        s: sheet,
                        n: newPseudo(),
                    })
                }
            }}>
                Générer un pseudo
            </button>
        </div>
    </Popup>)

}

export default PseudoPopup;