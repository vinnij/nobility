"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/types/store";
import Image from "next/image";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductCardProps {
    product: Product;
    isPending: boolean
    onSelect: (productId: string) => void;
}

export function ProductCard({ product, isPending,onSelect }: ProductCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleConfirm = () => {
        onSelect(product.id);
    };

    return (
        <Card className="p-4 flex items-center justify-between flex-row">
            <CardHeader className="p-0 flex flex-row items-center gap-2">
                {product.image_url && (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        width={65}
                        height={65}
                    />
                )}
                <CardTitle className="text-sm font-medium">
                    {product.name}
                </CardTitle>
            </CardHeader>
            <CardFooter className="p-0 flex items-center h-full">
                <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                    <AlertDialogTrigger asChild>
                        <Button>Select</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Selection</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to select {product.name}?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
                                {isPending ? "Confirming..." : "Confirm"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
}