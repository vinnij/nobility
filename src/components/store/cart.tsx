"use client";

import { MinusIcon, PlusIcon, ShoppingCartIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useCheckoutMutation, useSetCartItemMutation, useStoreData } from "@/hooks/store/use-storefront";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useCartContext } from "../context/store-context";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { toast } from "sonner";

export default function Cart() {
    const router = useRouter()
    // const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const { data: session, status } = useSession()
    const { data: store } = useStoreData();
    const { data: storeSettings } = useStoreSettings();
    const { cart, refetchCart, isLoading, isSuccess, isCartOpen, setIsCartOpen } = useCartContext();
    const { data, mutate, isSuccess: isCheckoutSuccess } = useCheckoutMutation();

    const cartMutation = useSetCartItemMutation();
    const handleCheckout = useCallback(() => {
        if (storeSettings && storeSettings.requireLinkedToPurchase && !session?.user?.discordId) {
            toast.error("Please link your Discord account to purchase this product.");
            return;
        }
        mutate({
            isSubscription: false,
            lines: cart ? cart.lines.map((line) => {
                return {
                    product_id: line.product_id,
                    quantity: line.quantity,
                }
            }) : []
        })
    }, [cart, session?.user?.discordId, storeSettings])

    useEffect(() => {
        console.log(data)
        if (isCheckoutSuccess) {
            router.push(data.url)
        }
    }, [isCheckoutSuccess]);

    useEffect(() => {
        if (cartMutation.isSuccess) {
            refetchCart();
        }
    }, [cartMutation.isSuccess])

    const setCartItem = (productId: string, amount: number) => {
        cartMutation.mutate({
            productId,
            qty: amount
        });
    }
    /* 
        const removeFromCart = (productId: string, amount: number) => {
            const cartItem = cart?.lines.find((cartItem) => cartItem.product_id === productId);
            if (!cartItem) {
                return;
            }
            if (cartItem.quantity === 1) {
                cartMutation.mutate({
                    productId,
                    qty: 0
                });
                return;
            }
            cartMutation.mutate({
                productId,
                qty: cartItem.quantity - amount
            });
        } */
    return (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
                <Button
                    size={"lg"}
                    variant={"secondary"}
                    className="flex flex-col h-20 max-w-56 w-full backdrop-blur-md bg-secondary/45 relative overflow-hidden group"
                    onClick={(event) => {
                        if (status === "loading") {
                            event.preventDefault();
                            return;
                        }

                        if (status === "unauthenticated") {
                            event.preventDefault();
                            return signIn("steam")
                        }
                    }}
                >
                    <ShoppingCartIcon
                        size={100}
                        className="absolute -rotate-45 z-0 opacity-5 right-0 group-hover:scale-125 duration-300"
                    />
                    <div className="flex flex-row items-center">
                        <span className="text-xl">View Cart</span>
                    </div>
                    {status === "unauthenticated" || status === "loading" ? (
                        <span className="text-xs text-muted-foreground uppercase">
                            {status === "loading" ? "Loading..." : "Sign in"}
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground uppercase">
                            {((cart?.total ?? 0) / 100).toFixed(2)} {store?.currency}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-secondary/15 backdrop-blur-md border-border/15 p-0 md:max-w-md w-10/12">
                <SheetHeader className="relative group overflow-hidden bg-secondary px-6 py-8">
                    <SheetTitle className="select-none flex items-center uppercase gap-2.5 text-2xl font-bold">
                        <ShoppingCartIcon
                            size={25}
                            className=""
                        />
                        Your Cart
                    </SheetTitle>
                    <SheetDescription className="select-none  font-semibold">
                        {cart?.lines.length ?? 0} items - {((cart?.total ?? 0) / 100).toFixed(2)} <span className="uppercase">{store?.currency}</span>
                    </SheetDescription>
                    <ShoppingCartIcon
                        size={150}
                        className="absolute z-0 opacity-5 -top-5 right-0 group-hover:scale-125 duration-300"
                    />
                </SheetHeader>
                {isLoading ? (
                    <div className="text-muted-foreground text-center py-12">Loading Cart...</div>
                ) : (null)}
                {isSuccess ? (
                    <div className="py-6 px-6 space-y-4">
                        {cart?.lines.map((product) => (
                            <div
                                className="flex flex-row justify-between bg-secondary/15 rounded-md py-2 px-4"
                                key={product.product_id}
                            >
                                <div className="">
                                    <div className="font-semibold text-base">{product.name}</div>
                                    <div className="font-normal text-sm text-muted-foreground uppercase">
                                        {(product.price / 100).toFixed(2)} {store?.currency}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Button
                                        size={"icon"}
                                        variant={"destructive"}
                                        className="h-8 w-8"
                                        onClick={() => setCartItem(product.product_id, product.quantity === 1 ? 0 : product.quantity - 1)}
                                        disabled={cartMutation.isPending}
                                    >
                                        <MinusIcon size={18} />
                                    </Button>
                                    <div className="font-normal select-none bg-secondary/15 rounded h-8 w-8 flex items-center justify-center">
                                        {product.quantity}
                                    </div>
                                    <Button
                                        size={"icon"}
                                        variant={"secondary"}
                                        className="h-8 w-8 bg-green-700 hover:bg-green-800"
                                        onClick={() => setCartItem(product.product_id, product.quantity + 1)}
                                        disabled={cartMutation.isPending}
                                    >
                                        <PlusIcon size={18} />
                                    </Button>
                                    <Button
                                        size={"icon"}
                                        variant={"ghost"}
                                        className="h-8 w-8"
                                        onClick={() => setCartItem(product.product_id, 0)}
                                        disabled={cartMutation.isPending}
                                    >
                                        <Trash2Icon size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (null)}
                <div className="px-6">
                    {cart && cart.lines.length > 0 ? (
                        <Button
                            size={"lg"}
                            className="w-full h-12 font-bold tracking-wide uppercase"
                            onClick={handleCheckout}
                        >Checkout</Button>
                    ) : (
                        <div className="text-center select-none mt-5">
                            <span className="text-base text-muted-foreground">Your cart is empty.</span>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet >
    )
}