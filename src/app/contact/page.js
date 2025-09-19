'use client'

import Image from "next/image";
import Navbar from "../../components/navbar";
import { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { FaRegPaperPlane } from "react-icons/fa"; // Icon email sent

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState("");
    const captchaRef = useRef(null);

    // Submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const captchaValue = captchaRef.current.getValue();
        if (!captchaValue) {
            setError("Captcha wajib diisi.");
            setLoading(false);
            return;
        }

        const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...form, captcha: captchaValue }),
        });
        const data = await res.json();
        setLoading(false);

        if (data.success) {
            setShowModal(true);
            setForm({ name: "", email: "", message: "" });
            captchaRef.current.reset();
        } else {
            setError(data.error || "Gagal mengirim pesan.");
        }
    };

    const closeModal = () => {
        setShowModal(false);
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
                        <form className="space-y-6" onSubmit={handleSubmit}>
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
                            <div className="mb-4 flex justify-center">
                                <ReCAPTCHA
                                    sitekey="6Lcvh3ErAAAAAA1clQ_IFIvC8l4aZro2poENUncA"
                                    ref={captchaRef}
                                    theme="dark"
                                />
                            </div>
                            {error && (
                                <div className="text-xs text-red-500 mt-2 text-center">{error}</div>
                            )}
                            <button
                                type="submit"
                                className="w-full py-3 bg-[#f33d74] hover:bg-[#e63368] rounded-lg text-white font-bold transition-colors flex justify-center"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send Message"}
                            </button>
                        </form>
                        {/* Modal success */}
                        {showModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg shadow-lg p-8 text-center flex flex-col items-center">
                                    <FaRegPaperPlane className="text-[#f33d74] mb-4" size={48}/>
                                    <h3 className="text-2xl font-bold text-[#f33d74] mb-2">Success!</h3>
                                    <p className="text-gray-700 mb-4">Your message has been sent.</p>
                                    <button
                                        className="px-6 py-2 bg-[#f33d74] text-white rounded font-bold"
                                        onClick={closeModal}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}