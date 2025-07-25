import React from 'react';

const Header = ({ onAddTransaction, onManageCategories, onExportData }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1>💰 Spend Tracker</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={onAddTransaction}
          >
            ➕ Add Transaction
          </button>
          <button 
            className="btn" 
            onClick={onManageCategories}
          >
            🏷️ Categories
          </button>
          <button 
            className="btn" 
            onClick={onExportData}
          >
            📄 Export CSV
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;