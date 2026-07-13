import Pusher from "pusher-js";

const PUSHER_APP_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;

// Replace with your Pusher config
const pusher = new Pusher(PUSHER_APP_KEY, {
	cluster: PUSHER_CLUSTER,
});

export default pusher;
