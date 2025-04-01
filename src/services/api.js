import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api' ; // Change to your backend URL

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchAirports = () => api.get('/airports');
export const fetchAirlines = () => api.get('/airlines');
export const fetchGates = () => api.get('/gates');
export const fetchGatesByAirport = (airportId) => api.get(`/gates/airport/${airportId}`);
export const fetchFlights = () => api.get('/flights');
export const fetchDepartures = (airportId) => api.get(`/flights/departures?airport=${airportId}`);
export const fetchArrivals = (airportId) => api.get(`/flights/arrivals?airport=${airportId}`);

export const createFlight = (flightData) => api.post('/flights', flightData);
export const updateFlight = (id, flightData) => api.put(`/flights/${id}`, flightData);
export const deleteFlight = (id) => api.delete(`/flights/${id}`);

export const createAirline = (airlineData) => api.post('/airlines', airlineData);
export const createGate = (gateData) => api.post('/gates', gateData);

export default api;