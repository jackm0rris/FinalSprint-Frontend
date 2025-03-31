import React from 'react';
import FlightBoard from '../components/FlightBoard/FlightBoard';

const HomePage = () => {
    return (
        <div className="page-container">
            <h1>Flight Information</h1>
            <FlightBoard />
        </div>
    );
};

export default HomePage;