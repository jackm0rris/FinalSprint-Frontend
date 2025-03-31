import React, { useState, useEffect } from 'react';
import { Tabs, Form, Input, Button, Select, DatePicker, message, Table, Space } from 'antd';
import {
    fetchAirlines,
    fetchAirports,
    fetchGates,
    fetchFlights,
    createFlight,
    updateFlight,
    deleteFlight,
    createAirline,
    createGate
} from '../../services/api';
import { format } from 'date-fns';
import './AdminPanel.css';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminPanel = () => {
    const [form] = Form.useForm();
    const [airlines, setAirlines] = useState([]);
    const [airports, setAirports] = useState([]);
    const [gates, setGates] = useState([]);
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAirport, setSelectedAirport] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [airlinesRes, airportsRes, gatesRes, flightsRes] = await Promise.all([
                    fetchAirlines(),
                    fetchAirports(),
                    fetchGates(),
                    fetchFlights()
                ]);
                setAirlines(airlinesRes.data);
                setAirports(airportsRes.data);
                setGates(gatesRes.data);
                setFlights(flightsRes.data);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadData();
    }, []);

    const handleAirportChange = async (airportId) => {
        setSelectedAirport(airportId);
        try {
            const response = await fetchGatesByAirport(airportId);
            setGates(response.data);
        } catch (error) {
            console.error('Error loading gates:', error);
        }
    };

    const onFlightFinish = async (values) => {
        try {
            values.departureTime = values.departureTime.toISOString();
            values.arrivalTime = values.arrivalTime.toISOString();

            await createFlight(values);
            message.success('Flight added successfully');
            form.resetFields();

            // Refresh flights list
            const response = await fetchFlights();
            setFlights(response.data);
        } catch (error) {
            message.error('Failed to add flight');
        }
    };

    const onAirlineFinish = async (values) => {
        try {
            await createAirline(values);
            message.success('Airline added successfully');

            // Refresh airlines list
            const response = await fetchAirlines();
            setAirlines(response.data);
        } catch (error) {
            message.error('Failed to add airline');
        }
    };

    const onGateFinish = async (values) => {
        try {
            await createGate(values);
            message.success('Gate added successfully');

            // Refresh gates list
            const response = await fetchGates();
            setGates(response.data);
        } catch (error) {
            message.error('Failed to add gate');
        }
    };

    const handleDeleteFlight = async (id) => {
        try {
            await deleteFlight(id);
            message.success('Flight deleted successfully');

            // Refresh flights list
            const response = await fetchFlights();
            setFlights(response.data);
        } catch (error) {
            message.error('Failed to delete flight');
        }
    };

    const flightColumns = [
        {
            title: 'Flight Number',
            dataIndex: 'flightNumber',
            key: 'flightNumber',
        },
        {
            title: 'Airline',
            key: 'airline',
            render: (_, record) => `${record.airline.name} (${record.airline.code})`,
        },
        {
            title: 'Departure',
            key: 'departure',
            render: (_, record) => `${record.departureAirport.code} @ ${format(new Date(record.departureTime), 'HH:mm')}`,
        },
        {
            title: 'Arrival',
            key: 'arrival',
            render: (_, record) => `${record.arrivalAirport.code} @ ${format(new Date(record.arrivalTime), 'HH:mm')}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleDeleteFlight(record.id)}>Delete</Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-panel">
            <Tabs defaultActiveKey="1">
                <TabPane tab="Flights" key="1">
                    <div className="admin-section">
                        <h3>Add New Flight</h3>
                        <Form form={form} onFinish={onFlightFinish} layout="vertical">
                            <Form.Item name="flightNumber" label="Flight Number" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>

                            <Form.Item name="airlineId" label="Airline" rules={[{ required: true }]}>
                                <Select>
                                    {airlines.map(airline => (
                                        <Option key={airline.id} value={airline.id}>
                                            {airline.name} ({airline.code})
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item name="departureAirportId" label="Departure Airport" rules={[{ required: true }]}>
                                <Select onChange={handleAirportChange}>
                                    {airports.map(airport => (
                                        <Option key={airport.id} value={airport.id}>
                                            {airport.name} ({airport.code})
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item name="arrivalAirportId" label="Arrival Airport" rules={[{ required: true }]}>
                                <Select>
                                    {airports.map(airport => (
                                        <Option key={airport.id} value={airport.id}>
                                            {airport.name} ({airport.code})
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item name="gateId" label="Gate">
                                <Select>
                                    {gates.filter(g => g.airport.id === selectedAirport).map(gate => (
                                        <Option key={gate.id} value={gate.id}>
                                            {gate.terminal}-{gate.code}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item name="departureTime" label="Departure Time" rules={[{ required: true }]}>
                                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item name="arrivalTime" label="Arrival Time" rules={[{ required: true }]}>
                                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item name="aircraftType" label="Aircraft Type">
                                <Input />
                            </Form.Item>

                            <Form.Item name="status" label="Status" initialValue="SCHEDULED">
                                <Select>
                                    <Option value="SCHEDULED">Scheduled</Option>
                                    <Option value="BOARDING">Boarding</Option>
                                    <Option value="DEPARTED">Departed</Option>
                                    <Option value="ARRIVED">Arrived</Option>
                                    <Option value="DELAYED">Delayed</Option>
                                    <Option value="CANCELLED">Cancelled</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Add Flight
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>

                    <div className="admin-section">
                        <h3>All Flights</h3>
                        <Table
                            dataSource={flights}
                            columns={flightColumns}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                        />
                    </div>
                </TabPane>

                <TabPane tab="Airlines" key="2">
                    <div className="admin-section">
                        <h3>Add New Airline</h3>
                        <Form onFinish={onAirlineFinish} layout="vertical">
                            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>

                            <Form.Item name="code" label="Code" rules={[{ required: true }]}>
                                <Input maxLength={2} style={{ width: 100 }} />
                            </Form.Item>

                            <Form.Item name="country" label="Country">
                                <Input />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Add Airline
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>

                    <div className="admin-section">
                        <h3>All Airlines</h3>
                        <Table
                            dataSource={airlines}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                        >
                            <Table.Column title="Name" dataIndex="name" key="name" />
                            <Table.Column title="Code" dataIndex="code" key="code" />
                            <Table.Column title="Country" dataIndex="country" key="country" />
                        </Table>
                    </div>
                </TabPane>

                <TabPane tab="Gates" key="3">
                    <div className="admin-section">
                        <h3>Add New Gate</h3>
                        <Form onFinish={onGateFinish} layout="vertical">
                            <Form.Item name="code" label="Gate Code" rules={[{ required: true }]}>
                                <Input style={{ width: 100 }} />
                            </Form.Item>

                            <Form.Item name="terminal" label="Terminal">
                                <Input />
                            </Form.Item>

                            <Form.Item name="airportId" label="Airport" rules={[{ required: true }]}>
                                <Select>
                                    {airports.map(airport => (
                                        <Option key={airport.id} value={airport.id}>
                                            {airport.name} ({airport.code})
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Add Gate
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>

                    <div className="admin-section">
                        <h3>All Gates</h3>
                        <Table
                            dataSource={gates}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                        >
                            <Table.Column title="Code" dataIndex="code" key="code" />
                            <Table.Column title="Terminal" dataIndex="terminal" key="terminal" />
                            <Table.Column
                                title="Airport"
                                key="airport"
                                render={(_, record) => `${record.airport.name} (${record.airport.code})`}
                            />
                        </Table>
                    </div>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default AdminPanel;