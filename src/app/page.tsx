import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex-1">
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Welcome to Holiday Promo
              </h1>
              <p className="text-muted-foreground md:text-xl">
                Discover exclusive holiday deals and promotions
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/auth/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Features
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Explore our amazing features and benefits
                </p>
              </div>
            </div>
            <div className="grid gap-6 lg:col-span-2 lg:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Exclusive Deals</h3>
                <p className="text-muted-foreground">
                  Access exclusive holiday promotions and discounts
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Personalized Offers</h3>
                <p className="text-muted-foreground">
                  Receive personalized offers based on your preferences
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Easy Redemption</h3>
                <p className="text-muted-foreground">
                  Redeem your promotions with just a few clicks
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Secure Platform</h3>
                <p className="text-muted-foreground">
                  Your data is always secure with our platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
