import { Send } from "lucide-react";
import { useState } from "react";
import { ScrollReveal } from "../components/ScrollReveal";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let message = "Failed to send message. Please try again.";
        try {
          const data = await response.json();
          if (data?.message) message = data.message;
        } catch {
          // ignore parse errors
        }
        throw new Error(message);
      }

      setSubmitSuccess("Message sent successfully. We will get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Contact</h1>
        </ScrollReveal>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <ScrollReveal direction="left" className="lg:col-span-1">
            <div className="rounded-2xl border border-white/15 bg-black/35 backdrop-blur-xl p-5 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white">Join Our Discord</h2>
                <p className="text-sm text-slate-300 mt-1">Hang out with the community and stay updated.</p>
              </div>

              <div className="rounded-xl border border-white/10 overflow-hidden">
                <iframe
                  title="Prompt Engineering Club Discord"
                  src="https://discord.com/widget?id=1483389840115368059&theme=dark"
                  width="100%"
                  height="420"
                  frameBorder="0"
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={80} className="lg:col-span-2">
            <div className="rounded-2xl border border-white/15 bg-black/35 backdrop-blur-xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h2 className="text-xl font-semibold text-white">Send a message</h2>
                <a
                  href="https://discord.gg/Ne5RnSvr"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-lg border border-indigo-300/40 bg-indigo-500/20 px-3 py-1.5 text-sm font-medium text-indigo-100 transition-all hover:bg-indigo-500/30 hover:border-indigo-200/70"
                >
                  Join Discord
                </a>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-slate-200">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-white/15 rounded-xl bg-slate-950/55 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/40 transition-all text-sm"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-slate-200">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-white/15 rounded-xl bg-slate-950/55 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/40 transition-all text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1.5 text-slate-200">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-white/15 rounded-xl bg-slate-950/55 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/40 transition-all text-sm"
                    placeholder="What is this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1.5 text-slate-200">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2.5 border border-white/15 rounded-xl bg-slate-950/55 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/25 focus:border-white/40 transition-all resize-none text-sm"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black px-6 py-3 rounded-xl hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending..." : "Send Message"}
                  <Send size={16} />
                </button>

                {submitSuccess && (
                  <p className="text-sm text-emerald-200 bg-emerald-500/15 border border-emerald-300/30 rounded-xl px-3 py-2">
                    {submitSuccess}
                  </p>
                )}
                {submitError && (
                  <p className="text-sm text-red-200 bg-red-500/15 border border-red-300/30 rounded-xl px-3 py-2">
                    {submitError}
                  </p>
                )}
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}