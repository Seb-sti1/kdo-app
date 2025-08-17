import React from "react";
import './style/gift.scss'
import {IoPricetagsOutline} from "react-icons/io5";
import {FaExternalLinkAlt} from "react-icons/fa";
import {GiftData} from "./Gist.ts";

export interface EditableGiftProps {
    gift: GiftData,
    deleteCallback: () => void,
    editCallback: () => void,
}

export const EditableGift: React.FC<EditableGiftProps> = ({gift, deleteCallback, editCallback}) => {
    return (
        <div className="gift">
            <div className="header">
                <span className="name">{gift.name}</span><p
                style={{margin: "0", marginLeft: "10px"}}>(Ordre de préférence {gift.order})</p>
                {gift.price && (<span className="price center-icon"><IoPricetagsOutline/> {gift.price} €</span>)}
            </div>
            {gift.description && (<span className="description">{gift.description}</span>)}
            {
                (gift.subdivisions != null) && (
                    <div className="subdivisions">
                        {gift.subdivisions.map((subdivision) => (<button key={subdivision}>{subdivision}</button>))}
                    </div>
                )
            }
            <div className="footer">
                <button onClick={editCallback}>Modifier</button>
                <button onClick={deleteCallback}>Supprimer</button>

                {gift.link && (<a className="center-icon" href={gift.link} target="_blank">
                    <FaExternalLinkAlt/> {gift.link}
                </a>)}
            </div>
        </div>
    )
}