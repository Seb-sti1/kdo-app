import React, {useState} from "react";
import {Gift} from "./Gift.tsx";
import {GiftData} from "./Gist.ts";
import Popup from "reactjs-popup";

interface UserAppProps {
    name: string,
    giftsData: GiftData[],
    bookCallback: (gift: GiftData, subdivisionIndex: number) => Promise<PopupType | null>,
}


export type PopupType = "alreadyBooked"
    | "waitingForAcknowledgement"
    | "changesSaved"
    | "dbIsolationError"

export const UserApp: React.FC<UserAppProps> = ({name, giftsData, bookCallback}) => {
    const [existingBuyer, setExistingBuyer] = useState<string>("???")
    const [popup, setPopup] = useState<PopupType | null>(null)


    return (<>
        <div className="gift-list">
            {giftsData
                .slice()
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
                              name={name}
                              gift={gift}
                              bookCallback={(subdivisionIndex) => {
                                  if (gift.buyers.length > subdivisionIndex) {
                                      if (gift.buyers[subdivisionIndex] != null && gift.buyers[subdivisionIndex] != name) {
                                          setExistingBuyer(gift.buyers[subdivisionIndex]);
                                          setPopup('alreadyBooked')
                                      } else {
                                          setPopup("waitingForAcknowledgement")
                                          bookCallback(gift, subdivisionIndex).then(setPopup)
                                      }
                                  }
                              }}
                        />
                    ))}
        </div>
        <Popup open={popup == 'alreadyBooked'}
               modal
               nested
               closeOnDocumentClick={false}
               closeOnEscape={false}>
            <div className="modal">
                <span className="center"><span className="bold">{existingBuyer}</span> a déjà reservé ce cadeau...</span>
                <p> Si vous le/la connaissez, vous pouvez toujours essayer de vous arranger avec cette
                    personne.</p>
                <button onClick={() => {
                    setPopup(null)
                }}>Ok
                </button>
            </div>
        </Popup>
        <Popup open={popup == 'waitingForAcknowledgement'}
               modal
               nested
               closeOnDocumentClick={false}
               closeOnEscape={false}>
            <div className="modal">
                <span className="bold center">Veuillez patienter...</span>
                <p>La (dé)réservation est en cours d'enregistrement...</p>
            </div>
        </Popup>
        <Popup open={popup == 'changesSaved'}
               modal
               nested
               closeOnDocumentClick={false}
               closeOnEscape={false}>
            <div className="modal">
                <span className="bold center">Modification enregistrée</span>
                <p>La (dé)réservation a été enregistrée !</p>
                <button onClick={() => {
                    setPopup(null)
                }}>Ok
                </button>
            </div>
        </Popup>
        <Popup open={popup == 'dbIsolationError'}
               modal
               nested
               closeOnDocumentClick={false}
               closeOnEscape={false}>
            <div className="modal">
                <span className="bold center">La base de donnée a déjà été modifiée</span>
                <p>Il semblerait que la base de donnée ait été modifiée par quelqu'un d'autre... Merci de
                    réessayer.</p>
                <button onClick={() => {
                    window.location.reload();
                }}>Ok
                </button>
            </div>
        </Popup>
    </>)
}