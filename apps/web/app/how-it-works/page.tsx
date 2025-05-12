import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bot, ShoppingCart, Star, Users, Settings, CreditCard } from "lucide-react";

export default function HowItWorksPage() {  const features = [
    {
      icon: <Bot className="h-6 w-6" />,
      title: "AI Agent Marketplace",
      description: "Browse and purchase specialized AI agents across multiple categories including NLP, Computer Vision, Analytics, and more"
    },
    {
      icon: <ShoppingCart className="h-6 w-6" />,
      title: "Flexible Purchase Options",
      description: "Choose between one-time purchases or monthly subscriptions for continuous access to AI agents"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Reviews & Ratings",
      description: "Make informed decisions with authentic reviews and ratings from other users"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "User Dashboard",
      description: "Manage your purchased agents, subscriptions, and track your usage all in one place"
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Stripe Payments",
      description: "Safe and secure payments through Stripe, the industry leader in online payment processing"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">How AI Exchange Works</h1>
              <p className="text-xl opacity-90">
                Discover, purchase, and integrate AI agents to enhance your business capabilities
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          {/* What is AI Exchange */}
          <section className="mb-16">
            <Card>
              <CardHeader>
                <CardTitle>What is AI Exchange?</CardTitle>
                <CardDescription>
                  A comprehensive marketplace for AI solutions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AI Exchange is a marketplace where users can come browse, discover and buy AI agents listed on the platform. Our platform
                  streamlines the process of connecting AI creators with users who need
                  specialized AI capabilities.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Features Grid */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-8">Key Features</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* How It Works Steps */}
          <section className="mb-16">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started is Easy</CardTitle>
                <CardDescription>
                  Follow these simple steps to start using AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Create an Account</h3>
                      <p className="text-muted-foreground">
                        Sign up for free and complete your profile to get started
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Browse AI Agents</h3>
                      <p className="text-muted-foreground">
                        Explore our marketplace of specialized AI agents across different categories
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Choose Your Plan</h3>
                      <p className="text-muted-foreground">
                        Select between one-time purchases or monthly subscriptions based on your needs
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Start Using AI</h3>
                      <p className="text-muted-foreground">
                        Access your purchased agents through our intuitive dashboard
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
                <p className="mb-6 opacity-90">
                  Join our growing community of AI users and creators
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/agents">Browse AI Agents</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-transparent">
                    <Link href="/register">Create Account</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
