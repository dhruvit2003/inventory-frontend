import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SellingTransaction = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [selectedItemStock, setSelectedItemStock] = useState(0);
    const [formData, setFormData] = useState({
        item: '',
        searchTerm: '',
        no_of_item: 1,
        price_of_one_piece: 0,
        total_rupees: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8000/api/items/');
                setItems(response.data);
                setFilteredItems(response.data);
            } catch (err) {
                console.error('Error fetching items:', err);
                setError('Failed to load items. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    useEffect(() => {
        // Calculate total rupees
        const total = formData.no_of_item * formData.price_of_one_piece;
        setFormData(prev => ({
            ...prev,
            total_rupees: total
        }));
    }, [formData.no_of_item, formData.price_of_one_piece]);

    useEffect(() => {
        // Filter items based on search term
        if (formData.searchTerm) {
            const filtered = items.filter(item =>
                item.name.toLowerCase().includes(formData.searchTerm.toLowerCase())
            );
            setFilteredItems(filtered);
        } else {
            setFilteredItems(items);
        }
    }, [formData.searchTerm, items]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.item === '') {
            setError('Please select an item');
            return;
        }

        if (formData.no_of_item > selectedItemStock) {
            setError(`Not enough items in stock. Available: ${selectedItemStock}`);
            return;
        }

        try {
            setSubmitLoading(true);
            setError(null);
            await axios.post('http://localhost:8000/api/selling-transactions/', {
                item: formData.item,
                no_of_item: formData.no_of_item,
                price_of_one_piece: formData.price_of_one_piece
            });

            setSuccess(true);
            // Reset form
            setFormData({
                item: '',
                searchTerm: '',
                no_of_item: 1,
                price_of_one_piece: 0,
                total_rupees: 0
            });
            setSelectedItemStock(0);

            // Redirect after delay  
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (err) {
            console.error('Error adding selling transaction:', err);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Failed to submit transaction. Please try again.');
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Validate quantity against available stock
        if (name === 'no_of_item' && parseInt(value) > selectedItemStock) {
            setError(`Cannot exceed available stock (${selectedItemStock})`);
        } else {
            setError(null);
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleItemSelect = (id, name, stock) => {
        setFormData(prev => ({
            ...prev,
            item: id,
            searchTerm: name,
            no_of_item: Math.min(prev.no_of_item, stock) || 1
        }));
        setSelectedItemStock(stock);
        setFilteredItems([]);
        // Clear any previous errors
        setError(null);
    };

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            <h3>Add Selling Transaction</h3>
                        </div>
                        <div className="card-body">
                            {success && (
                                <div className="alert alert-success">
                                    Transaction recorded successfully!
                                </div>
                            )}
                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3 position-relative">
                                    <label htmlFor="searchTerm" className="form-label">Item Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="searchTerm"
                                        name="searchTerm"
                                        value={formData.searchTerm}
                                        onChange={handleChange}
                                        placeholder="Type to search items..."
                                        required
                                    />
                                    {formData.searchTerm && filteredItems.length > 0 && (
                                        <div className="dropdown-menu show w-100">
                                            {filteredItems.map(item => (
                                                <a
                                                    key={item.id}
                                                    className={`dropdown-item ${item.no_of_available_item === 0 ? 'text-muted' : ''}`}
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (item.no_of_available_item > 0) {
                                                            handleItemSelect(item.id, item.name, item.no_of_available_item);
                                                        }
                                                    }
                                                    }
                                                >
                                                    {item.name} (Available: {item.no_of_available_item})
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="no_of_item" className="form-label">Number of Items</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="no_of_item"
                                        name="no_of_item"
                                        value={formData.no_of_item}
                                        onChange={handleChange}
                                        min="1"
                                        max={selectedItemStock}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="price_of_one_piece" className="form-label">Price per Item</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="price_of_one_piece"
                                        name="price_of_one_piece"
                                        value={formData.price_of_one_piece}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="total_rupees" className="form-label">Total Amount (₹)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="total_rupees"
                                        name="total_rupees"
                                        value={formData.total_rupees}
                                        readOnly
                                    />
                                </div>
                                <div className="d-flex justify-content-end">
                                    <button type="button" className="btn btn-secondary me-2" onClick={() => navigate('/')}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                                        {submitLoading ? 'Submitting...' : 'Submit'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellingTransaction;
