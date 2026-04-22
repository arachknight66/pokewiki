/**
 * Homepage / Dashboard
 */

import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
          Pokémon Competitive Intelligence
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Build, rate, and share competitive Pokémon teams with advanced analytics and real-time team evaluation
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/team-builder"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Start Building Teams
          </Link>
          <Link
            href="/pokemon"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Browse Pokémon
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-6">
        {features.map(feature => (
          <div key={feature.id} className="card">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to dominate the meta?</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Sign up now and access the full team building platform with competitive ratings
        </p>
        <Link
          href="/auth/register"
          className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Get Started Free
        </Link>
      </section>
    </div>
  );
}

const features = [
  {
    id: 1,
    icon: '⚙️',
    title: 'Team Rating Engine',
    description: 'Get detailed analysis of type coverage, role balance, synergy, and meta relevance for any Pokémon team.',
  },
  {
    id: 2,
    icon: '🎯',
    title: 'Advanced Team Builder',
    description: 'Drag-and-drop interface with real-time type coverage heatmaps and weakness analysis.',
  },
  {
    id: 3,
    icon: '📊',
    title: 'Competitive Tools',
    description: 'Access tournaments, leaderboards, and community strategies from top players.',
  },
  {
    id: 4,
    icon: '💬',
    title: 'Community Forum',
    description: 'Discuss strategy, share teams, and learn from other competitive players.',
  },
  {
    id: 5,
    icon: '📈',
    title: 'Performance Analytics',
    description: 'Track your team stats, win rates, and climb the leaderboard.',
  },
  {
    id: 6,
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Keep your strategies private or share with the community on your terms.',
  },
];
