"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { Menu, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setIsLoggedIn(true);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "AI Agents", href: "/agents" },
  ];

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              AI Exchange
            </Link>
            <nav className="hidden ml-10 md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                    pathname === link.href
                      ? "text-blue-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {user ? (
              <>
                <span className="text-sm text-gray-700">
                  {user.name || user.email}
                </span>
                <button
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                  onClick={() => {
                    logout();
                    router.push("/login");
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                      pathname === link.href
                        ? "text-blue-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link href="/cart" className="flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart {totalItems > 0 && `(${totalItems})`}
                </Link>
                <div className="pt-4 border-t">
                  {user ? (
                    <>
                      <span className="text-sm text-gray-700">
                        {user.name || user.email}
                      </span>
                      <button
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                        onClick={() => {
                          logout();
                          router.push("/login");
                        }}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        asChild
                        className="w-full justify-start mb-2"
                      >
                        <Link href="/login">Sign In</Link>
                      </Button>
                      <Button asChild className="w-full justify-start">
                        <Link href="/register">Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
