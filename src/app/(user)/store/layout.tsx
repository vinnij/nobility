import { GiftIcon, TrophyIcon } from "lucide-react";
import StoreAlert from "./store-alert";
import Cart from "@/components/store/cart";
import DynamicBreadcrumbs from "@/components/dynamic-breadcrumbs";
import CheckGiftcardForm from "@/components/forms/check-giftcard-form";
import { Suspense } from "react";
import { CartProvider } from "@/components/context/store-context";
import FeaturedProduct from "@/components/store/modules/featured-product";
import NeedSupport from "@/components/store/modules/need-support";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <CartProvider>
            <div className="container mx-auto pt-40"> {/* max-w-screen-lg */}
                <div className="flex flex-col gap-6 md:gap-0 md:flex-row items-center md:items-end justify-between">
                    <div className="uppercase text-center md:text-left font-medium">
                        <span className="text-sm text-muted-foreground">Welcome to the official</span>
                        <h1 className="text-4xl font-bold text-foreground">Noble Store</h1>
                    </div>
                    <Cart
                    />
                </div>
                <div className="grid grid-cols-12 gap-4 my-8 w-full">
                    <div className="col-span-12 md:col-span-9 w-full flex flex-col gap-4">
                        <StoreAlert />
                        <div className="">
                            <Suspense>
                                <DynamicBreadcrumbs />
                            </Suspense>
                        </div>
                        {children}
                    </div>
                    <div className="col-span-12 md:col-span-3 w-full space-y-4">
                        <div className="bg-secondary/15 border-border/5 backdrop-blur p-4 rounded-md space-y-2">
                            <h3 className="text-2xl font-semibold flex gap-2.5 items-center">
                                <GiftIcon
                                    className="text-muted"
                                />
                                Check Giftcard
                            </h3>
                            <CheckGiftcardForm />
                        </div>
                        <FeaturedProduct />
                        <NeedSupport />
                    </div>
                </div>
            </div>
        </CartProvider>
    )
}