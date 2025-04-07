import React, { useState, useEffect } from 'react';
import { Table, Select, Button, Tag, Space } from 'antd';
import { fetchAirports, fetchFlights } from '../../services/api';
import { format } from 'date-fns';
import './FlightBoard.css';

const { Option } = Select;

const FlightBoard = () => {
    // State hooks for storing data and loading state
    const [allFlights, setAllFlights] = useState([]); // Stores all flights
    const [filteredFlights, setFilteredFlights] = useState([]); // Stores filtered flights based on selected airport and view (departures or arrivals)
    const [airports, setAirports] = useState([]); // Stores all airports
    const [selectedAirport, setSelectedAirport] = useState(null); // Tracks selected airport
    const [view, setView] = useState('departures'); // Tracks current view (departures or arrivals)
    const [loading, setLoading] = useState(false); // Loading state for async requests

    // Fetch airports and flights when component mounts
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                // Fetch airports and flights data
                const airportsResponse = await fetchAirports();
                setAirports(airportsResponse.data);

                const flightsResponse = await fetchFlights();
                setAllFlights(flightsResponse.data);

                // Set the first airport as the default selection
                if (airportsResponse.data.length > 0) {
                    setSelectedAirport(airportsResponse.data[0].id);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Filter flights based on selected airport and view
    useEffect(() => {
        if (selectedAirport) {
            const filtered = allFlights.filter(flight =>
                view === 'departures'
                    ? flight.departureAirport?.id === selectedAirport
                    : flight.arrivalAirport?.id === selectedAirport
            );
            setFilteredFlights(filtered);
        }
    }, [selectedAirport, view, allFlights]);

    // Function to get a status tag for flights (with colors)
    const getStatusTag = (status) => {
        const statusColors = {
            SCHEDULED: 'blue',
            BOARDING: 'orange',
            DEPARTED: 'red',
            ARRIVED: 'green',
            DELAYED: 'purple',
            CANCELLED: 'gray',
        };
        return <Tag color={statusColors[status] || 'blue'}>{status}</Tag>;
    };

    // Columns for the table displaying flight information
    const columns = [
        {
            title: 'Flight',
            dataIndex: 'flightNumber',
            key: 'flightNumber',
            width: 100,
        },
        {
            title: 'Airline',
            key: 'airline',
            render: (_, flight) => (
                flight.airline
                    ? `${flight.airline.name} (${flight.airline.code})`
                    : 'N/A'
            ),
        },
        {
            title: view === 'departures' ? 'To' : 'From',
            key: 'destination',
            render: (_, flight) => {
                const airport = view === 'departures'
                    ? flight.arrivalAirport
                    : flight.departureAirport;
                return `${airport?.name || 'N/A'} (${airport?.code || 'N/A'})`;
            },
        },
        {
            title: 'Time',
            key: 'time',
            render: (_, flight) => format(
                new Date(view === 'departures' ? flight.departureTime : flight.arrivalTime),
                'HH:mm'
            ),
            width: 80,
        },
        {
            title: 'Gate',
            key: 'gate',
            render: (_, flight) => flight.gate?.code || '-',
            width: 80,
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, flight) => getStatusTag(flight.status),
            width: 120,
        },
        {
            title: 'Aircraft',
            key: 'aircraftType',
            render: (_, flight) => flight.aircraftType || '-',
        },
    ];

    return (
        <div className="flight-board">
            <div className="controls">
                {/* Dropdown to select an airport */}
                <Select
                    value={selectedAirport}
                    onChange={setSelectedAirport}
                    style={{ width: 200 }}
                    loading={!airports.length}
                >
                    {airports.map(airport => (
                        <Option key={airport.id} value={airport.id}>
                            {airport.name} ({airport.code})
                        </Option>
                    ))}
                </Select>

                {/* Buttons to switch between Departures and Arrivals view */}
                <Space style={{ marginLeft: 16 }}>
                    <Button
                        type={view === 'departures' ? 'primary' : 'default'}
                        onClick={() => setView('departures')}
                    >
                        Departures
                    </Button>
                    <Button
                        type={view === 'arrivals' ? 'primary' : 'default'}
                        onClick={() => setView('arrivals')}
                    >
                        Arrivals
                    </Button>
                </Space>
            </div>

            {/* Table displaying filtered flights */}
            <Table
                dataSource={filteredFlights}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={false}
                scroll={{ x: true }}
                style={{ marginTop: 16 }}
            />
        </div>
    );
};

export default FlightBoard;
