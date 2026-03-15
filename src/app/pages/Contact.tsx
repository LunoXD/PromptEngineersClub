import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { ScrollReveal } from "../components/ScrollReveal";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactItems = [
    {
      icon: Mail,
      title: "Email",
      lines: ["2400030024@kluniversity.in", "deepak.yaramala@gmail.com"],
    },
    {
      icon: Phone,
      title: "Phone",
      lines: ["8074524800","9347301082", "Mon–Fri, 9:00 AM – 5:00 PM"],
    },
    {
      icon: MapPin,
      title: "Location",
      lines: ["SAC-HALL, Room :R-006", "University Campus"],
    },
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <ScrollReveal className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Contact Us</h1>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <ScrollReveal direction="left">
            <div>
              <h2 className="text-xl font-bold mb-2">Get in Touch</h2>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                Whether you're interested in joining our club, collaborating on a project, or have any questions, feel free to reach out through any of the following channels.
              </p>

              <div className="space-y-4 mb-6">
                {contactItems.map(({ icon: Icon, title, lines }, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="text-white" size={16} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{title}</h3>
                      {lines.map((l, j) => (
                        <p key={j} className="text-gray-500 text-sm">{l}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl">
                <h3 className="font-semibold mb-2">Club Hours</h3>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>Monday – Friday: 6:00 PM – 7:00 PM</p>
                  <p>Saturday,Sunday: Closed</p>
                   
          
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Contact Form */}
          <ScrollReveal direction="right" delay={100}>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-5">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1.5 text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm"
                    placeholder="What is this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1.5 text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all resize-none text-sm"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  Send Message
                  <Send size={16} />
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}