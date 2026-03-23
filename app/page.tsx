import { SearchForm } from "./components/SearchForm";
import { Trophy, BarChart3, Users, Search } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo/Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 mb-4">
            GameStats
          </h1>
          <p className="text-xl text-slate-400 mb-12">
            Check your League of Legends stats, match history, and champion performance
          </p>

          {/* Search Form */}
          <SearchForm />

          {/* Multi-Search Link */}
          <div className="mt-6">
            <Link
              href="/multi-search"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors text-sm"
            >
              <Users className="w-4 h-4" />
              Or use Multi-Search to analyze your team
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {[
              {
                icon: Trophy,
                title: "Match History",
                desc: "View detailed match stats and KDA",
              },
              {
                icon: BarChart3,
                title: "Champion Stats",
                desc: "Analyze performance by champion",
              },
              {
                icon: Users,
                title: "Rank Tracking",
                desc: "Track your LP and climb progress",
              },
              {
                icon: Search,
                title: "Multi-Search",
                desc: "Analyze entire teams at once",
                href: "/multi-search",
              },
            ].map((feature) => {
              const content = (
                <>
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                    <feature.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                </>
              );

              if (feature.href) {
                return (
                  <Link
                    key={feature.title}
                    href={feature.href}
                    className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/10 transition-colors group block"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors group"
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-sm text-slate-600">
        <p>Built with Next.js 14 + shadcn/ui • Not affiliated with Riot Games</p>
      </footer>
    </div>
  );
}
