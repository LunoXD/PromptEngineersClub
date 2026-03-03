import { Calendar, Clock, MapPin, Users } from "lucide-react";

const upcomingEvents = [
  {
    title: "Tech Workshop: Introduction to Machine Learning",
    date: "March 15, 2026",
    time: "2:00 PM - 5:00 PM",
    location: "Engineering Building, Room 301",
    attendees: 45,
    type: "Workshop",
    description: "Hands-on workshop covering the fundamentals of machine learning and practical applications.",
  },
  {
    title: "Project Presentation Day",
    date: "March 22, 2026",
    time: "10:00 AM - 4:00 PM",
    location: "Main Auditorium",
    attendees: 120,
    type: "Event",
    description: "Showcase of all ongoing and completed projects by club members with live demonstrations.",
  },
  {
    title: "Guest Lecture: Future of Robotics",
    date: "April 5, 2026",
    time: "3:00 PM - 4:30 PM",
    location: "Conference Hall A",
    attendees: 80,
    type: "Lecture",
    description: "Industry expert discussing emerging trends and career opportunities in robotics engineering.",
  },
  {
    title: "Hackathon 2026",
    date: "April 18-19, 2026",
    time: "9:00 AM - 9:00 AM",
    location: "Computer Science Building",
    attendees: 150,
    type: "Competition",
    description: "24-hour coding marathon to build innovative solutions for real-world engineering problems.",
  },
  {
    title: "Team Building & Networking Event",
    date: "May 3, 2026",
    time: "6:00 PM - 9:00 PM",
    location: "Campus Green Area",
    attendees: 60,
    type: "Social",
    description: "Casual gathering for members to connect, share ideas, and build lasting relationships.",
  },
];

const recurringSchedule = [
  {
    day: "Monday",
    activity: "General Meeting",
    time: "5:00 PM - 6:30 PM",
    location: "Room 205",
  },
  {
    day: "Wednesday",
    activity: "Project Work Sessions",
    time: "4:00 PM - 7:00 PM",
    location: "Lab 3",
  },
  {
    day: "Friday",
    activity: "Coding Club",
    time: "3:00 PM - 5:00 PM",
    location: "Computer Lab 1",
  },
];

export function Plans() {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "Workshop":
        return "bg-purple-100 text-purple-800";
      case "Event":
        return "bg-blue-100 text-blue-800";
      case "Lecture":
        return "bg-green-100 text-green-800";
      case "Competition":
        return "bg-red-100 text-red-800";
      case "Social":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Plans & Events</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with our upcoming events, workshops, and regular activities.
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold mb-8">Upcoming Events</h2>
          <div className="space-y-6">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <span
                        className={`text-xs px-3 py-1 rounded-full ${getEventTypeColor(
                          event.type
                        )}`}
                      >
                        {event.type}
                      </span>
                      <h3 className="text-xl font-semibold flex-1">{event.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{event.description}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={16} />
                        <span className="text-sm">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={16} />
                        <span className="text-sm">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={16} />
                        <span className="text-sm">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users size={16} />
                        <span className="text-sm">{event.attendees} registered</span>
                      </div>
                    </div>
                  </div>
                  <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap self-start">
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Schedule */}
        <div>
          <h2 className="text-3xl font-semibold mb-8">Weekly Schedule</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Day</th>
                    <th className="px-6 py-4 text-left font-semibold">Activity</th>
                    <th className="px-6 py-4 text-left font-semibold">Time</th>
                    <th className="px-6 py-4 text-left font-semibold">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recurringSchedule.map((schedule, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium">{schedule.day}</td>
                      <td className="px-6 py-4">{schedule.activity}</td>
                      <td className="px-6 py-4 text-gray-600">{schedule.time}</td>
                      <td className="px-6 py-4 text-gray-600">{schedule.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-700">
            <strong>Note:</strong> All events and schedules are subject to change. Please check back regularly for updates or join our mailing list for notifications.
          </p>
        </div>
      </div>
    </div>
  );
}
