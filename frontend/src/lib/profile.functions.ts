import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const obtenerPerfil = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles").select("id, email, nombre, plan, fecha_registro")
      .eq("id", context.userId).maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const actualizarPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ plan: z.enum(["free", "premium", "familiar"]) }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").update({ plan: data.plan }).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
