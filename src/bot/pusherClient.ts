import type Pusher from 'pusher-js';

export let pusherClient: Pusher | null = null;

export function setPusherClient(client: Pusher) {
  pusherClient = client;
}
