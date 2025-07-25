import React, { useState } from 'react';

const Sidebar = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  onDateFilter, 
  dateFilters 
}) => {
  const [tempFilters, setTempFilters] = useState(dateFilters);

  const handleDateChange = (field, value) => {
    const newFilters = { ...tempFilters, [field]: value };
    setTempFilters(newFilters);
    onDateFilter(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = { fromDate: '', toDate: '' };
    setTempFilters(emptyFilters);
    onDateFilter(emptyFilters);
    onCategorySelect('all');
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getWeekAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  };

  const getMonthAgo = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  };

  const setQuickFilter = (type) => {
    let filters = {};
    
    switch(type) {
      case 'today':
        filters = { fromDate: getTodayDate(), toDate: getTodayDate() };
        break;
      case 'week':
        filters = { fromDate: getWeekAgo(), toDate: getTodayDate() };
        break;
      case 'month':
        filters = { fromDate: getMonthAgo(), toDate: getTodayDate() };
        break;
      default:
        filters = { fromDate: '', toDate: '' };
    }
    
    setTempFilters(filters);
    onDateFilter(filters);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>📅 Date Filters</h3>
        <div className="date-filters">
          <div className="quick-filters" style={{ marginBottom: '15px' }}>
            <button 
              className="btn-small" 
              onClick={() => setQuickFilter('today')}
              style={{ marginRight: '5px', marginBottom: '5px' }}
            >
              Today
            </button>
            <button 
              className="btn-small" 
              onClick={() => setQuickFilter('week')}
              style={{ marginRight: '5px', marginBottom: '5px' }}
            >
              Last 7 days
            </button>
            <button 
              className="btn-small" 
              onClick={() => setQuickFilter('month')}
              style={{ marginBottom: '5px' }}
            >
              Last 30 days
            </button>
          </div>
          
          <div className="date-filter-group">
            <label htmlFor="fromDate">From Date</label>
            <input
              type="date"
              id="fromDate"
              className="date-input"
              value={tempFilters.fromDate}
              onChange={(e) => handleDateChange('fromDate', e.target.value)}
            />
          </div>
          
          <div className="date-filter-group">
            <label htmlFor="toDate">To Date</label>
            <input
              type="date"
              id="toDate"
              className="date-input"
              value={tempFilters.toDate}
              onChange={(e) => handleDateChange('toDate', e.target.value)}
            />
          </div>
          
          <button 
            className="btn-small" 
            onClick={clearFilters}
            style={{ width: '100%', marginTop: '10px' }}
          >
            Clear All Filters
          </button>
        </div>
      </div>

      <div className="sidebar-section">
        <h3>🏷️ Categories</h3>
        <div className="category-list">
          <div 
            className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => onCategorySelect('all')}
          >
            <div className="category-color" style={{ background: '#6b7280' }}></div>
            <span>All Categories</span>
          </div>
          
          {categories.map(category => (
            <div 
              key={category.id}
              className={`category-item ${selectedCategory === category.id.toString() ? 'active' : ''}`}
              onClick={() => onCategorySelect(category.id.toString())}
            >
              <div 
                className="category-color" 
                style={{ background: category.color }}
              ></div>
              <span>{category.icon ? category.icon + ' ' : ''}{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;