import { JoinCommunity } from "@/components/home/join-community"
import Rules from "@/components/home/rules"
import { JoinDiscordBtn } from "@/components/join-discord-btn"
import { buttonVariants } from "@/components/ui/button"
import { Spotlight } from "@/components/ui/spotlight"
import { getMetadata } from "@/lib/metadata"
import { cn } from "@/lib/utils"
import { ArrowDownIcon, ShoppingBasket } from "lucide-react"
import Link from "next/link"

// Function to dynamically generate metadata for this specific page
export const metadata = async () => {
  // Fetch the metadata for the page with the slug 'about'
  return await getMetadata('home');
};

export default function Home() {
  return (
    <>
      <Spotlight
        className="hidden md:block -top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      <div className="container pt-44 md:pt-0"> {/* pt-56 */}
        <div className="relative md:h-screen flex gap-6 flex-col items-center justify-center text-center mt-0 mb-10">
          <div className="">
            <h1 className="text-4xl font-bold tracking-tight">Welcome to Our Rust Server</h1>
            <p className="text-xl text-muted-foreground mt-4 max-w-2xl">
              Join our thriving community and experience the ultimate survival gameplay on our high-performance Rust servers.
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link
              href={"/store"}
              className={cn(
                buttonVariants({
                  size: "lg",
                  variant: "secondary"
                }),
                "group"
              )}
            >
              <ShoppingBasket className="group-hover:animate-wiggle mr-2.5 h-5 w-5" />
              Visit Store
            </Link>
            <JoinDiscordBtn variant="ghost" />
          </div>
          <Link
            href={"#join-community"}
            className="hidden md:block absolute bottom-12 left-1/2 -translate-x-1/2 "
          >
            <ArrowDownIcon
              className="animate-bounce text-muted-foreground"
              size={35}
            />
          </Link>
        </div>

        <section id="join-community" className="py-28 flex flex-col justify-center lg:flex-row lg:items-center lg:pb-[148px]">
          <div className="flex flex-col items-center gap-6 pb-12 lg:items-start lg:pb-0">
            <div className="">
              {/* <div className="w-fit rounded-full bg-secondary/45 group">
              <div className="rounded-full px-3 py-1">
                <span className="text-sm flex select-none items-center text-muted-foreground">
                  <DiscordIcon
                    className="group-hover:rotate-[360deg] duration-700 h-4 w-4 sm:mr-2"
                  />
                  <span className="hidden sm:block"><span className="font-bold">102</span> Discord Users</span>
                </span>
              </div>
            </div> */}

              <h2 className="mt-2 text-center text-4xl font-bold lg:text-left">Join the community</h2>
            </div>
            <p className="max-w-[55ch] bg-transparent px-8 text-center leading-8 text-black/60 lg:px-0 lg:text-left dark:text-white/50">
              Discuss server decisions and community topics, get notified on server wipes and contact our support, all on our Discord Server below.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <JoinDiscordBtn />
            </div>
          </div>
          <JoinCommunity />
        </section>

        <section className="flex flex-col-reverse md:flex-col md:gap-12 justify-center lg:flex-row lg:items-start lg:pb-[148px]">
          <div className="flex-1 pb-0">
            <Rules />
          </div>
          <div className="flex flex-col items-center gap-6 pb-12 pt-5 lg:items-start lg:pb-0">
            {/*  <div className="rounded-full bg-gradient-to-r from-primary to-secondary p-[1px] brightness-90 contrast-150 dark:brightness-125 dark:contrast-100">
              <div className="rounded-full bg-white/80 px-3 py-1 dark:bg-black/80">
                <span className="flex select-none items-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  <UserIcon
                    className="h-4 w-4 stroke-primary stroke-2 sm:mr-2"
                  />
                  <span className="hidden sm:block">102 users online in discord</span>
                </span>
              </div>
            </div> */}
            <h2 className="mt-2 text-center text-4xl font-bold lg:text-left">Server Rules</h2>
            <p className="max-w-[55ch] bg-transparent px-8 text-center leading-8 text-black/60 lg:px-0 lg:text-left dark:text-white/50">
              View the rules of our servers. We take these rules seriously, and they are not subject to any &quot;loop holes&quot;. Our staff members reserve the right to remove your access to our servers.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}