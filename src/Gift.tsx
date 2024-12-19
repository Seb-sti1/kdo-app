import {GiftData, ReservationData} from "./Sheet.ts";
import React, {useMemo} from "react";
import './style/gift.scss'
import {IoPricetagsOutline} from "react-icons/io5";
import {FaExternalLinkAlt} from "react-icons/fa";
import {IoIosCheckbox} from "react-icons/io";
import {RiCheckboxBlankLine} from "react-icons/ri";

interface GiftProps {
    gift: GiftData,
    reservation: ReservationData,
}

const Gift: React.FC<GiftProps> = ({gift, reservation}) => {
    const fullyReserved = useMemo(() => {
        if (gift.subdivisions) {
            return reservation.buyers.length == gift.subdivisions.length
                && reservation.buyers.every(buyer => buyer.length > 0)
        } else {
            return reservation.buyers.length > 0;
        }
    }, [gift, reservation]);

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
                                    reservation.buyers[index].length > 0 ? "reserved" : ""].join(' ')}
                                title={reservation.buyers[index].length > 0 ?
                                    `Déjà réservé par ${reservation.buyers[index]}` :
                                    'Cliquer pour réserver'}
                                key={subdivision} onClick={() => {
                                console.log("Book clicked");
                                // TODO: book gift
                            }}>
                                {subdivision}
                                {reservation.buyers[index].length > 0 ? <IoIosCheckbox/> : <RiCheckboxBlankLine/>}
                            </button>)
                        )}
                    </div>
                )
            }
            <div className="footer">
                {
                    !gift.subdivisions &&
                    <button className="center-icon" onClick={() => {
                        console.log("Book clicked");
                        // TODO: book gift
                    }}
                    title={reservation.buyers.length > 0 ?
                        `Déjà réservé par ${reservation.buyers[0]}` :
                        'Cliquer pour réserver'}>
                        {
                            reservation.buyers.length > 0 ?
                                (<>
                                    {`Déjà réservé par ${reservation.buyers[0]}`}
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