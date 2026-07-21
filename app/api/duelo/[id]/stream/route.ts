import { getCurrentUser } from "@/lib/auth/session";
import { getDuelState, getDuelVersion } from "@/lib/duel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// SSE: empuja el estado de la partida cuando cambia (poll de `version` cada ~1s).
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("No autorizado", { status: 401 });
  const { id } = await params;

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (s: string) => {
        try {
          controller.enqueue(enc.encode(s));
        } catch {
          /* stream cerrado */
        }
      };

      try {
        const initial = await getDuelState(user.id, id);
        if (!initial) {
          controller.close();
          return;
        }
        send(`data: ${JSON.stringify(initial)}\n\n`);
        let last = initial.version;
        if (initial.status === "FINISHED" || initial.status === "CANCELLED") {
          controller.close();
          return;
        }

        let ticks = 0;
        while (!req.signal.aborted) {
          await sleep(1000);
          const v = await getDuelVersion(user.id, id);
          if (v === null) break;
          if (v !== last) {
            const state = await getDuelState(user.id, id);
            if (state) {
              send(`data: ${JSON.stringify(state)}\n\n`);
              last = state.version;
              if (state.status === "FINISHED" || state.status === "CANCELLED") break;
            }
          } else if (++ticks % 15 === 0) {
            send(`: keep-alive\n\n`);
          }
        }
      } catch {
        /* ignora */
      } finally {
        try {
          controller.close();
        } catch {
          /* ya cerrado */
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
