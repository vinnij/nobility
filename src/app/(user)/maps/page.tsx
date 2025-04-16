import MapsContainer from "@/components/maps/maps-container";
import { getMetadata } from "@/lib/metadata";

// Function to dynamically generate metadata for this specific page
export const metadata = async () => {
    // Fetch the metadata for the page with the slug 'about'
    return await getMetadata('maps');
};

export default function MapsPage() {
    return (
        <div className="container mx-auto py-8 pt-40">
            <div className="flex flex-col items-center pb-8 text-center">
                <h2 className="mt-2 text-center text-4xl font-bold">Maps</h2>
                <p className="max-w-[80ch] bg-transparent px-8 text-center leading-8 text-black/60 lg:px-0 dark:text-white/50">
                    Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </p>
            </div>
            <MapsContainer />
        </div>
    )
}