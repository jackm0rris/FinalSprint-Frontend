import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import './NavBar.css';

const NavBar = () => {
    return (
        <Menu mode="horizontal" theme="dark" className="navbar">
            <Menu.Item key="home">
                <Link to="/">Flight Information</Link>
            </Menu.Item>
            <Menu.Item key="admin">
                <Link to="/admin">Admin Panel</Link>
            </Menu.Item>
        </Menu>
    );
};

export default NavBar;