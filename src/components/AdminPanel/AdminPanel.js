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
    createGate,
    fetchGatesByAirport
} from '../../services/api';
import { format } from 'date-fns';
import './AdminPanel.css';

const { TabPane } = Tabs;
const { Option } = Select;

const AdminPanel = () => {
    // Form instance and state hooks
    const [form] = Form.useForm();
    const [airlines, setAirlines] = useState([]);
    const [airports, setAirports] = useState([]);
    const [gates, setGates] = useState([]);
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAirport, setSelectedAirport] = useState(null);

    // Function to load data from APIs (Airlines, Airports, Gates, Flights)
    const loadData = async () => {
        setLoading(true);
        try {
            const [
                airlinesResponse,
                airportsResponse,
                gatesResponse,
                flightsResponse
            ] = await Promise.all([
                fetchAirlines(),
                fetchAirports(),
                fetchGates(),
                fetchFlights()
            ]);

            // Filter and set the response data
            const airlinesData = airlinesResponse.data;
            const airportsData = airportsResponse.data;
            const gatesData = gatesResponse.data;
            const flightsData = flightsResponse.data;

            setAirlines(Array.isArray(airlinesData) ? airlinesData.filter(a => a?.id && a?.name && a?.code) : []);
            setAirports(Array.isArray(airportsData) ? airportsData : []);
            setGates(Array.isArray(gatesData) ? gatesData : []);
            setFlights(Array.isArray(flightsData) ? flightsData : []);

        } catch (error) {
            console.error('Error loading data:', error);
            message.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Run the loadData function when the component mounts
    useEffect(() => {
        loadData();
    }, []);

    // Handle the change of selected airport and fetch corresponding gates
    const handleAirportChange = async (airportId) => {
        try {
            setSelectedAirport(airportId);
            const response = await fetchGatesByAirport(airportId);
            const gatesData = response.data;
            setGates(Array.isArray(gatesData) ? gatesData : []);
        } catch (error) {
            console.error('Error loading gates:', error);
            message.error('Failed to load gates');
        }
    };

    // Handle the form submission for adding a new flight
    const onFlightFinish = async (values) => {
        try {
            const flightData = {
                ...values,
                airline: { id: values.airlineId },
                departureAirport: { id: values.departureAirportId },
                arrivalAirport: { id: values.arrivalAirportId },
                gate: values.gateId ? { id: values.gateId } : null,
                departureTime: values.departureTime.toISOString(),
                arrivalTime: values.arrivalTime.toISOString()
            };

            // Clean up form data before sending to API
            delete flightData.airlineId;
            delete flightData.departureAirportId;
            delete flightData.arrivalAirportId;
            delete flightData.gateId;

            await createFlight(flightData);
            message.success('Flight added successfully');
            form.resetFields();
            await loadData();
        } catch (error) {
            console.error('Error creating flight:', error);
            message.error('Failed to add flight');
        }
    };

    // Handle the form submission for adding a new airline
    const onAirlineFinish = async (values) => {
        try {
            await createAirline(values);
            message.success('Airline added successfully');
            await loadData();
        } catch (error) {
            console.error('Error creating airline:', error);
            message.error('Failed to add airline');
        }
    };

    // Handle the form submission for adding a new gate
    const onGateFinish = async (values) => {
        try {
            await createGate(values);
            message.success('Gate added successfully');
            await loadData();
        } catch (error) {
            console.error('Error creating gate:', error);
            message.error('Failed to add gate');
        }
    };

    // Handle the deletion of a flight
    const handleDeleteFlight = async (id) => {
        try {
            await deleteFlight(id);
            message.success('Flight deleted successfully');
            await loadData();
        } catch (error) {
            console.error('Error deleting flight:', error);
            message.error('Failed to delete flight');
        }
    };

    // Function to render dropdown options for select fields
    const renderDropdownOptions = (data, label = 'name', sub = 'code') => {
        if (loading) return <Option disabled>Loading...</Option>;
        if (!Array.isArray(data) || data.length === 0) return <Option disabled>No options available</Option>;

        return data.map(item => (
            <Option key={item.id} value={item.id}>
                {item[label]} ({item[sub]})
            </Option>
        ));
    };

    // Table columns for displaying flight data
    const flightColumns = [
        {
            title: 'Flight Number',
            dataIndex: 'flightNumber',
            key: 'flightNumber',
        },
        {
            title: 'Airline',
            key: 'airline',
            render: (_, record) => record?.airline ? `${record.airline.name} (${record.airline.code})` : 'N/A',
        },
        {
            title: 'Departure',
            key: 'departure',
            render: (_, record) => record?.departureAirport?.code
                ? `${record.departureAirport.code} @ ${format(new Date(record.departureTime), 'HH:mm')}`
                : 'N/A',
        },
        {
            title: 'Arrival',
            key: 'arrival',
            render: (_, record) => record?.arrivalAirport?.code
                ? `${record.arrivalAirport.code} @ ${format(new Date(record.arrivalTime), 'HH:mm')}`
                : 'N/A',
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
                    <Button type="link" onClick={() => handleDeleteFlight(record?.id)}>Delete</Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="admin-panel">
            <Tabs defaultActiveKey="1">
                {/* Flights Tab */}
                <TabPane tab="Flights" key="1" forceRender>
                    <div className="admin-section">
                        <h3>Add New Flight</h3>
                        <Form form={form} onFinish={onFlightFinish} layout="vertical">
                            <Form.Item name="flightNumber" label="Flight Number" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>

                            <Form.Item name="airlineId" label="Airline" rules={[{ required: true }]}>
                                <Select
                                    loading={loading}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().includes(input.toLowerCase())
                                    }
                                    placeholder="Select an airline"
                                >
                                    {renderDropdownOptions(airlines)}
                                </Select>
                            </Form.Item>

                            <Form.Item name="departureAirportId" label="Departure Airport" rules={[{ required: true }]}>
                                <Select
                                    loading={loading}
                                    onChange={handleAirportChange}
                                    showSearch
                                    optionFilterProp="children"
                                    placeholder="Select departure airport"
                                >
                                    {renderDropdownOptions(airports)}
                                </Select>
                            </Form.Item>

                            <Form.Item name="arrivalAirportId" label="Arrival Airport" rules={[{ required: true }]}>
                                <Select
                                    loading={loading}
                                    showSearch
                                    optionFilterProp="children"
                                    placeholder="Select arrival airport"
                                >
                                    {renderDropdownOptions(airports)}
                                </Select>
                            </Form.Item>

                            <Form.Item name="gateId" label="Gate">
                                <Select
                                    loading={loading}
                                    showSearch
                                    optionFilterProp="children"
                                    placeholder="Select gate"
                                >
                                    {renderDropdownOptions(
                                        gates.filter(g =>
                                            selectedAirport
                                                ? g?.airport?.id === selectedAirport
                                                : true
                                        ),
                                        'terminal',
                                        'code'
                                    )}
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
                                <Button type="primary" htmlType="submit" loading={loading}>
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
                            rowKey={(record) => record?.id || Math.random().toString(36).substr(2, 9)}
                            pagination={{ pageSize: 5 }}
                            loading={loading}
                            locale={{ emptyText: 'No flights found' }}
                        />
                    </div>
                </TabPane>

                {/* Airlines Tab */}
                <TabPane tab="Airlines" key="2" forceRender>
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
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Add Airline
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>

                    <div className="admin-section">
                        <h3>All Airlines</h3>
                        <Table
                            dataSource={airlines}
                            rowKey={(record) => record?.id || Math.random().toString(36).substr(2, 9)}
                            pagination={{ pageSize: 5 }}
                            loading={loading}
                            locale={{ emptyText: 'No airlines found' }}
                        >
                            <Table.Column title="Name" dataIndex="name" key="name" />
                            <Table.Column title="Code" dataIndex="code" key="code" />
                            <Table.Column title="Country" dataIndex="country" key="country" />
                        </Table>
                    </div>
                </TabPane>

                {/* Gates Tab */}
                <TabPane tab="Gates" key="3" forceRender>
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
                                <Select
                                    loading={loading}
                                    showSearch
                                    optionFilterProp="children"
                                    placeholder="Select airport"
                                >
                                    {renderDropdownOptions(airports)}
                                </Select>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Add Gate
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>

                    <div className="admin-section">
                        <h3>All Gates</h3>
                        <Table
                            dataSource={gates}
                            rowKey={(record) => record?.id || Math.random().toString(36).substr(2, 9)}
                            pagination={{ pageSize: 5 }}
                            loading={loading}
                            locale={{ emptyText: 'No gates found' }}
                        >
                            <Table.Column title="Code" dataIndex="code" key="code" />
                            <Table.Column title="Terminal" dataIndex="terminal" key="terminal" />
                            <Table.Column
                                title="Airport"
                                key="airport"
                                render={(_, record) => record?.airport
                                    ? `${record.airport.name} (${record.airport.code})`
                                    : 'N/A'
                                }
                            />
                        </Table>
                    </div>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default AdminPanel;
