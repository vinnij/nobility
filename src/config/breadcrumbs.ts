interface SearchParamBreadcrumb {
    label: string;
    getValue?: (value: string) => string;
}

export const searchParamsBreadcrumbsMap: Record<string, SearchParamBreadcrumb> = {
   /*  search: { label: 'Search' },
    category: { label: 'Category' },
    brand: { label: 'Brand' },
    price_range: {
        label: 'Price Range',
        getValue: (value) => {
            const [min, max] = value.split('-');
            return `$${min} - $${max}`;
        }
    }, */
    // Add more search params as needed
};
