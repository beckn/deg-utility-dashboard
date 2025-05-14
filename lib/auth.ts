"use client"

import { api } from "./api";
import { useCookies } from 'react-cookie';
import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect } from "react";
import { strapiClient } from "./strapi";

export const useAuth = () => {
    const [cookies] = useCookies(["deg-auth-id"]);
    const [user, setUser] = useLocalStorage("deg-auth-user", null);

    // @ts-ignore
    const { data, mutateAsync, isPending } = api.useMutation("get", "/api/users/{id}", {
        params: {
            path: {
                id: cookies["deg-auth-id"]
            }
        },
        cache: "force-cache",
        onSuccess: (data: any) => {
            console.log("User data fetched", data);
            if (data) {
                setUser(data.user);
            }
        }
    })

    useEffect(() => {
        if (!user) {
            console.log("Fetching user data");
            mutateAsync({

            });
        }
    }, [])

    return {
        data: data ?? user,
        isPending,
    }

}

export const useAuthFunctions = () => {
    const [, setCookie] = useCookies(["deg-auth-id"]);
    const [user, saveUser] = useLocalStorage("deg-auth-user", null);

    // @ts-ignore
    const { mutateAsync: signIn } = api.useMutation("post", "/api/auth/local/register", {
        onSuccess: (data: any) => {
            setCookie("deg-auth-id", data.user.id)
            saveUser(data.user);
        }
    });

    // @ts-ignore
    const { mutateAsync: update } = api.useMutation("post", "/api/users/{id}", {
        onSuccess: (data: any) => {
            saveUser(data.user);
        }
    });


    const signOut = () => {
        setCookie("deg-auth-id", null);
    }

    return {
        user,
        signIn,
        signOut,
        update,
    }
}

export const signIn = async (data: {
    email: string,
    password: string,
}) => {
    // @ts-ignore
    return await strapiClient.POST("/api/auth/local", {
        params: {
            ...data
        }
    })
}

export const signUp = async (data: {
    email: string,
    password: string,
}) => {
    // @ts-ignore
    return await strapiClient.POST("/api/auth/local/register", {
        params: {
            ...data
        }
    })
}