"use server";

import { config } from "@/config/site";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getSiteSettings } from "./admin";

const BASE_URL = "https://api.paynow.gg/v1";

export const findCustomer = async (steamId: string) => {
    const { data: siteSettings } = await getSiteSettings()
    if (!siteSettings) {
        return { error: "Site settings not found", status: 500 }
    }
    if (!siteSettings.storeId) {
        return { error: "Store ID not found", status: 500 }
    }
    return await fetchData(`/stores/${siteSettings.storeId}/customers/lookup?steam_id=${steamId}`, "GET");
}

export const createCustomer = async (steamId: string) => {
    const { data: siteSettings } = await getSiteSettings()
    if (!siteSettings) {
        return { error: "Site settings not found", status: 500 }
    }
    if (!siteSettings.storeId) {
        return { error: "Store ID not found", status: 500 }
    }
    return await fetchData(`/stores/${siteSettings.storeId}/customers`, "POST", { steam_id: steamId })
}

export async function createCustomerToken() {
    const session = await getServerSession(authOptions())
    if (!session || !session.user) {
        return { error: "Unauthorized", status: 401 }
    }
    const { data: siteSettings } = await getSiteSettings()
    if (!siteSettings) {
        return { error: "Site settings not found", status: 500 }
    }
    if (!siteSettings.storeId) {
        return { error: "Store ID not found", status: 500 }
    }
    return await fetchData(`/stores/${siteSettings.storeId}/customers/${session.user.storeId}/tokens`, "POST");
}

export const getOrders = async () => {
    const session = await getServerSession(authOptions())
    if (!session || !session.user) {
        return { error: "Unauthorized", status: 401 }
    }
    const { data: siteSettings } = await getSiteSettings()
    if (!siteSettings) {
        return { error: "Site settings not found", status: 500 }
    }
    if (!siteSettings.storeId) {
        return { error: "Store ID not found", status: 500 }
    }
    return await fetchData(`/stores/${siteSettings.storeId}/orders?customer_id=${session.user.storeId}`, "GET");
}

export const checkGiftcard = async (cardNumber: string) => {
    const { data: siteSettings } = await getSiteSettings()
    if (!siteSettings) {
        return { error: "Site settings not found", status: 500 }
    }
    if (!siteSettings.storeId) {
        return { error: "Store ID not found", status: 500 }
    }
    return await fetchData(`/stores/${siteSettings.storeId}/giftcards?code=${cardNumber}`, "GET");
}

async function fetchData(endpoint: string, method: string = "GET", body?: any) {
    try {
        let responseBody: any = {
            method,
            headers: {
                "Authorization": `apikey ${process.env.PAYNOW_KEY}`
            },
        }

        if (body) {
            responseBody = {
                ...responseBody,
                body: JSON.stringify(body)
            };
        }
        const response = await fetch(`${BASE_URL}${endpoint}`, responseBody);
        if (!response.ok) {
            const error = await response.json();    
            return { error: error.message || "Request failed", status: response.status };
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            return { data };
        } else {
            return { error: "Invalid response format", status: 500 };
        }
    } catch (error) {
        console.log(error);
        return { error: "An unexpected error occurred", status: 500 };
    }
}