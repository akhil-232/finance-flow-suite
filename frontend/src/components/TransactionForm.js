import React, { useState, useEffect } from 'react';

const TransactionForm = ({ categories, transaction, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    category_id: '',
    description: '',
    credited: '',
    debited: '',
    tags: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        transaction_date: transaction.transaction_date,
        category_id: transaction.category_id.toString(),
        description: transaction.description,
        credited: transaction.credited || '',
        debited: transaction.debited || '',
        tags: transaction.tags || '',
        notes: transaction.notes || ''
      });
    }
  }, [transaction]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.transaction_date) {
      newErrors.transaction_date = 'Date is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    const credited = parseFloat(formData.credited) || 0;
    const debited = parseFloat(formData.debited) || 0;

    if (credited === 0 && debited === 0) {
      newErrors.amount = 'Either credited or debited amount must be greater than 0';
    }

    if (credited > 0 && debited > 0) {
      newErrors.amount = 'Cannot have both credited and debited amounts';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      category_id: parseInt(formData.category_id),
      credited: parseFloat(formData.credited) || 0,
      debited: parseFloat(formData.debited) || 0
    };

    onSubmit(submitData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="transaction_date" className="form-label">
                Date *
              </label>
              <input
                type="date"
                id="transaction_date"
                className={`form-input ${errors.transaction_date ? 'error' : ''}`}
                value={formData.transaction_date}
                onChange={(e) => handleChange('transaction_date', e.target.value)}
              />
              {errors.transaction_date && (
                <span className="error-text">{errors.transaction_date}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="category_id" className="form-label">
                Category *
              </label>
              <select
                id="category_id"
                className={`form-select ${errors.category_id ? 'error' : ''}`}
                value={formData.category_id}
                onChange={(e) => handleChange('category_id', e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon ? category.icon + ' ' : ''}{category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <span className="error-text">{errors.category_id}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description *
              </label>
              <input
                type="text"
                id="description"
                className={`form-input ${errors.description ? 'error' : ''}`}
                placeholder="Enter transaction description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
              {errors.description && (
                <span className="error-text">{errors.description}</span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label htmlFor="credited" className="form-label">
                  Credited Amount
                </label>
                <input
                  type="number"
                  id="credited"
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.credited}
                  onChange={(e) => handleChange('credited', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="debited" className="form-label">
                  Debited Amount
                </label>
                <input
                  type="number"
                  id="debited"
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.debited}
                  onChange={(e) => handleChange('debited', e.target.value)}
                />
              </div>
            </div>

            {errors.amount && (
              <div className="error-text" style={{ marginTop: '-10px', marginBottom: '15px' }}>
                {errors.amount}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="tags" className="form-label">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                className="form-input"
                placeholder="e.g., business, personal, urgent (comma separated)"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes" className="form-label">
                Notes
              </label>
              <textarea
                id="notes"
                className="form-textarea"
                placeholder="Additional notes about this transaction"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                {transaction ? 'Update Transaction' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;