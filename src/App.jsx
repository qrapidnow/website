import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TableOverview from './components/TableOverview';
import TableDetails from './components/TableDetails';
import Menu from './components/Menu';
import RestaurantDetails from './components/RestaurantDetails';
import './App.css';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/clerk-react';

const backendApiUrl = import.meta.env.VITE_CLERK_BACKEND_API;

const App = () => {
  const [tables, setTables] = useState(Array.from({ length: 15 }, (_, index) => `T${index + 1}`));
  const [currentPage, setCurrentPage] = useState('RestaurantDetails');
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableColors, setTableColors] = useState(Array(15).fill('blank'));
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchRestaurantDetails();
    }
  }, [user]);

  const fetchRestaurantDetails = async () => {
    try {
      const clientId = user.id;

      const res = await fetch(`${backendApiUrl}/restaurants?clientId=${clientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Fetched Restaurant Details:', data);
      // Handle the fetched restaurant details
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
    }
  };

  const addTable = () => {
    setTables([...tables, `T${tables.length + 1}`]);
    setTableColors([...tableColors, 'blank']);
  };

  const handleLinkClick = (page) => {
    setCurrentPage(page);
    setSelectedTable(null);
  };

  const handleSelectTable = (tableNumber) => {
    setSelectedTable(tableNumber);
    setCurrentPage('TableDetails');
  };

  const handleBackClick = () => {
    setCurrentPage('TableOverview');
    setSelectedTable(null);
  };

  const updateTableColor = (tableIndex, color) => {
    const updatedColors = [...tableColors];
    updatedColors[tableIndex] = color;
    setTableColors(updatedColors);
  };

  const handleGenerateKOT = () => {
    if (selectedTable) {
      const tableIndex = tables.indexOf(selectedTable);
      updateTableColor(tableIndex, 'running-kot');
    }
  };

  const handleGenerateBill = () => {
    if (selectedTable) {
      const tableIndex = tables.indexOf(selectedTable);
      updateTableColor(tableIndex, 'printed');
    }
  };

  const handleComplete = () => {
    if (selectedTable) {
      const tableIndex = tables.indexOf(selectedTable);
      updateTableColor(tableIndex, 'paid');
      setTimeout(() => {
        updateTableColor(tableIndex, 'blank');
      }, 6000);
    }
  };

  const handleSubmitRestaurantDetails = async (details) => {
    try {
      const clientId = user.id;

      const res = await fetch(`${backendApiUrl}/restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          ...details,
          clientId,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Restaurant Details submitted:', data);
      setCurrentPage('TableOverview');
    } catch (error) {
      console.error('Error submitting restaurant details:', error);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'RestaurantDetails':
        return <RestaurantDetails onSubmit={handleSubmitRestaurantDetails} />;
      case 'TableOverview':
        return <TableOverview tables={tables} addTable={addTable} onSelectTable={handleSelectTable} tableColors={tableColors} />;
      case 'TableDetails':
        return <TableDetails tableNumber={selectedTable} onBackClick={handleBackClick} onGenerateKOT={handleGenerateKOT} onGenerateBill={handleGenerateBill} onComplete={handleComplete} />;
      case 'Dashboard':
        return <div>Dashboard Content</div>;
      case 'Menu':
        return <Menu />;
      case 'Orders':
        return <div>Orders Content</div>;
      case 'Reports':
        return <div>Reports Content</div>;
      default:
        return <TableOverview tables={tables} addTable={addTable} onSelectTable={handleSelectTable} tableColors={tableColors} />;
    }
  };

  return (
    <div>
      <Navbar activePage={currentPage} onLinkClick={handleLinkClick} />
      <div className="content">
        <SignedIn>{renderPage()}</SignedIn>
        <SignedOut>
          <div className="signin-container">
            <h1>Welcome! Please sign in to access the Admin Dashboard</h1>
            <SignInButton mode="modal" className="clerk-sign-in-button" />
          </div>
        </SignedOut>
      </div>
    </div>
  );
};


export default App;
