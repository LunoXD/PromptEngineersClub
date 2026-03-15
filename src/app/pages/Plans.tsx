import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import { ScrollReveal } from "../components/ScrollReveal";
import { api, Plan } from "../lib/api";

const eventTypeConfig: Record<string, { badge: string; border: string }> = {
  "Prompt Lab": {
    badge: "bg-purple-50 text-purple-700 border border-purple-200",
    border: "border-purple-400",
  },
  "Build With AI": {
    badge: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    border: "border-indigo-400",
  },
  "Expert Session": {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    border: "border-emerald-400",
  },
  "AI Competition": {
    badge: "bg-red-50 text-red-700 border border-red-200",
    border: "border-red-400",
  },
  "Community Session": {
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    border: "border-amber-400",
  },
};

export function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    api
      .getPlans()
      .then((data) => {
        if (!mounted) return;
        setPlans(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load plans");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const upcomingEvents = useMemo(
    () => plans.filter((p) => p.category === "upcoming"),
    [plans]
  );
  const recurringSchedule = useMemo(
    () => plans.filter((p) => p.category === "recurring"),
    [plans]
  );

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Prompt Roadmap
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Explore our active prompt sessions, AI challenges, and collaborative innovation tracks.
          </p>
        </ScrollReveal>

        {/* Active Prompt Sessions */}
        <div className="mb-20">
          <ScrollReveal>
            <h2 className="text-2xl font-bold mb-8">
              Active Prompt Sessions
            </h2>
          </ScrollReveal>

          <div className="space-y-6">
            {loading && <p className="text-gray-500">Loading plans...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {upcomingEvents.map((event, index) => {
              const cfg = eventTypeConfig[event.type] ?? {
                badge: "bg-gray-50 text-gray-700 border border-gray-200",
                border: "border-gray-300",
              };

              return (
                <ScrollReveal key={index} delay={index * 80}>
                  <div
                    className={`bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border-l-4 ${cfg.border}`}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${cfg.badge}`}
                          >
                            {event.type}
                          </span>
                          <h3 className="text-xl font-semibold">
                            {event.title}
                          </h3>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {event.description}
                        </p>

                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Users size={15} />
                          {(event.attendees ?? 0)} members participating
                        </div>
                      </div>

                      <button className="bg-black text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 active:scale-95 transition-all text-sm font-medium whitespace-nowrap self-start">
                        Join Session
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* Prompt Practice Schedule */}
        <div>
          <ScrollReveal>
            <h2 className="text-2xl font-bold mb-8">
              Prompt Practice Tracks
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {recurringSchedule.map((item, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-300">
                  <h3 className="text-lg font-semibold mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Note Section */}
        <ScrollReveal delay={120}>
          <div className="mt-12 p-6 bg-purple-50 border border-purple-200 rounded-2xl">
            <p className="text-purple-800 text-sm">
              <strong>Note:</strong> Session tracks evolve continuously as we
              explore new AI systems, prompt frameworks, and innovation strategies.
            </p>
          </div>
        </ScrollReveal>

      </div>
    </div>
  );
}