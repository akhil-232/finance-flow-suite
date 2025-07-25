import React, { useState, useEffect } from 'react';
import './App.css';

// Mock data for demo
const MOCK_CATEGORIES = [
  { id: 1, name: 'Food & Dining', color: '#ef4444', icon: '🍽️' },
  { id: 2, name: 'Transportation', color: '#3b82f6', icon: '🚗' },
  { id: 3, name: 'Shopping', color: '#8b5cf6', icon: '🛍️' },
  { id: 4, name: 'Entertainment', color: '#f59e0b', icon: '🎬' },
  { id: 5, name: 'Bills & Utilities', color: '#10b981', icon: '⚡' },
  { id: 6, name: 'Healthcare', color: '#ec4899', icon: '🏥' },
  { id: 7, name: 'Income', color: '#22c55e', icon: '💰' },
  { id: 8, name: 'Savings', color: '#059669', icon: '🏦' },
];

const MOCK_TRANSACTIONS = [
  { id: 1, transaction_date: '2024-01-15', category_id: 7, description: 'Salary January 2024', credited: 5000, debited: 0, running_balance: 5000, tags: 'work, monthly', notes: 'Monthly salary payment' },
  { id: 2, transaction_date: '2024-01-14', category_id: 1, description: 'Grocery Shopping', credited: 0, debited: 150.75, running_balance: 4849.25, tags: 'food, weekly', notes: '' },
  { id: 3, transaction_date: '2024-01-13', category_id: 2, description: 'Gas Station', credited: 0, debited: 45.50, running_balance: 4803.75, tags: 'fuel', notes: 'Weekly gas fill-up' },
  { id: 4, transaction_date: '2024-01-12', category_id: 4, description: 'Netflix Subscription', credited: 0, debited: 15.99, running_balance: 4787.76, tags: 'entertainment, monthly', notes: 'Streaming service' },
  { id: 5, transaction_date: '2024-01-11', category_id: 5, description: 'Electricity Bill', credited: 0, debited: 125.40, running_balance: 4662.36, tags: 'utilities, monthly', notes: 'January electricity' },
  { id: 6, transaction_date: '2024-01-10', category_id: 1, description: 'Restaurant Dinner', credited: 0, debited: 67.80, running_balance: 4594.56, tags: 'dining, weekend', notes: 'Date night dinner' },
  { id: 7, transaction_date: '2024-01-09', category_id: 3, description: 'Amazon Purchase', credited: 0, debited: 89.99, running_balance: 4504.57, tags: 'online, electronics', notes: 'New headphones' },
  { id: 8, transaction_date: '2024-01-08', category_id: 8, description: 'Emergency Fund', credited: 0, debited: 500.00, running_balance: 4004.57, tags: 'savings, emergency', notes: 'Monthly savings contribution' },
];

