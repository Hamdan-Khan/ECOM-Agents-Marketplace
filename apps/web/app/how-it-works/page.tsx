export default function HowItWorksPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">How AI Exchange Works</h1>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">What is AI Exchange?</h2>
        <p>
          <strong>AI Exchange</strong> is a web-based marketplace where AI
          developers can list, sell, and manage access to their specialized AI
          agents. It also serves businesses and end-users by providing a
          streamlined platform to discover, evaluate, and purchase AI-powered
          solutions tailored to their specific needs.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">How It Works</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong>Sign Up:</strong> Users and developers register on the
            platform.
          </li>
          <li>
            <strong>Browse AI Agents:</strong> Explore categorized AI agents
            like NLP tools, vision models, bots, and analytics.
          </li>
          <li>
            <strong>Purchase or Subscribe:</strong> Buy agents directly,
            subscribe monthly, or use tokens/credits.
          </li>
          <li>
            <strong>Integrate Easily:</strong> Minimal setup to plug AI agents
            into your workflow.
          </li>
          <li>
            <strong>Admin Features:</strong> Developers can manage listings and
            transactions via a dedicated dashboard.
          </li>
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">Key Features</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Token/Credit system for flexible payments</li>
          <li>Stripe or PayPro payment gateway integration</li>
          <li>Admin panel to manage agents and orders</li>
          <li>AI Recommendation engine to suggest bundles</li>
          <li>Secure login and user dashboards</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">Why It Matters</h2>
        <p>
          AI Exchange fills a gap in the market by offering a dedicated,
          centralized space for pre-built AI solutions. It saves time and money,
          accelerates adoption of AI technologies, and opens new monetization
          opportunities for developers.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Who Should Use It?</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>AI developers seeking to monetize their work</li>
          <li>Startups and SMEs looking for plug-and-play AI capabilities</li>
          <li>Enterprises wanting to integrate AI without hiring full teams</li>
        </ul>
      </section>
    </main>
  );
}
