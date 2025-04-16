import StoreContent from "@/components/store/store-content";
import { prisma } from "@/lib/db";
import { getMetadata } from "@/lib/metadata";

// Function to dynamically generate metadata for this specific page
export const metadata = async () => {
    // Fetch the metadata for the page with the slug 'about'
    return await getMetadata('store');
};

export default function Page({ params }: { params: { slug: string[] } }) {
    return (
        <StoreContent params={params} />
    )
}