"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default function Rules() {
    return (
        <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
                <AccordionTrigger>Cheating and Exploiting</AccordionTrigger>
                <AccordionContent>
                    Cheating, scripting or modifying your gameplay in any way to cause an unfair advantage is not allowed on our servers. Exploiting is punished the same, if you report a bug you will get rewarded, just make a ticket.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>Racism and Homophobia</AccordionTrigger>
                <AccordionContent>
                    We have a zero tolerance for any form of racism or homophobia. This includes, our discord server, game chat, drawing on signs, and speaking voice chat.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>No Advertising</AccordionTrigger>
                <AccordionContent>
                    You are not permitted to advertise other organizations on our Network. It is at our discretion what classifies as advertisement.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
                <AccordionTrigger>Team Limits</AccordionTrigger>
                <AccordionContent>
                    All teams must be under 6 players in total, this includes sleepers. Roams teams, and abusive player swapping is not allowed.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
                <AccordionTrigger>You can change me!</AccordionTrigger>
                <AccordionContent>
                    You can easily edit the text of these rules in <code className="bg-gray-200/15 p-1 rounded-md">src/components/home/rules.tsx</code>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}