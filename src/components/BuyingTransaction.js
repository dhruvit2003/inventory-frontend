import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BuyingTransaction = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
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

    try {
      setSubmitLoading(true);
      setError(null);
      await axios.post('http://localhost:8000/api/buying-transactions/', {
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
      
      // Redirect after delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Error adding buying transaction:', err);
      setError('Failed to submit transaction. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemSelect = (id, name) => {
    setFormData(prev => ({
      ...prev,
      item: id,
      searchTerm: name
    }));
    setFilteredItems([]);
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3>Add Buying Transaction</h3>
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
                          className="dropdown-item" 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            handleItemSelect(item.id, item.name);
                          }}
                        >
                          {item.name} (Available: {item.no_of_available_item})
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="no_of_item" className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    id="no_of_item"
                    name="no_of_item"
                    value={formData.no_of_item}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="price_of_one_piece" className="form-label">Price per Unit (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="price_of_one_piece"
                    name="price_of_one_piece"
                    value={formData.price_of_one_piece}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="total_rupees" className="form-label">Total Amount (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="total_rupees"
                    value={formData.total_rupees}
                    readOnly
                  />
                </div>
                <div className="d-flex justify-content-end">
                  <button 
                    type="button" 
                    className="btn btn-secondary me-2" 
                    onClick={() => navigate('/')}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitLoading}
                  >
                    {submitLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : 'Submit'}
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

export default BuyingTransaction;