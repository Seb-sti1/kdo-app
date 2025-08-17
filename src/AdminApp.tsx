import React, {FormEvent, useState} from "react";
import {GiftData} from "./Gist.ts";
import {EditableGift} from "./EditableGift.tsx";
import Popup from "reactjs-popup";
import {v4 as uuidv4} from 'uuid';
import "./style/adminApp.scss"

interface UserAppProps {
    giftsData: GiftData[],
    deleteCallback: (uid: string) => Promise<PopupType | null>,
    createOrEditCallback: (gift: GiftData) => Promise<PopupType | null>,
}


export type PopupType = "edit" | "create"
    | "waitingForAcknowledgement"
    | "changesSaved"
    | "dbIsolationError"

function getSubdivisionsValues(): string[] {
    const inputs = document.querySelectorAll<HTMLInputElement>(
        'input[name="subdivisions[]"]'
    );
    return Array.from(inputs).map((input) => input.value);
}

export const AdminApp: React.FC<UserAppProps> = ({giftsData, deleteCallback, createOrEditCallback}) => {
    const [popup, setPopup] = useState<PopupType | null>(null)
    const [editedGift, setEditedGift] = useState<GiftData | null>(null)

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
                        <EditableGift key={gift.uid}
                                      gift={gift}
                                      deleteCallback={
                                          () => {
                                              setPopup("waitingForAcknowledgement")
                                              deleteCallback(gift.uid).then(setPopup)
                                          }
                                      }
                                      editCallback={() => {
                                          setEditedGift(gift)
                                      }}
                        />
                    ))}
            <div className="gift">
                <button onClick={() => {
                    setPopup("create")
                    setEditedGift({
                        uid: uuidv4(),
                        name: "",
                        buyers: [null],
                        order: 1,
                    })
                }}>Ajouter un nouveau
                </button>
            </div>
        </div>
        <Popup open={editedGift != null}
               onClose={() => setEditedGift(null)}
               modal
               nested>
            <div className="modal">
                <span className="bold center">{popup == "edit" ? "Modifier un cadeau" : "Créer un cadeau"}</span>
                <form onSubmit={(e: FormEvent) => {
                    e.preventDefault()

                }} className="editForm">
                    <label> Nom : <input type="text" name="name" value={editedGift?.name} onChange={(event) => {
                        setEditedGift((currentValue) => {
                            if (currentValue == null) return null
                            return {
                                ...currentValue,
                                name: event.target.value,
                            }
                        })
                    }} required/></label>
                    <br/>
                    <label> Order de préférence : <input type="number" name="order" value={editedGift?.order}
                                                         onChange={(event) => {
                                                             setEditedGift((currentValue) => {
                                                                 if (currentValue == null) return null
                                                                 return {
                                                                     ...currentValue,
                                                                     order: parseInt(event.target.value),
                                                                 }
                                                             })
                                                         }} required/></label>
                    <br/>
                    <label> Description : <textarea name="description" value={editedGift?.description}
                                                    onChange={(event) => {
                                                        setEditedGift((currentValue) => {
                                                            if (currentValue == null) return null
                                                            return {
                                                                ...currentValue,
                                                                description: event.target.value == "" ? undefined : event.target.value,
                                                            }
                                                        })
                                                    }}></textarea></label>
                    <br/>
                    <div>
                        <label>Subdivisions :</label>
                        <div id="subdivisionsContainer">
                            {editedGift?.subdivisions?.map((subdivision, index) => (
                                <input type="text" name="subdivisions[]" key={index} value={subdivision}
                                       onChange={() => {
                                           setEditedGift((currentValue) => {
                                               if (currentValue == null) return null
                                               const currentSubdivision = getSubdivisionsValues()
                                               const newSubdivision = currentSubdivision.filter((sub) => sub.length > 0)
                                               const newBuyers = editedGift?.buyers.filter((_, index) => currentSubdivision[index].length > 0)
                                               if (newSubdivision.length == 0) {
                                                   return {
                                                       ...currentValue,
                                                       subdivisions: undefined,
                                                       buyers: [null],
                                                   };
                                               } else {
                                                   return {
                                                       ...currentValue,
                                                       subdivisions: newSubdivision,
                                                       buyers: newBuyers
                                                   }
                                               }
                                           })
                                       }}/>
                            ))}
                            <button type="button" onClick={() => {
                                setEditedGift((currentValue) => {
                                    if (currentValue == null) return null
                                    return {
                                        ...currentValue,
                                        subdivisions: currentValue.subdivisions == null ? ["Subdivision 1"] : [...currentValue!.subdivisions, `Subdivision ${currentValue!.subdivisions?.length + 1}`],
                                        buyers: currentValue.subdivisions == null ? [null] : [...currentValue!.buyers, null]
                                    }
                                })
                            }}>+
                            </button>
                        </div>
                    </div>
                    <label> Lien externe : <input type="url" name="link" value={editedGift?.link}
                                                  onChange={(event) => {
                                                      setEditedGift((currentValue) => {
                                                          if (currentValue == null) return null
                                                          return {
                                                              ...currentValue,
                                                              link: event.target.value == "" ? undefined : event.target.value,
                                                          }
                                                      })
                                                  }}/></label>
                    <br/>
                    <label> Prix : <input type="number" name="price" step="0.01" value={editedGift?.price}
                                          onChange={(event) => {
                                              setEditedGift((currentValue) => {
                                                  if (currentValue == null) return null
                                                  return {
                                                      ...currentValue,
                                                      price: event.target.value == "" ? undefined : parseFloat(event.target.value),
                                                  }
                                              })
                                          }}/></label>
                    <br/>
                    <button type="submit" onClick={() => {
                        if (editedGift != null) {
                            createOrEditCallback(editedGift)
                                .then(setPopup)
                            setEditedGift(null)
                            setPopup("waitingForAcknowledgement")
                        }
                    }}>Submit
                    </button>
                </form>
            </div>
        </Popup>
        <Popup open={popup == 'waitingForAcknowledgement'}
               modal
               nested
               closeOnDocumentClick={false}
               closeOnEscape={false}>
            <div className="modal">
                <span className="bold center">Veuillez patienter...</span>
                <p>Les modifications sont en cours d'enregistrement...</p>
            </div>
        </Popup>
        <Popup open={popup == 'changesSaved'}
               modal
               nested
               closeOnDocumentClick={false}
               closeOnEscape={false}>
            <div className="modal">
                <span className="bold center">Modifications enregistrées</span>
                <p>Les modifications ont été enregistrées !</p>
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