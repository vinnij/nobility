"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCart, useSetCartItemMutation } from "@/hooks/store/use-storefront";
import { Cart } from '@/types/store';

interface CartContextType {
    cart?: Cart; // Replace 'any' with your actual cart type
    isLoading: boolean;
    isSuccess: boolean;
    refetchCart: () => void;
    setCartItem: (productId: string, amount: number) => void;
    isCartOpen: boolean;
    setIsCartOpen: (isCartOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const { data: cart, refetch: refetchCart, isLoading, isSuccess } = useCart();
    const cartMutation = useSetCartItemMutation();

    const setCartItem = (productId: string, amount: number) => {
        cartMutation.mutate({
            productId,
            qty: amount
        });
    };

    useEffect(() => {
        if (cartMutation.isSuccess) {
            refetchCart();
        }
    }, [cartMutation.isSuccess]);

    return (
        <CartContext.Provider value={{
            cart,
            isLoading,
            isSuccess,
            refetchCart,
            setCartItem,
            isCartOpen,
            setIsCartOpen
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCartContext() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCartContext must be used within a CartProvider');
    }
    return context;
}