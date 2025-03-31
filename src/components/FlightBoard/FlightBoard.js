import React, { useState, useEffect } from 'react';
import { Table, Select, Button, Tag, Space } from 'antd';
import { fetchAirports, fetchDepartures, fetchArrivals } from '../../services/api';
import { format } from 'date-fns';
import './FlightBoard.css';

const { Option } = Select;

const FlightBoard = () => {
    const [flights, setFlights] = useState([]);
    const [airports, setAirports] = useState([]);
    const [selectedAirport, setSelectedAirport] = useState(null);
    const [view, setView] = useState('departures');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadAirports = async () => {
            try {
                const response = await fetchAirports();
                setAirports(response.data);
                if (response.data.length > 0) {
                    setSelectedAirport(response.data[0].id);
                }
            } catch (error) {
                console.error('Error loading airports:', error);
            }
        };
        loadAirports();
    }, []);

    useEffect(() => {
        if (selectedAirport) {
            const loadFlights = async () => {
                setLoading(true);
                try {
                    const response = view === 'departures'
                        ? await fetchDepartures(selectedAirport)
                        : await fetchArrivals(selectedAirport);
                    setFlights(response.data);
                } catch (error) {
                    console.error('Error loading flights:', error);
                } finally {
                    setLoading(false);
                }
            };
            loadFlights();
        }
    }, [selectedAirport, view]);

    const getStatusTag = (status) => {
        let color;
        switch (status) {
            case 'SCHEDULED':
                color = 'blue';
                break;
            case 'BOARDING':
                color = 'orange';
                break;
            case 'DEPARTED':
                color = 'red';
                break;
            case 'ARRIVED':
                color = 'green';
                break;
            case 'DELAYED':
                color = 'purple';
                break;
            case 'CANCELLED':
                color = 'gray';
                break;
            default:
                color = 'blue';
        }
        return <Tag color={color}>{status}</Tag>;
    };

    const columns = [
        {
            title: 'Flight',
            dataIndex: 'flightNumber',
            key: 'flightNumber',
            width: 100,
        },
        {
            title: 'Airline',
            dataIndex: ['airline', 'name'],
            key: 'airline',
            render: (_, record) => `${record.airline.name} (${record.airline.code})`,
        },
        {
            title: view === 'departures' ? 'To' : 'From',
            key: 'destination',
            render: (_, record) => (
                view === 'departures'
                    ? `${record.arrivalAirport.name} (${record.arrivalAirport.code})`
                    : `${record.departureAirport.name} (${record.departureAirport.code})`
            ),
        },
        {
            title: 'Time',
            key: 'time',
            render: (_, record) => (
                view === 'departures'
                    ? format(new Date(record.departureTime), 'HH:mm')
                    : format(new Date(record.arrivalTime), 'HH:mm')
            ),
            width: 80,
        },
        {
            title: 'Gate',
            dataIndex: ['gate', 'code'],
            key: 'gate',
            render: (gate) => gate || '-',
            width: 80,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
            width: 120,
        },
        {
            title: 'Aircraft',
            dataIndex: 'aircraftType',
            key: 'aircraftType',
            render: (type) => type || '-',
        },
    ];

    return (
        <div className="flight-board">
            <div className="controls">
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

            <Table
                dataSource={flights}
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