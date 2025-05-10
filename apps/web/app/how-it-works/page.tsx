// app/how-it-works/page.tsx

export default function HowItWorksPage() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">How It Works</h1>
      <p className="text-lg leading-relaxed mb-4">
        Welcome to our platform! Here's a quick overview of how it works:
      </p>
      <ol className="list-decimal pl-6 space-y-2 text-base">
        <li>Register for an account to get started.</li>
        <li>Log in to your dashboard and manage your settings.</li>
        <li>Use our tools to upload, process, and manage your content.</li>
        <li>Track your activity and results through real-time analytics.</li>
        <li>Reach out to our support team if you need help anytime.</li>
      </ol>
    </main>
  );
}
