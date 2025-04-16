"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductList } from "./product-list";
import { Suspense } from "react";
import { useMutation } from "@tanstack/react-query";
import { assignPackage } from "@/app/actions/admin-store";
import { toast } from "sonner";

export function GiftPackage({ customerId }: { customerId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (productId: string) => {
      const result = await assignPackage(customerId, productId);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to assign package");
    }
  });

  const handleProductSelect = (productId: string) => {
    mutation.mutate(productId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" className="w-fit md:w-full justify-start">
          <Package className="mr-2 h-4 w-4" />
          Gift Package
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Select a Product to Gift</DialogTitle>
        </DialogHeader>
        <Suspense fallback={<div>Loading products...</div>}>
          <ProductList
            isPending={mutation.isPending}
            onProductSelect={handleProductSelect}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}