import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminPanel from './AdminPanel';
import '@testing-library/jest-dom';
import * as api from '../../services/api';

// Mock all the API calls
jest.mock('../../services/api');

beforeEach(() => {
    api.fetchAirlines.mockResolvedValue({ data: [] });
    api.fetchAirports.mockResolvedValue({ data: [] });
    api.fetchGates.mockResolvedValue({ data: [] });
    api.fetchFlights.mockResolvedValue({ data: [] });
});

test('renders the AdminPanel component without crashing', async () => {
    render(<AdminPanel />);
    expect(await screen.findByText('Add New Flight')).toBeInTheDocument();
});

test('renders flight form fields', async () => {
    render(<AdminPanel />);
    expect(await screen.findByLabelText(/Flight Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Airline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Departure Airport/i)).toBeInTheDocument();
});

test('renders tabs for Flights, Airlines, and Gates', async () => {
    render(<AdminPanel />);
    expect(await screen.findByText('Flights')).toBeInTheDocument();
    expect(screen.getByText('Airlines')).toBeInTheDocument();
    expect(screen.getByText('Gates')).toBeInTheDocument();
});
