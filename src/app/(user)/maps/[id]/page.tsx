import MapViewContainer from "@/components/maps/map/map-view-container";
import { getMetadata } from "@/lib/metadata";

// Function to dynamically generate metadata for this specific page
export const metadata = async () => {
    // Fetch the metadata for the page with the slug 'about'
    return await getMetadata('maps');
};

export default function MapsViewPage({ params }: { params: { id: string } }) {
    return (
        <div className="container mx-auto py-8 pt-40">
            <MapViewContainer id={params.id} />
        </div>
    )
}