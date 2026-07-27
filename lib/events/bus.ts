type EventMap = {
  "appointment.created": {
    appointmentId: string;
    userId: string;
    doctor: string;
    schedule: string;
  };
  "appointment.updated": {
    appointmentId: string;
    userId: string;
    status: string;
    type: string;
  };
  "patient.registered": { userId: string; patientId: string; name: string };
  "settings.updated": { actorId: string };
};

type Handler<K extends keyof EventMap> = (
  payload: EventMap[K]
) => void | Promise<void>;

const listeners: { [K in keyof EventMap]?: Array<Handler<K>> } = {};

export function onEvent<K extends keyof EventMap>(
  event: K,
  handler: Handler<K>
): () => void {
  const list = (listeners[event] ??= []) as Array<Handler<K>>;
  list.push(handler);
  return () => {
    const idx = list.indexOf(handler);
    if (idx >= 0) list.splice(idx, 1);
  };
}

export async function emitEvent<K extends keyof EventMap>(
  event: K,
  payload: EventMap[K]
): Promise<void> {
  const list = (listeners[event] ?? []) as Array<Handler<K>>;
  for (const handler of list) {
    await handler(payload);
  }
}

export type { EventMap };
