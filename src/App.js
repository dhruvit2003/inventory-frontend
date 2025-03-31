import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ItemList from './components/ItemList';
import AddItem from './components/AddItem';
import BuyingTransaction from './components/BuyingTransaction';
import SellingTransaction from './components/SellingTransaction';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<ItemList />} />
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/buy" element={<BuyingTransaction />} />
            <Route path="/sell" element={<SellingTransaction />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;