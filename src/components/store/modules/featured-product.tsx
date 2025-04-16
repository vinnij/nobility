"use client"

import { useProducts, useStoreData } from "@/hooks/store/use-storefront";
import { Button } from "@/components/ui/button";
import { InfoIcon, TrophyIcon } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { ProductDialog } from "../product-dialog";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedProduct() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { data: store } = useStoreData();
    const { data: storeSettings } = useStoreSettings();
    const { data: products, isLoading } = useProducts();

    if (!store || !store.id || !storeSettings?.featuredProductEnabled) return null;

    if (isLoading) {
        return (
            <div className="bg-secondary/15 border-border/5 backdrop-blur p-4 rounded-md space-y-2">
                <div className="flex gap-2.5 items-center">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-8 w-40" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="w-full aspect-square rounded-md" />
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-6 w-1/3 mx-auto" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        );
    }

    if (!products) return null;
    const product = products.find(p => p.id === storeSettings?.featuredProductId);

    if (!product) {
        return (
            <div className="text-center py-2">
                <h2 className="text-base font-bold tracking-wider uppercase text-muted-foreground">
                    No product found
                </h2>
            </div>
        )
    }

    return (
        <div className="bg-secondary/15 border-border/5 backdrop-blur p-4 rounded-md space-y-2">
            <h3 className="text-2xl font-semibold flex gap-2.5 items-center">
                <TrophyIcon
                    className="text-muted"
                />
                Featured Package
            </h3>
            <div className="group flex flex-col text-center">
                <div className="w-full relative">
                    <Image
                        src={product?.image_url ?? ""}
                        alt={product?.name ?? ""}
                        width={300}
                        height={300}
                        className="rounded-md w-full h-auto group-hover:scale-95 transition-transform duration-300"
                    />
                </div>
                <div className="w-full flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-wider uppercase mb-4">
                            {product.name}
                        </h2>
                        <div className="flex justify-center uppercase items-baseline mb-6">
                            <span className="text-green-500 text-xl font-medium">
                                {((product.pricing.sale_value ? product.pricing.price_final : product.price) / 100).toFixed(2)} {store?.currency}
                            </span>
                            {product.pricing.sale_value && (
                                <span className="text-red-600 text-lg italic opacity-50 ml-3 line-through font-normal">
                                    {(product.pricing.price_original / 100).toFixed(2)} {store?.currency}
                                </span>
                            )}
                        </div>
                    </div>
                    <ProductDialog
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        product={product}
                        trigger={<Button
                            size="lg"
                            variant="secondary"
                            className="w-full font-semibold"
                        >
                            <InfoIcon className="mr-2.5" />
                            View Package
                        </Button>}
                    />
                </div>
            </div>
        </div>
    )
}