"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Adjust this value to match your navbar height
const NAVBAR_HEIGHT = 100; // in pixels

export default function Content() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const hash = searchParams.get("section");
        if (hash) {
            const element = document.getElementById(hash);
            if (element) {
                setTimeout(() => {
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - NAVBAR_HEIGHT;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }, 0);
            }
        }
    }, [searchParams]);
    return (
        <div className="container pt-40">
            <div className="flex flex-col items-center pb-8 text-center">
                <h1 className="mt-2 text-center text-4xl font-bold">Privacy Policy</h1>
                <p className="max-w-[80ch] bg-transparent px-8 text-center leading-8 text-muted-foreground">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </p>
            </div>
            <div className="pb-5 space-y-8 text-muted-foreground">
                <div className="space-y-2.5">
                    <h2 id="introduction" className="text-2xl text-foreground font-bold">
                        <Link href="?section=introduction">1. Introduction</Link>
                    </h2>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                </div>
                <div className="space-y-2.5">
                    <h2 id="acceptance-of-terms" className="text-2xl text-foreground font-bold">
                        <Link href="?section=acceptance-of-terms">2. Acceptance of Terms</Link>
                    </h2>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                </div>
                <div className="space-y-2.5">
                    <h2 id="user-accounts" className="text-2xl text-foreground font-bold">
                        <Link href="?section=user-accounts">3. User Accounts</Link>
                    </h2>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                </div>
                <div className="space-y-2.5">
                    <h2 id="product-purchases" className="text-2xl text-foreground font-bold">
                        <Link href="?section=product-purchases">4. Product Purchases</Link>
                    </h2>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                </div>
                <div className="space-y-2.5">
                    <h2 id="payment-terms" className="text-2xl text-foreground font-bold">
                        <Link href="?section=payment-terms">5. Payment Terms</Link>
                    </h2>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                </div>
                <div className="space-y-2.5">
                    <h2 id="delivery" className="text-2xl text-foreground font-bold">
                        <Link href="?section=delivery">6. Delivery</Link>
                    </h2>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                </div>
                <div className="space-y-2.5">
                    <h2 id="returns-and-refunds" className="text-2xl text-foreground font-bold">
                        <Link href="?section=returns-and-refunds">7. Returns and Refunds</Link>
                    </h2>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                </div>
                <div className="space-y-2.5">
                    <h2 id="limitation-of-liability" className="text-2xl text-foreground font-bold">
                        <Link href="?section=limitation-of-liability">8. Limitation of Liability</Link>
                    </h2>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                </div>
                <div className="space-y-2.5">
                    <h2 id="indemnification" className="text-2xl text-foreground font-bold">
                        <Link href="?section=indemnification">9. Indemnification</Link>
                    </h2>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore quae eligendi ea animi at asperiores sapiente doloremque minus aliquam excepturi cumque quibusdam voluptate ipsa incidunt sit ullam non, corrupti optio?</p>
                </div>
            </div>
        </div>
    )
}