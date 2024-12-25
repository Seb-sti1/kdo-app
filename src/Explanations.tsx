import React, {useState} from "react";

import {IoIosCheckbox} from "react-icons/io";
import {RiCheckboxBlankLine} from "react-icons/ri";
import "./style/explanations.scss"
import {generateUnique, generateUrl} from './PseudoGeneration.ts'

interface ExplanationsProps {
    name: string | null,
    existingNames: string[],
    apiKey: string | null,
    sheet: string | null,
}


const Explanations: React.FC<ExplanationsProps> = ({name, existingNames, apiKey, sheet}) => {
    const [interactiveCheckbox, setInteractiveCheckbox] = useState<boolean>(true)
    const [newName, setNewName] = useState<string | null>(null)


    return (
        <div className="explanations">
            <div>
                <h2>Comment (dé)réserver ?</h2>
                <p>
                    {interactiveCheckbox && (<>Pour réserver il suffit de cliquer sur <RiCheckboxBlankLine
                        onClick={() => {
                            setInteractiveCheckbox(!interactiveCheckbox)
                        }}/>.<br/>Pour déréserver il suffit de cliquer sur <IoIosCheckbox onClick={() => {
                        setInteractiveCheckbox(!interactiveCheckbox)
                    }}/>.</>)}
                    {!interactiveCheckbox && (<>Pour déréserver il suffit de cliquer sur <IoIosCheckbox onClick={() => {
                        setInteractiveCheckbox(!interactiveCheckbox)
                    }}/>.<br/>Pour réserver il suffit de cliquer sur <RiCheckboxBlankLine onClick={() => {
                        setInteractiveCheckbox(!interactiveCheckbox)
                    }}/>.</>)}
                </p>
                <h2>Comment revenir sur la page de réservation ?</h2>
                <p>
                    Il suffit de créer un marque-page ou de sauvegarder l'url de
                    <a href={generateUrl(name, apiKey, sheet)}> cette page</a>.
                </p>
                <h2>Comment partager la liste ?</h2>
                <p>
                    Gérer un nouveau lien en cliquant
                    <button style={{marginLeft: '5px'}} onClick={() => {
                        if (apiKey !== null && sheet !== null)
                            setNewName(generateUnique(existingNames))
                    }}>ici</button>.
                    {newName !== null && (<>
                        <br/>
                        Partager ce <a href={generateUrl(newName, apiKey, sheet)}>lien</a>, le pseudo associé est
                        <span style={{
                            marginLeft: '1ex',
                            fontWeight: 'bold'
                        }}>{newName}</span>.
                    </>)}
                </p>
            </div>
        </div>
    )
}

export default Explanations;