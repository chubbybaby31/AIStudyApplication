import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthDetails = ({ setIsAuthenticated, authUser, setAuthUser }) => {

    useEffect(() => {
        const listen = onAuthStateChanged(auth, (user) => {
            if (user) {
                setAuthUser(user)
                setIsAuthenticated(true)
            } else {
                setAuthUser(null)
                setIsAuthenticated(false)
            }
        })

        return() => {
            listen()
        }
    }, [])

    const userSignOut = () => {
        signOut(auth).then(() => {
            console.log('sign out was successful')
            setIsAuthenticated(false)
        }).catch(error => console.log(error))
        setIsAuthenticated(false)
    }

    return (
        <div>
            { authUser ? <><p>{`Signed In as ${authUser.email}`}</p><button onClick={userSignOut}>Sign Out</button></> : <p>Signed Out</p>}
        </div>
    )
}

export default AuthDetails