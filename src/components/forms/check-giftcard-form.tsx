"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { checkGiftcard } from "@/app/actions/store-manage";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

export default function CheckGiftcardForm() {
    const [cardNumber, setCardNumber] = useState<string>("");

    const { data, ...query } = useQuery({
        queryKey: ["paynow-giftcard", cardNumber],
        queryFn: () => checkGiftcard(cardNumber),
        enabled: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })

    function submit() {
        if (cardNumber.length <= 3) {
            toast.error("This is an invalid gift card");
            return;
        }
        query.refetch()
    }

    return (
        <div className="space-y-2.5">
            {query.isSuccess && data?.data?.length > 0 ? (
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <span>Balance: <span className="text-foreground">{(data?.data[0].balance / 100).toFixed(2)} <span className="text-muted-foreground">of</span> {(data?.data[0].starting_balance / 100).toFixed(2)}</span></span>
                    <span>Used: <span className="text-foreground">{((data?.data[0].starting_balance - data?.data[0].balance) / 100).toFixed(2)}</span></span>
                    <span>Expires: <span className="text-foreground">{data?.data[0].expires_at ? new Date(data?.data[0].expires_at).toDateString() : "Never"}</span></span>
                </div>
            ) : null}
            <Input
                placeholder="Card Number"
                value={cardNumber}
                onChange={(event) => setCardNumber(event.target.value)}
                className="border-input/30"
            />
            <Button
                className="w-full"
                onClick={submit}
                disabled={query.isFetching || query.isRefetching}
            >
                {query.isFetching || query.isRefetching ? (
                    <Loader2Icon className="animate-spin" />
                ) : "Check"}
            </Button>
        </div>
    )
}