interface Transaction {
  id: number;
  transaction_date: string;
  category_id: number;
  description: string;
  credited: number;
  debited: number;
  running_balance: number;
  tags: string;
  notes: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilters, setDateFilters] = useState({ fromDate: '', toDate: '' });
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [message, setMessage] = useState<{text: string, type: string} | null>(null);

  // Filter transactions when filters change
  useEffect(() => {
    let filtered = [...transactions];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category_id.toString() === selectedCategory);
    }

    if (dateFilters.fromDate) {
      filtered = filtered.filter(t => t.transaction_date >= dateFilters.fromDate);
    }

    if (dateFilters.toDate) {
      filtered = filtered.filter(t => t.transaction_date <= dateFilters.toDate);
    }

    setFilteredTransactions(filtered);
  }, [transactions, selectedCategory, dateFilters]);

  const showMessage = (text: string, type: string = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryInfo = (categoryId: number) => {
    return categories.find(c => c.id === categoryId) || { name: 'Unknown', color: '#6b7280', icon: '' };
  };

  const calculateSummary = () => {
    const summary = filteredTransactions.reduce((acc, transaction) => {
      acc.totalCredited += transaction.credited || 0;
      acc.totalDebited += transaction.debited || 0;
      acc.transactionCount += 1;
      return acc;
    }, {
      totalCredited: 0,
      totalDebited: 0,
      transactionCount: 0
    });

    summary.netBalance = summary.totalCredited - summary.totalDebited;
    return summary;
  };

  const addTransaction = (transactionData: any) => {
    const newTransaction: Transaction = {
      id: Math.max(...transactions.map(t => t.id)) + 1,
      transaction_date: transactionData.transaction_date,
      category_id: parseInt(transactionData.category_id),
      description: transactionData.description,
      credited: parseFloat(transactionData.credited) || 0,
      debited: parseFloat(transactionData.debited) || 0,
      running_balance: 0, // Will be calculated
      tags: transactionData.tags || '',
      notes: transactionData.notes || ''
    };

    // Calculate new running balance
    const currentBalance = transactions.length > 0 ? transactions[0].running_balance : 0;
    newTransaction.running_balance = currentBalance + newTransaction.credited - newTransaction.debited;

    setTransactions([newTransaction, ...transactions]);
    setShowTransactionForm(false);
    showMessage('Transaction added successfully!', 'success');
  };

  const updateTransaction = (transactionId: number, transactionData: any) => {
    setTransactions(transactions.map(t => 
      t.id === transactionId 
        ? { ...t, ...transactionData, category_id: parseInt(transactionData.category_id) }
        : t
    ));
    setEditingTransaction(null);
    setShowTransactionForm(false);
    showMessage('Transaction updated successfully!', 'success');
  };

  const deleteTransaction = (transactionId: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(transactions.filter(t => t.id !== transactionId));
      showMessage('Transaction deleted successfully!', 'success');
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Category', 'Description', 'Income', 'Expense', 'Balance', 'Tags', 'Notes'],
      ...filteredTransactions.map(t => {
        const category = getCategoryInfo(t.category_id);
        return [
          t.transaction_date,
          category.name,
          t.description,
          t.credited || 0,
          t.debited || 0,
          t.running_balance,
          t.tags,
          t.notes
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showMessage('Data exported successfully!', 'success');
  };

  const summary = calculateSummary();

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>💰 Spend Tracker</h1>
          <div className="header-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => setShowTransactionForm(true)}
            >
              ➕ Add Transaction
            </button>
            <button 
              className="btn" 
              onClick={() => setShowCategoryManager(true)}
            >
              🏷️ Categories
            </button>
            <button 
              className="btn" 
              onClick={exportData}
            >
              📄 Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="app-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <h3>📅 Date Filters</h3>
            <div className="date-filters">
              <div className="quick-filters" style={{ marginBottom: '15px' }}>
                <button 
                  className="btn-small" 
                  onClick={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setDateFilters({ fromDate: today, toDate: today });
                  }}
                  style={{ marginRight: '5px', marginBottom: '5px' }}
                >
                  Today
                </button>
                <button 
                  className="btn-small" 
                  onClick={() => {
                    const today = new Date();
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    setDateFilters({ 
                      fromDate: weekAgo.toISOString().split('T')[0], 
                      toDate: today.toISOString().split('T')[0] 
                    });
                  }}
                  style={{ marginRight: '5px', marginBottom: '5px' }}
                >
                  Last 7 days
                </button>
              </div>
              
              <div className="date-filter-group">
                <label htmlFor="fromDate">From Date</label>
                <input
                  type="date"
                  id="fromDate"
                  className="date-input"
                  value={dateFilters.fromDate}
                  onChange={(e) => setDateFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                />
              </div>
              
              <div className="date-filter-group">
                <label htmlFor="toDate">To Date</label>
                <input
                  type="date"
                  id="toDate"
                  className="date-input"
                  value={dateFilters.toDate}
                  onChange={(e) => setDateFilters(prev => ({ ...prev, toDate: e.target.value }))}
                />
              </div>
              
              <button 
                className="btn-small" 
                onClick={() => {
                  setDateFilters({ fromDate: '', toDate: '' });
                  setSelectedCategory('all');
                }}
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
                onClick={() => setSelectedCategory('all')}
              >
                <div className="category-color" style={{ background: '#6b7280' }}></div>
                <span>All Categories</span>
              </div>
              
              {categories.map(category => (
                <div 
                  key={category.id}
                  className={`category-item ${selectedCategory === category.id.toString() ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id.toString())}
                >
                  <div 
                    className="category-color" 
                    style={{ background: category.color }}
                  ></div>
                  <span>{category.icon} {category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-left">
            {/* Transaction Summary */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">📊 Transaction Summary</h2>
              </div>
              <div className="card-content">
                <div className="summary-grid">
                  <div className="summary-item">
                    <div className="summary-label">Total Income</div>
                    <div className="summary-value positive">
                      {formatCurrency(summary.totalCredited)}
                    </div>
                  </div>
                  
                  <div className="summary-item">
                    <div className="summary-label">Total Expenses</div>
                    <div className="summary-value negative">
                      {formatCurrency(summary.totalDebited)}
                    </div>
                  </div>
                  
                  <div className="summary-item">
                    <div className="summary-label">Net Balance</div>
                    <div className={`summary-value ${summary.netBalance >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(summary.netBalance)}
                    </div>
                  </div>
                  
                  <div className="summary-item">
                    <div className="summary-label">Total Transactions</div>
                    <div className="summary-value neutral">
                      {summary.transactionCount}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction List */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">📋 Recent Transactions</h2>
                <span style={{ fontSize: '14px', color: '#718096' }}>
                  {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="card-content" style={{ padding: 0 }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="transaction-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Income</th>
                        <th>Expense</th>
                        <th>Balance</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => {
                        const category = getCategoryInfo(transaction.category_id);
                        return (
                          <tr key={transaction.id} className="transaction-row">
                            <td>{formatDate(transaction.transaction_date)}</td>
                            <td>
                              <div className="transaction-category">
                                <div 
                                  className="category-color" 
                                  style={{ background: category.color }}
                                ></div>
                                <span>{category.icon} {category.name}</span>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div style={{ fontWeight: '500' }}>
                                  {transaction.description}
                                </div>
                                {transaction.notes && (
                                  <div style={{ 
                                    fontSize: '12px', 
                                    color: '#718096', 
                                    marginTop: '2px' 
                                  }}>
                                    {transaction.notes}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              {transaction.credited ? (
                                <span className="transaction-amount credit">
                                  +{formatCurrency(transaction.credited)}
                                </span>
                              ) : '-'}
                            </td>
                            <td>
                              {transaction.debited ? (
                                <span className="transaction-amount debit">
                                  -{formatCurrency(transaction.debited)}
                                </span>
                              ) : '-'}
                            </td>
                            <td>
                              <span className={`transaction-amount ${
                                transaction.running_balance >= 0 ? 'credit' : 'debit'
                              }`}>
                                {formatCurrency(transaction.running_balance)}
                              </span>
                            </td>
                            <td>
                              <div className="transaction-actions">
                                <button 
                                  className="btn-small btn-edit"
                                  onClick={() => {
                                    setEditingTransaction(transaction);
                                    setShowTransactionForm(true);
                                  }}
                                  title="Edit transaction"
                                >
                                  ✏️
                                </button>
                                <button 
                                  className="btn-small btn-delete"
                                  onClick={() => deleteTransaction(transaction.id)}
                                  title="Delete transaction"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Panel */}
          <div className="content-right">
            <div className="charts-panel">
              <div className="chart-container">
                <h3 className="chart-title">📊 Spending by Category</h3>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
                  <p style={{ color: '#718096' }}>Charts will display spending breakdown by category</p>
                </div>
              </div>
              
              <div className="chart-container">
                <h3 className="chart-title">📈 Monthly Trend</h3>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📈</div>
                  <p style={{ color: '#718096' }}>Charts will show income vs expenses over time</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Messages */}
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="modal-overlay" onClick={() => {
          setShowTransactionForm(false);
          setEditingTransaction(null);
        }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
              </h2>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowTransactionForm(false);
                  setEditingTransaction(null);
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <TransactionForm 
                categories={categories}
                transaction={editingTransaction}
                onSubmit={editingTransaction ? 
                  (data) => updateTransaction(editingTransaction.id, data) :
                  addTransaction
                }
                onClose={() => {
                  setShowTransactionForm(false);
                  setEditingTransaction(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="modal-overlay" onClick={() => setShowCategoryManager(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">🏷️ Manage Categories</h2>
              <button className="close-btn" onClick={() => setShowCategoryManager(false)}>✕</button>
            </div>
            
            <div className="modal-content">
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏷️</div>
                <h3>Category Management</h3>
                <p style={{ color: '#718096', marginBottom: '20px' }}>
                  This is a demo version. In the full app, you can add, edit, and delete categories.
                </p>
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
                        padding: '12px 16px',
                        borderBottom: '1px solid #e2e8f0'
                      }}
                    >
                      <div 
                        style={{
                          width: '16px',
                          height: '16px',
                          backgroundColor: category.color,
                          borderRadius: '50%',
                          marginRight: '12px'
                        }}
                      />
                      <span style={{ fontSize: '16px' }}>
                        {category.icon} {category.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Transaction Form Component
const TransactionForm: React.FC<{
  categories: Category[];
  transaction: Transaction | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
}> = ({ categories, transaction, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    transaction_date: transaction?.transaction_date || new Date().toISOString().split('T')[0],
    category_id: transaction?.category_id.toString() || '',
    description: transaction?.description || '',
    credited: transaction?.credited?.toString() || '',
    debited: transaction?.debited?.toString() || '',
    tags: transaction?.tags || '',
    notes: transaction?.notes || ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {[key: string]: string} = {};

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

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  return (
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
          onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
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
          onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
        >
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
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
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
        {errors.description && (
          <span className="error-text">{errors.description}</span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div className="form-group">
          <label htmlFor="credited" className="form-label">
            Income Amount
          </label>
          <input
            type="number"
            id="credited"
            className="form-input"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={formData.credited}
            onChange={(e) => setFormData(prev => ({ ...prev, credited: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="debited" className="form-label">
            Expense Amount
          </label>
          <input
            type="number"
            id="debited"
            className="form-input"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={formData.debited}
            onChange={(e) => setFormData(prev => ({ ...prev, debited: e.target.value }))}
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
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
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
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
  );
};

export default App;
