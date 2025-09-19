'use client'
import Image from "next/image";
import Navbar from "../../components/navbar";
import { useState } from "react";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });

    // Untuk mailto, kita harus encode body-nya
    const handleMailto = (e) => {
        e.preventDefault();
        const to = "vertegenwoordiger@clandestineproject.nl";
        const subject = encodeURIComponent(`[Contact Form] Message from ${form.name}`);
        const body = encodeURIComponent(
            `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
        );
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    };

    return (
        <>
            <section className="min-h-screen bg-[#0D0D10] py-16 px-4 flex items-center justify-center">
                <div className="max-w-5xl w-full bg-[#181820] rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                    {/* Info/Branding */}
                    <div className="order-1 md:order-none bg-[#13131a] p-8 md:p-12 flex flex-col justify-center items-center">
                        <Image
                            src="/image/logo.png"
                            alt="Company Logo"
                            width={320}
                            height={48}
                            className="invert mb-8"
                        />
                        <div className="text-gray-400 text-center mb-8">
                            <p>AI-powered dark web intelligence platform.</p>
                        </div>
                        <div className="text-sm text-gray-500 space-y-2 w-full">
                            <div>
                                <span className="font-semibold text-white">Email:</span> <br/>
                                <a href="mailto:vertegenwoordiger@clandestineproject.nl" className="hover:text-[#f33d74]">vertegenwoordiger@clandestineproject.nl</a>
                            </div>
                        </div>
                    </div>
                    {/* Contact Form */}
                    <div className="order-2 md:order-none p-8 md:p-12 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Contact Us</h2>
                        <p className="text-gray-400 mb-8">
                            Fill in the form and our team will get back to you as soon as possible.
                        </p>
                        <form className="space-y-6" onSubmit={handleMailto}>
                            <div>
                                <label className="text-gray-300 block mb-2">Name</label>
                                <input
                                    className="w-full px-4 py-3 rounded-lg bg-[#23232c] text-white focus:ring-2 focus:ring-[#f33d74] border-none outline-none"
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-gray-300 block mb-2">Email</label>
                                <input
                                    className="w-full px-4 py-3 rounded-lg bg-[#23232c] text-white focus:ring-2 focus:ring-[#f33d74] border-none outline-none"
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="you@email.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-gray-300 block mb-2">Message</label>
                                <textarea
                                    className="w-full px-4 py-3 rounded-lg bg-[#23232c] text-white focus:ring-2 focus:ring-[#f33d74] border-none outline-none"
                                    rows={5}
                                    name="message"
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                    placeholder="Type your message..."
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-[#f33d74] hover:bg-[#e63368] rounded-lg text-white font-bold transition-colors flex justify-center"
                            >
                                Send Message
                            </button>
                          
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}