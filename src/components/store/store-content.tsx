"use client";

import DisplayProduct from "@/components/store/product";
import { useNavlinks, useProducts } from "@/hooks/store/use-storefront";
import { cn } from "@/lib/utils";
import { NavLink, Product } from "@/types/store";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function StoreContent({ params }: { params: { slug: string[] } }) {
    const { data } = useProducts();
    const { data: navlinks } = useNavlinks();

    const activeCategory = useMemo<NavLink | undefined>(() => {
        if (!navlinks || !params.slug?.length) return undefined;

        // Helper function to recursively find category
        function findCategory(categories: NavLink[], slugPath: string[]): NavLink | undefined {
            if (slugPath.length === 0) return undefined;

            const currentSlug = slugPath[0];
            const category = categories.find(nav => nav.tag_slug === currentSlug);

            if (!category) return undefined;
            if (slugPath.length === 1) return category;

            return findCategory(category.children, slugPath.slice(1));
        }

        return findCategory(navlinks, params.slug);
    }, [navlinks, params.slug]);

    const products = useMemo<Product[] | undefined>(() => {
        if (!data || !navlinks || !params.slug) return undefined;

        if (!activeCategory || activeCategory.children.length > 0) {
            return undefined;
        }

        // Helper function to check if a tag is in the NavLink tree
        function isTagInNavLinkTree(tag: string, navLink: NavLink): boolean {
            if (navLink.tag_slug === tag) return true;
            return navLink.children.some(child => isTagInNavLinkTree(tag, child));
        }

        return data.filter((product) => {
            if (product.enabled_at || product.enabled_until) {

                const now = new Date();
                const enabledAt = product.enabled_at ? new Date(product.enabled_at) : null;
                const enabledUntil = product.enabled_until ? new Date(product.enabled_until) : null;

                if (enabledAt && now < enabledAt) {
                    return false;
                }

                if (enabledUntil && now > enabledUntil) {
                    return false;
                }
            }

            return product.tags.some(tag => isTagInNavLinkTree(tag.slug, activeCategory));
        });
    }, [data, navlinks, params.slug, activeCategory]);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(activeCategory ? activeCategory?.children : navlinks)?.map((link) => (
                    <Link
                        href={`/store${activeCategory
                            ? `/${params.slug.join('/')}/${link.tag_slug}`
                            : `/${link.tag_slug}`
                            }`}
                        className={cn("relative group bg-secondary/15 border-border/5 backdrop-blur",
                            "p-4 flex items-center justify-center overflow-hidden rounded-md group"
                        )}
                        key={link.node_id}
                    >
                        <div className="px-4 w-full flex justify-between">
                            <h3 className="text-xl uppercase font-bold opacity-50 group-hover:opacity-100 duration-300">{link.name}</h3>
                            <ArrowRightIcon
                                className="text-foreground h-6 w-6 group-hover:translate-x-2 opacity-50 group-hover:opacity-100 duration-300"
                            />
                        </div>
                    </Link>
                ))}
            </div>
            {products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {products.map((product) => (
                        <DisplayProduct
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>
            ) : (
                activeCategory && activeCategory.children.length === 0 && (
                    <p className="text-center mt-4">No products found in this category.</p>
                )
            )}
        </>
    )
}