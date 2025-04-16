import { ReactNode } from 'react'
import Footer from '@/components/footer'
import Navigation from '@/components/nav/nav'
import { NavigationItem } from '@/types/navigation';
import { getNavigationItems } from '../actions/actions';

export default async function UserLayout({ children }: { children: ReactNode }) {
    const result = await getNavigationItems();
    if (result.error) {
        console.error('Error fetching navigation items:', result.error);
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navigation navigationItems={result.data || []} />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
            <div className="fixed opacity-[2%] z-[-2] inset-0 max-w-screen max-h-screen w-screen h-screen bg-cover bg-[url('/images/background.jpg')]" />
        </div>
    )
}