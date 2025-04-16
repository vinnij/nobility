import { prisma } from "./db";


// Function to dynamically generate metadata for this specific page
export const getMetadata = async (slug: string) => {
    // Fetch the metadata for the page with the slug 'about'
    const pageMetadata = await prisma.pageMetadata.findUnique({
        where: { slug }, // Use the provided slug to find the page's metadata
    });

    if (!pageMetadata) {
        return undefined
    }

    return {
        // The title for the browser tab and search engines (specific to this page)
        title: pageMetadata?.title || 'Page',

        // A brief description of the page's content for search engines
        description: pageMetadata?.description || 'Here is a page',

        // Open Graph metadata for social media previews (specific to this page)
        openGraph: {
            title: pageMetadata?.ogTitle || pageMetadata?.title, // Open Graph title
            description: pageMetadata?.ogDescription || pageMetadata?.description, // Open Graph description
            images: [
                {
                    url: pageMetadata?.ogImageUrl, // URL of the Open Graph image
                    alt: pageMetadata?.ogImageAlt || 'Page Open Graph Image', // Alt text for the image
                },
            ],
        },

        // Twitter-specific metadata (specific to this page)
        twitter: {
            title: pageMetadata?.twitterTitle || pageMetadata?.title, // Twitter title
            description: pageMetadata?.twitterDescription || pageMetadata?.description, // Twitter description
            images: [pageMetadata?.twitterImageUrl], // URL of the Twitter image
        },
    };
};