import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.ALERT_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json().catch(() => ({}));

  const nivel = Number(payload.nivel ?? 100);
  const deviceId = String(payload.device_id ?? "esp32-01");

  const isCritical = nivel >= 100;
  const status = isCritical ? "CRITICAL" : "WARNING";
  const smsDryRun = process.env.SMS_DRY_RUN === "true";

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

  let smsSent = false;
  let twilioSid: string | null = null;
  let errorMessage: string | null = null;
  let twilioStatus: string | null = null;

  try {
    if (smsDryRun) {
      console.log("[SMS DRY RUN]", {
        to: process.env.TWILIO_SMS_TO,
        body: smsBody,
      });
    } else {
      const client = twilio(
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET,
        {
          accountSid: process.env.TWILIO_ACCOUNT_SID,
        }
      );

      const msg = await client.messages.create({
        body: smsBody,
        from: process.env.TWILIO_SMS_FROM!,
        to: process.env.TWILIO_SMS_TO!,
      });

      smsSent = true;
      twilioSid = msg.sid;
      twilioStatus = msg.status;
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao enviar SMS";
  }

  const { error: dbError } = await supabase.from("sensor_readings").insert({
    device_id: deviceId,
    water_level_percent: nivel,
    status,
    sms_sent: smsSent,
    sms_dry_run: smsDryRun,
    twilio_sid: twilioSid,
    error_message: errorMessage,
    raw_payload: payload,
  });

  if (dbError) {
    console.error("[SUPABASE ERROR]", dbError.message);
  }

  return NextResponse.json({
    ok: true,
    nivel,
    status,
    sms: {
      sent: smsSent,
      dryRun: smsDryRun,
      sid: twilioSid,
      status: twilioStatus,
      error: errorMessage,
    },
    database: {
      saved: !dbError,
      error: dbError?.message ?? null,
    },
  });
}