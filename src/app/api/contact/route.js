import nodemailer from 'nodemailer';

export async function POST(request) {
    const { name, email, message, captcha } = await request.json();

    // Cek hanya apakah captcha diisi (tidak kosong/null)
    if (!captcha) {
        return new Response(JSON.stringify({ error: "Captcha is required." }), { status: 400 });
    }

    // Format pesan email lebih rapih
    const mailText = [
        `Name    : ${name}`,
        `Email   : ${email}`,
        "",
        "Message:",
        message
    ].join('\n');

    // --- Nodemailer setup ---
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'projectclandestine103@gmail.com',
            pass: 'fhly fsvk beop vgmd',
        },
    });

    try {
        await transporter.sendMail({
            from: `"${name}" <${email}>`,
            to: 'vertegenwoordiger@clandestineproject.nl',
            subject: `[Contact Form] Message from ${name}`,
            text: mailText,
        });
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}