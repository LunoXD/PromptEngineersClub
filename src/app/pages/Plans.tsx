import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { ScrollReveal } from "../components/ScrollReveal";

const upcomingEvents = [
  {
    title: "Tech Workshop: Introduction to Machine Learning",
    date: "March 15, 2026",
    time: "2:00 PM - 5:00 PM",
    location: "Engineering Building, Room 301",
    attendees: 45,
    type: "Workshop",
    description:
      "Hands-on workshop covering the fundamentals of machine learning and practical applications.",
  },
  {
    title: "Project Presentation Day",
    date: "March 22, 2026",
    time: "10:00 AM - 4:00 PM",
    location: "Main Auditorium",
    attendees: 120,
    type: "Event",
    description:
      "Showcase of all ongoing and completed projects by club members with live demonstrations.",
  },
  {
    title: "Guest Lecture: Future of Robotics",
    date: "April 5, 2026",
    time: "3:00 PM - 4:30 PM",
    location: "Conference Hall A",
    attendees: 80,
    type: "Lecture",
    description:
      "Industry expert discussing emerging trends and career opportunities in robotics engineering.",
  },
  {
    title: "Hackathon 2026",
    date: "April 18-19, 2026",
    time: "9:00 AM - 9:00 AM",
    location: "Computer Science Building",
    attendees: 150,
    type: "Competition",
    description:
      "24-hour coding marathon to build innovative solutions for real-world engineering problems.",
  },
  {
    title: "Team Building & Networking Event",
    date: "May 3, 2026",
    time: "6:00 PM - 9:00 PM",
    location: "Campus Green Area",
    attendees: 60,
    type: "Social",
    description:
      "Casual gathering for members to connect, share ideas, and build lasting relationships.",
  },
];

const recurringSchedule = [
  {
    day: "Monday",
    activity: "General Meeting",
    time: "5:00 PM – 6:30 PM",
    location: "Room 205",
  },
  {
    day: "Wednesday",
    activity: "Project Work Sessions",
    time: "4:00 PM – 7:00 PM",
    location: "Lab 3",
  },
  {
    day: "Friday",
    activity: "Coding Club",
    time: "3:00 PM – 5:00 PM",
    location: "Computer Lab 1",
  },
];

const eventTypeConfig: Record<string, { badge: string; border: string }> = {
  Workshop: {
    badge: "bg-purple-50 text-purple-700 border border-purple-200",
    border: "border-purple-400",
  },
  Event: {
    badge: "bg-blue-50 text-blue-700 border border-blue-200",
    border: "border-blue-400",
  },
  Lecture: {
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    border: "border-emerald-400",
  },
  Competition: {
    badge: "bg-red-50 text-red-700 border border-red-200",
    border: "border-red-400",
  },
  Social: {
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    border: "border-amber-400",
  },
};

export function Plans() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Plans & Events
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Stay updated with our upcoming events, workshops, and regular
            activities.
          </p>
        </ScrollReveal>

        <div className="mb-16">
          <ScrollReveal>
            <h2 className="text-2xl font-bold mb-8">Upcoming Events</h2>
          </ScrollReveal>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => {
              const cfg = eventTypeConfig[event.type] ?? {
                badge: "bg-gray-50 text-gray-700 border border-gray-200",
                border: "border-gray-300",
              };

              return (
                <ScrollReveal key={index} delay={index * 60}>
                  <div
                    className={`bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border-l-4 ${cfg.border}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.badge}`}
                          >
                            {event.type}
                          </span>
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                        </div>
                        <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                          {event.description}
                        </p>
                        <div className="grid sm:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Calendar size={14} className="flex-shrink-0" />
                            {event.date}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Clock size={14} className="flex-shrink-0" />
                            {event.time}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <MapPin size={14} className="flex-shrink-0" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Users size={14} className="flex-shrink-0" />
                            {event.attendees} registered
                          </div>
                        </div>
                      </div>
                      <button className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 active:scale-95 transition-all text-sm font-medium whitespace-nowrap self-start">
                        Register
                      </button>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        <div>
          <ScrollReveal>
            <h2 className="text-2xl font-bold mb-8">Weekly Schedule</h2>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Day
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Activity
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Time
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recurringSchedule.map((schedule, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-sm">
                          {schedule.day}
                        </td>
                        <td className="px-6 py-4 text-sm">{schedule.activity}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {schedule.time}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {schedule.location}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={100}>
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-2xl">
            <p className="text-gray-600 text-sm">
              <strong className="text-gray-800">Note:</strong> All events and
              schedules are subject to change. Please check back regularly for
              updates or join our mailing list for notifications.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
