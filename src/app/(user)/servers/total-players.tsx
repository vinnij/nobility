"use client";

import useServerData from "@/hooks/use-server-data";
import { useMemo } from "react";

export default function TotalPlayers() {

    const serverQueries = useServerData();
    const totalPlayers = useMemo(() => serverQueries.reduce((acc, query) => {
        if (query.data) {
            return acc + query.data.attributes.players;
        }
        return acc;
    }, 0), [serverQueries]);

    return (
        <div className="select-none text-center bg-secondary/20 my-4 py-2 px-4 rounded-lg">
            <h1 className="text-muted-foreground">There are currently <span className="font-extrabold px-0.5">{totalPlayers}</span> players online.</h1>
        </div>
    )
}