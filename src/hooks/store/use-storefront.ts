"use client";

import { getSiteSettings } from '@/app/actions/admin';
import { createCustomerToken, getOrders } from '@/app/actions/store-manage';
import { Cart, CheckoutRequestLineObject, Customer, NavLink, Order, Product, Subscription, Tag } from '@/types/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { toast } from 'sonner';


const BASE_URL = "https://api.paynow.gg/v1";

interface SiteSettings {
    name: string;
    id: number;
    storeId: string | null;
    ownerId: string | null;
    discordInvite: string | null;
    steamGroupId: string | null;
    steamGroupUrl: string | null;
    rustalyzerEnabled: boolean;
    copyServerAddress: boolean;
    currency: string;
}

interface PayNowResponse {
    token: string;
    storeId: string;
}

interface PayNowError {
    message: string;
    status: number;
}

interface ServerResponse<T> {
    data: T | null;
    error?: string;
    status?: number;
}

interface PayNowApiResponse<T> {
    data: T;
    message?: string;
    status: number;
}

export function useStoreData() {
    const query = useQuery({
        queryKey: ['store-data'],
        queryFn: async () => {
            const result = await getSiteSettings();
            if (result.error) {
                throw new Error(result.error);
            }
            return result.data as SiteSettings | null;
        },
    });

    return {
        data: query.data ?? null,
        storeId: query.data?.storeId ?? null,
        isLoading: query.isLoading,
        error: query.error,
    };
}

export function useTags() {
    return useQuery<Tag>({
        queryKey: ["paynow-store-tags"],
        queryFn: () => fetchData("/store/tags"),
        staleTime: 5 * 60 * 1000
    })
}

export function useNavlinks() {
    return useQuery<NavLink[]>({
        queryKey: ["paynow-store-navlinks"],
        queryFn: () => fetchData("/store/navlinks"),
        staleTime: 5 * 60 * 1000
    })
}

export function useProducts() {
    return useQuery<Product[]>({
        queryKey: ["paynow-store-products"],
        queryFn: () => fetchData("/store/products"),
        staleTime: 5 * 60 * 1000
    })
}

/* export function useOrders(storeId: string | null) {
    return useQuery<Order[]>({
        queryKey: ['orders', storeId],
        queryFn: async () => {
            if (!storeId) {
                throw new Error('Store ID is required');
            }
            const response = await fetch(`${BASE_URL}/stores/${storeId}/orders`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch orders');
            }
            const result: PayNowApiResponse<PayNowOrder[]> = await response.json();
            return result.data;
        },
        enabled: !!storeId,
    });
} */

export function useOrders() {
    return useQuery<Order[]>({
        queryKey: ["paynow-user-orders"],
        queryFn: async () => {
            const response = await getOrders();
            if (response.error) throw new Error(response.error);
            return response.data;
        },
        staleTime: 5 * 60 * 1000
    })
}


export function useCreateOrder() {
    return useMutation<PayNowResponse, PayNowError, { storeId: string }>({
        mutationFn: async ({ storeId }) => {
            const response = await fetch(`${BASE_URL}/stores/${storeId}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result: PayNowApiResponse<PayNowResponse> = await response.json();

            if (!response.ok) {
                throw {
                    message: result.message || 'Failed to create order',
                    status: response.status,
                };
            }

            return result.data;
        },
    });
}

// NEEEDS CUSTOMER AUTH

export function useCart() {
    return useQuery<Cart>({
        queryKey: ['paynow-get-cart'],
        queryFn: () => fetchData("/store/cart"),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    })
}

export function useCustomer() {
    return useQuery<Customer>({
        queryKey: ['paynow-store-customer'],
        queryFn: () => fetchData("/store/customer"),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    })
}

export function useSubscriptions() {
    return useQuery<Subscription[]>({
        queryKey: ['paynow-store-customer-subscriptions'],
        queryFn: () => fetchData("/store/customer/subscriptions"),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000
    })
}

export function useCancelSubscriptionMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ subscriptionId }: { subscriptionId: string }) => fetchData(`/store/customer/subscriptions/${subscriptionId}`, "DELETE"),
        onError: (error) => {
            toast.error(error.message)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['paynow-store-customer-subscriptions'] })
            toast.success("Subscription canceled")
        }
    });
}

export function useSetCartItemMutation() {
    return useMutation({
        mutationFn: ({ productId, qty }: { productId: string, qty: number }) => fetchData(`/store/cart/lines?product_id=${productId}&quantity=${qty}`, "PUT"),
        onError: (error) => {
            toast.error(error.message)
        }
    });
}

export function useCheckoutMutation() {
    return useMutation({
        mutationFn: ({ isSubscription, lines }: {
            isSubscription: boolean,
            lines: CheckoutRequestLineObject[]
        }) => fetchData("/checkouts", "POST", {
            subscription: isSubscription,
            lines
        }),
        onError: (error) => {
            toast.error(error.message)
        }
    });
}

async function fetchData(endpoint: string, method: string = "GET", body?: any) {
    try {
        const session = await getSession();
        let customerToken = localStorage.getItem("paynow-customer-token")
        if (customerToken && !session?.user) {
            localStorage.removeItem("paynow-customer-token")
            customerToken = null
        }
        if (!customerToken) {
            const { data } = await createCustomerToken();
            if (data?.token) {
                localStorage.setItem("paynow-customer-token", data.token)
                customerToken = data.token
            }
        }

        const { data: siteSettings } = await getSiteSettings()
        if (!siteSettings) {
            throw new Error("Site settings not found")
        }
        if (!siteSettings.storeId) {
            throw new Error("Store ID not found")
        }   
        let responseBody: any = {
            method,
            headers: {
                "Content-Type": "application/json",
                "x-paynow-store-id": siteSettings.storeId
            },
        }
        if (customerToken) {
            responseBody = {
                ...responseBody,
                headers: {
                    ...responseBody.headers,
                    "Authorization": `customer ${customerToken}`
                }
            }
        }
        if (body) {
            responseBody = {
                ...responseBody,
                body: JSON.stringify(body)
            };
        }
        const response = await fetch(`${BASE_URL}${endpoint}`, responseBody);
        if (!response.ok) {
            const data = await response.json();
            throw new Error(`Response status: ${data.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return await response.json();
        } else {
            return await response.text();
        }
    } catch (error) {
        console.error(error);
    }
}