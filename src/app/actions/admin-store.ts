"use server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getSiteSettings } from "./admin";
import { hasPermission } from "@/lib/permissions/permissions";

const BASE_URL = "https://api.paynow.gg/v1";

export const getOrders = async (customerId: string) => {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'user_full', action: 'read' })))) {
        return { error: "Unauthorized", status: 401 }
    }
    const { data: siteSettings } = await getSiteSettings()
    if (!siteSettings) {
        return { error: "Site settings not found", status: 500 }
    }
    if (!siteSettings?.storeId) {
        return { error: "Store ID not found", status: 500 }
    }
    return await fetchData(`/stores/${siteSettings.storeId}/orders?customer_id=${customerId}`, "GET");
}

export const getSubscriptions = async (customerId: string) => {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'user_full', action: 'read' })))) {
        return { error: "Unauthorized", status: 401 }
    }
    const { data: siteSettings } = await getSiteSettings()
    if (!siteSettings) {
        return { error: "Site settings not found", status: 500 }
    }
    if (!siteSettings.storeId) {
        return { error: "Store ID not found", status: 500 }
    }
    return await fetchData(`/stores/${siteSettings.storeId}/subscriptions?customer_id=${customerId}`);
}

export const getInventory = async (customerId: string) => {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'user_full', action: 'read' })))) {
        return { error: "Unauthorized", status: 401 }
    }
    const { data: siteSettings } = await getSiteSettings()
    if (!siteSettings) {
        return { error: "Site settings not found", status: 500 }
    }
    if (!siteSettings.storeId) {
        return { error: "Store ID not found", status: 500 }
    }
    return await fetchData(`/stores/${siteSettings.storeId}/customers/${customerId}/command_delivery`);
}

export const getProducts = async () => {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'user_full', action: 'read' })))) {
        return { error: "Unauthorized", status: 401 }
    }
    const { data: siteSettings } = await getSiteSettings()
    if (!siteSettings) {
        return { error: "Site settings not found", status: 500 }
    }
    if (!siteSettings.storeId) {
        return { error: "Store ID not found", status: 500 }
    }
    return await fetchData(`/stores/${siteSettings.storeId}/products`);
}

export const assignPackage = async (customerId: string, productId: string) => {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'user_grant', action: 'create' })))) {
        return { error: "Unauthorized", status: 401 }
    }
    const { data: siteSettings } = await getSiteSettings()
    if (!siteSettings) {
        return { error: "Site settings not found", status: 500 }
    }
    if (!siteSettings.storeId) {
        return { error: "Store ID not found", status: 500 }
    }
    return await fetchData(`/stores/${siteSettings.storeId}/customers/${customerId}/command_delivery`, "POST", {
        product_id: productId,
        quantity: 1
    });
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
            return { error: `Response status: ${response.status}`, status: response.status };
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            return { data };
        } else {
            const text = await response.text();
            return { data: text };
        }
    } catch (error) {
        console.log(error);
        return { error: "An unexpected error occurred", status: 500 };
    }
}