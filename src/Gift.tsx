import {GiftReservationData} from "./Sheet.ts";
import React, {useMemo} from "react";
import './style/gift.scss'
import {IoPricetagsOutline} from "react-icons/io5";
import {FaExternalLinkAlt} from "react-icons/fa";
import {IoIosCheckbox} from "react-icons/io";
import {RiCheckboxBlankLine} from "react-icons/ri";

interface GiftProps {
    gift: GiftReservationData,
    bookCallback: (subdivisionIndex: number) => void
}

const Gift: React.FC<GiftProps> = ({gift, bookCallback}) => {
    const fullyReserved = useMemo(() => {
        if (gift.subdivisions) {
            return gift.buyers.length == gift.subdivisions.length
                && gift.buyers.every(buyer => buyer.length > 0)
        } else {
            return gift.buyers.length > 0;
        }
    }, [gift]);

    return (
        <div className={["gift", fullyReserved ? "reserved" : ""].join(' ')}>
            <div className="header">
                <span className="name">{gift.name}</span>
                {gift.price && (<span className="price center-icon"><IoPricetagsOutline/> {gift.price} €</span>)}
            </div>
            {gift.description && (<span className="description">{gift.description}</span>)}
            {
                gift.subdivisions && (
                    <div className="subdivisions">
                        {gift.subdivisions.map((subdivision, index) =>
                            (<button
                                className={["center-icon",
                                    gift.buyers[index].length > 0 ? "reserved" : ""].join(' ')}
                                title={gift.buyers[index].length > 0 ?
                                    `Déjà réservé par ${gift.buyers[index]}` :
                                    'Cliquer pour réserver'}
                                key={subdivision} onClick={() => {
                                bookCallback(index);
                            }}>
                                {subdivision}
                                {gift.buyers[index].length > 0 ? <IoIosCheckbox/> : <RiCheckboxBlankLine/>}
                            </button>)
                        )}
                    </div>
                )
            }
            <div className="footer">
                {
                    !gift.subdivisions &&
                    <button className="center-icon" onClick={() => {
                        bookCallback(0);
                    }}
                            title={gift.buyers.length > 0 ?
                                `Déjà réservé par ${gift.buyers[0]}` :
                                'Cliquer pour réserver'}>
                        {
                            gift.buyers.length > 0 ?
                                (<>
                                    {`Déjà réservé par ${gift.buyers[0]}`}
                                    <IoIosCheckbox/>
                                </>)
                                : <>
                                    Réserver
                                    <RiCheckboxBlankLine/>
                                </>
                        }
                    </button>
                }
                {gift.link && (<a className="center-icon" href={gift.link} target="_blank">
                    <FaExternalLinkAlt/> {gift.link}
                </a>)}
            </div>
        </div>
    )
}

export default Gift;