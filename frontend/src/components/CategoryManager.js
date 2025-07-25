import React, { useState } from 'react';

const CategoryManager = ({ categories, onAddCategory, onDeleteCategory, onClose }) => {
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#6366f1',
    icon: ''
  });

  const [errors, setErrors] = useState({});

  const predefinedColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#6b7280', '#374151', '#111827'
  ];

  const commonIcons = [
    '🍽️', '🚗', '🛍️', '🎬', '⚡', '🏥', '📚', '✈️',
    '💰', '🏦', '🛡️', '🎁', '💅', '🏡', '📊', '☕',
    '🎮', '📱', '👕', '🎵', '🍔', '⛽', '🚌', '🏋️',
    '💊', '📝', '🔧', '🌍', '💳', '🎯', '🛒', '🎨'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onAddCategory(newCategory);
    setNewCategory({
      name: '',
      color: '#6366f1',
      icon: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!newCategory.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    // Check if category name already exists
    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === newCategory.name.trim().toLowerCase()
    );
    if (existingCategory) {
      newErrors.name = 'Category name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setNewCategory(prev => ({
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">🏷️ Manage Categories</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-content">
          {/* Add New Category Form */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', fontWeight: '600' }}>
              Add New Category
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="categoryName" className="form-label">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="categoryName"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Enter category name"
                  value={newCategory.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                {errors.name && (
                  <span className="error-text">{errors.name}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Icon</label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(8, 1fr)', 
                  gap: '8px',
                  marginBottom: '10px'
                }}>
                  {commonIcons.map((icon, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleChange('icon', icon)}
                      style={{
                        padding: '8px',
                        border: newCategory.icon === icon ? '2px solid #4f46e5' : '2px solid #e2e8f0',
                        borderRadius: '6px',
                        background: newCategory.icon === icon ? '#f0f4ff' : 'white',
                        cursor: 'pointer',
                        fontSize: '16px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Or enter custom emoji"
                  value={newCategory.icon}
                  onChange={(e) => handleChange('icon', e.target.value)}
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(10, 1fr)', 
                  gap: '8px',
                  marginBottom: '10px'
                }}>
                  {predefinedColors.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleChange('color', color)}
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: color,
                        border: newCategory.color === color ? '3px solid #4f46e5' : '2px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  className="form-input"
                  value={newCategory.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  style={{ height: '40px' }}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  Add Category
                </button>
              </div>
            </form>
          </div>

          {/* Existing Categories */}
          <div>
            <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', fontWeight: '600' }}>
              Existing Categories ({categories.length})
            </h3>
            
            {categories.length === 0 ? (
              <div className="empty-state">
                <p>No categories found</p>
              </div>
            ) : (
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}>
                {categories.map((category) => (
                  <div 
                    key={category.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderBottom: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div 
                        style={{
                          width: '16px',
                          height: '16px',
                          backgroundColor: category.color,
                          borderRadius: '50%',
                          flexShrink: 0
                        }}
                      />
                      <span style={{ fontSize: '16px' }}>
                        {category.icon} {category.name}
                      </span>
                    </div>
                    
                    <button
                      className="btn-small btn-delete"
                      onClick={() => onDeleteCategory(category.id)}
                      title="Delete category"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Close Button */}
          <div style={{ 
            marginTop: '20px', 
            paddingTop: '20px', 
            borderTop: '1px solid #e2e8f0',
            textAlign: 'right'
          }}>
            <button className="btn-cancel" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;