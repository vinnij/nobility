"use client";

import { Product } from "@/types/store";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ShoppingCart, Check, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import GiftButton from "./gift-button";
import { useSetCartItemMutation, useStoreData, useCheckoutMutation } from "@/hooks/store/use-storefront";
import { useCartContext } from "../context/store-context";
import { useCallback, useEffect, useState, ReactNode } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { toast } from "sonner";

interface ProductDialogProps {
    product: Product;
    trigger: ReactNode | ((open: boolean) => ReactNode);
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export function ProductDialog({ product, trigger, isOpen, setIsOpen }: ProductDialogProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { data: store } = useStoreData();
    const { data: storeSettings } = useStoreSettings();
    const { cart, refetchCart, isCartOpen, setIsCartOpen } = useCartContext();
    const cartMutation = useSetCartItemMutation();
    const { data: checkoutData, mutate: mutateCheckout, isSuccess: isCheckoutSuccess } = useCheckoutMutation();

    const [justAdded, setJustAdded] = useState(false);
    const isInCart = cart?.lines.some((item) => item.product_id === product.id);

    useEffect(() => {
        if (isCheckoutSuccess) {
            router.push(checkoutData.url)
        }
    }, [isCheckoutSuccess, checkoutData?.url, router]);

    useEffect(() => {
        if (cartMutation.isSuccess) {
            refetchCart();
        }
    }, [cartMutation.isSuccess, refetchCart])

    const handleCheckout = useCallback(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") return signIn("steam");
        if (storeSettings &&  storeSettings.requireLinkedToPurchase && !session?.user?.discordId) {
            toast.error("Please link your Discord account to purchase this product.");
            return;
        }

        mutateCheckout({
            isSubscription: product.allow_subscription,
            lines: [{ product_id: product.id, quantity: 1 }]
        })
    }, [status, product.allow_subscription, product.id, mutateCheckout, storeSettings, session?.user?.discordId]);

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

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {typeof trigger === 'function' ? trigger(isOpen) : trigger}
            </DialogTrigger>
            <DialogContent className="flex flex-col md:flex-row max-h-[85vh] h-full overflow-y-auto md:overflow-y-hidden max-w-6xl bg-secondary/15 border-border/5 backdrop-blur">
                <DialogHeader className="md:max-w-[33%] w-full">
                    <div className="w-full">
                        <img
                            src={product.image_url ?? ""}
                            alt={product.name}
                            className="mx-auto rounded-md group-hover:scale-90 duration-300"
                        />
                    </div>
                    <DialogTitle className="py-7 my-auto w-full">
                        <div className="block text-xl font-bold tracking-wider uppercase text-center">
                            {product.name}
                        </div>
                        <div className="flex justify-center uppercase items-start mt-3">
                            <span className="text-green-500 text-lg font-medium">
                                {((product.pricing.sale_value ? product.pricing.price_final : product.price) / 100).toFixed(2)} {store?.currency}
                            </span>
                            {product.pricing.sale_value ? (
                                <span className="text-red-600 text-base italic opacity-50 ml-3 line-through font-normal">
                                    {(product.pricing.price_original / 100).toFixed(2)} {store?.currency}
                                </span>
                            ) : null}
                        </div>
                    </DialogTitle>
                    <div className="flex flex-col gap-2.5">
                        <Button
                            size="lg"
                            variant="default"
                            onClick={addToCart}
                            disabled={cartMutation.isPending || isInCart}
                            className="flex items-center gap-2.5 font-semibold"
                        >
                            {cartMutation.isPending ? (
                                <Loader2 className="animate-spin" />
                            ) : justAdded || isInCart ? (
                                <Check size={18} />
                            ) : (
                                <ShoppingCart size={18} />
                            )}
                            {cartMutation.isPending ? "Adding..." : (justAdded ? "Added To Cart" : (isInCart ? "Already In Cart" : "Add To Cart"))}
                        </Button>
                        {product.allow_subscription && (
                            <Button
                                size="lg"
                                variant="secondary"
                                onClick={handleCheckout}
                                className="flex items-center gap-2.5 font-semibold"
                            >
                                <ShoppingBag size={18} />
                                Subscribe
                            </Button>
                        )}
                        <GiftButton product={product} />
                    </div>
                </DialogHeader>
                <DialogDescription />
                <div className="h-full flex-grow mt-2.5 px-4 md:overflow-y-auto">
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
