// Use the current hostname so the app works on localhost AND network IP
const API_HOST = window.location.hostname;
const API_BASE = `http://${API_HOST}:5000`;

export default API_BASE;
