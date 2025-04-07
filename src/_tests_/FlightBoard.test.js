import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import FlightBoard from '../components/FlightBoard/FlightBoard';
import * as api from '../../services/api';
import userEvent from '@testing-library/user-event';

// Mock data
const mockAirports = [
    { id: 1, name: 'JFK Airport', code: 'JFK' },
    { id: 2, name: 'LAX Airport', code: 'LAX' },
];

const mockFlights = [
    {
        id: 101,
        flightNumber: 'AA123',
        airline: { name: 'American Airlines', code: 'AA' },
        departureAirport: { id: 1, name: 'JFK Airport', code: 'JFK' },
        arrivalAirport: { id: 2, name: 'LAX Airport', code: 'LAX' },
        departureTime: new Date().toISOString(),
        arrivalTime: new Date().toISOString(),
        gate: { code: 'A5' },
        status: 'SCHEDULED',
        aircraftType: 'Boeing 737',
    },
];

// Mock API functions
jest.spyOn(api, 'fetchAirports').mockResolvedValue({ data: mockAirports });
jest.spyOn(api, 'fetchFlights').mockResolvedValue({ data: mockFlights });

describe('FlightBoard Component', () => {
    test('renders without crashing', async () => {
        render(<FlightBoard />);
        await waitFor(() => {
            expect(screen.getByText(/Departures/i)).toBeInTheDocument();
        });
    });

    test('shows airport options in dropdown', async () => {
        render(<FlightBoard />);
        await waitFor(() => {
            expect(screen.getByText('JFK Airport (JFK)')).toBeInTheDocument();
            expect(screen.getByText('LAX Airport (LAX)')).toBeInTheDocument();
        });
    });

    test('Departures button is selected by default', async () => {
        render(<FlightBoard />);
        await waitFor(() => {
            const departuresBtn = screen.getByRole('button', { name: 'Departures' });
            expect(departuresBtn).toHaveClass('ant-btn-primary');
        });
    });
});
