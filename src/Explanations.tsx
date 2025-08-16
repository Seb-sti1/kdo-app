import React, {useState} from "react";

import {IoIosCheckbox} from "react-icons/io";
import {RiCheckboxBlankLine} from "react-icons/ri";
import "./style/explanations.scss"
import {generateUnique, generateUrl} from './PseudoGeneration.ts'

interface ExplanationsProps {
    name: string,
    existingNames: string[],
    apiKey: string,
    gist: string,
}


const Explanations: React.FC<ExplanationsProps> = ({name, existingNames, apiKey, gist}) => {
    const [newName, setNewName] = useState<string | null>(null)

    return <div className="explanations">
        <span>Vous êtes identifié(e) en tant que<span> {name}</span>.</span>
        <p>
            Pour réserver, il suffit de cliquer sur les <RiCheckboxBlankLine/>.
            Pour déréserver, il suffit de cliquer sur les <IoIosCheckbox/>.
            Vos réservations sont indiquées en <button className="golden">dorées</button>.
            Pour revenir, il suffit de créer un marque-page ou de sauvegarder l'url de
            <a href={generateUrl(name, apiKey, gist)}> cette page</a>.{' '}
            {name != "admin" && "Pour partager cette liste, merci de demander au propriétaire de créer un nouveau lien."}
            {name == "admin" && (<><br/>
                Gérer un nouveau lien en cliquant
                <button style={{marginLeft: '5px'}} onClick={() => {
                    if (apiKey !== null && gist !== null)
                        setNewName(generateUnique(existingNames))
                }}>ici</button>.
                {newName !== null && (<>
                    <br/>
                    Partager ce <a href={generateUrl(newName, apiKey, gist)}>lien</a>, le pseudo associé est
                    <span style={{
                        marginLeft: '1ex',
                        fontWeight: 'bold'
                    }}>{newName}</span>.
                </>)}
            </>)}
        </p>
    </div>
}

export default Explanations;