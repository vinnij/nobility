import { Suspense } from "react";
import Content from "./content";
import { getMetadata } from "@/lib/metadata";

// Function to dynamically generate metadata for this specific page
export const metadata = async () => {
    // Fetch the metadata for the page with the slug 'about'
    return await getMetadata('terms-of-service');
};

export default function TermsPage() {
    return (
        <Suspense>
            <Content />
        </Suspense>
    );
}
