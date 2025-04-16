"use client";

import { useSetCartItemMutation, useStoreData } from "@/hooks/store/use-storefront";
import { Product } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Check, InfoIcon, Loader2, ShoppingCart } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ProductDialog } from "./product-dialog";
import { signIn, useSession } from "next-auth/react";
import { useCartContext } from "../context/store-context";

export default function DisplayProduct({ product }: { product: Product }) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { data: store } = useStoreData();
    const { status } = useSession();
    const { cart, refetchCart, isCartOpen, setIsCartOpen } = useCartContext();
    const cartMutation = useSetCartItemMutation();
    const [justAdded, setJustAdded] = useState(false);
    const isInCart = cart?.lines.some((item) => item.product_id === product.id);
    const addToCart = useCallback(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") return signIn("steam");

        const cartItem = cart?.lines.find((item) => item.product_id === product.id);
        cartMutation.mutate({
            productId: product.id,
            qty: cartItem ? cartItem.quantity + 1 : 1
        });

        setJustAdded(true);

        setTimeout(() => setJustAdded(false), 2000);
        if (!isCartOpen) {
            setIsCartOpen(true);
        }
    }, [status, cart, cartMutation, product.id, isCartOpen, setIsCartOpen]);

    useEffect(() => {
        if (cartMutation.isSuccess) {
            refetchCart();
        }
    }, [cartMutation.isSuccess, refetchCart])

    return (
        <div key={product.id} className="group flex flex-col justify-end bg-secondary/15 border-border/5 backdrop-blur p-4 rounded-md">
            <div className="w-full" onClick={() => setIsOpen(true)}>
                <img
                    src={product.image_url ?? ""}
                    alt={product.name}
                    className="cursor-pointer mx-auto rounded-md group-hover:scale-90 duration-300"
                />
            </div>
            <div className="">
                <div className="py-7 my-auto w-full">
                    <span className="block text-xl font-bold tracking-wider uppercase text-center">
                        {product.name}
                    </span>
                    <div className="flex justify-center uppercase items-start mt-3">
                        <span className="text-green-500 text-lg font-medium">
                            {((product.pricing.sale_value ? product.pricing.price_final : product.price) / 100).toFixed(2)} {store?.currency}
                        </span>
                        {product.pricing.sale_value && product.pricing.sale_value > 0 ? (
                            <span className="text-red-600 text-base italic opacity-50 ml-3 line-through font-normal">
                                {(product.pricing.price_original / 100).toFixed(2)} {store?.currency}
                            </span>
                        ) : null}
                    </div>
                </div>
                <div className="flex gap-2">
                    <ProductDialog
                        product={product}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        trigger={<Button
                            size="lg"
                            variant="secondary"
                            className="font-semibold px-4"
                            onClick={() => setIsOpen(true)}
                        >
                            <InfoIcon size={18} />
                        </Button>}
                    />
                    <Button
                        size="lg"
                        variant="secondary"
                        className="w-full flex-grow font-semibold"
                        onClick={addToCart}
                        disabled={cartMutation.isPending || isInCart}
                    >
                        {cartMutation.isPending ? (
                            <Loader2 className="animate-spin mr-2" />
                        ) : justAdded || isInCart ? (
                            <Check className="mr-2" size={18} />
                        ) : (
                            <ShoppingCart className="mr-2" size={18} />
                        )}
                        {cartMutation.isPending ? "Adding..." : (justAdded ? "Added To Cart" : (isInCart ? "Already In Cart" : "Add To Cart"))}
                    </Button>
                </div>
            </div>
        </div>
    )
}