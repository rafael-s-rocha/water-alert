import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.ALERT_SECRET}`) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));

    const nivel = Number(payload.nivel ?? 100);
    const isCritical = nivel >= 100;
    const emoji = isCritical ? "🚨" : "⚠️";
    const tipoAlerta = isCritical ? "ALERTA CRÍTICO" : "ATENÇÃO";
    const horario = new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        dateStyle: "short",
        timeStyle: "medium",
    });

    const smsBody =
        `${emoji} ESPOCOL - ${tipoAlerta}\n\n` +
        "📍 Sensor: Reservatório Principal\n" +
        `📊 Nível: ${nivel}%\n` +
        `⚠️ Status: ${isCritical ? "Risco de transbordo!" : "Próximo da capacidade máxima!"}\n` +
        `🕒 Horário: ${horario}`;

    const client = twilio(
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET,
        {
            accountSid: process.env.TWILIO_ACCOUNT_SID,
        }
    )

    const msg = await client.messages.create({
        body: smsBody,
        from: process.env.TWILIO_SMS_FROM!,
        to: process.env.TWILIO_SMS_TO!,
    });

    return NextResponse.json({
        ok: true,
        sid: msg.sid,
        status: msg.status,
    });
}