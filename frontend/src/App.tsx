import React, { useState, useEffect } from 'react';
import './App.css';

// Types and Interfaces
interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  is_income?: boolean;
}

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
  category_name?: string;
  category_color?: string;
  category_icon?: string;
}

interface TransactionSummary {
  total_credited: number;
  total_debited: number;
  net_balance: number;
  transaction_count: number;
}

interface DateFilters {
  fromDate: string;
  toDate: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

// Main App Component
function App() {
  // State Management
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    total_credited: 0,
    total_debited: 0,
    net_balance: 0,
    transaction_count: 0
  });
  
  // UI State
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [dateFilters, setDateFilters] = useState<DateFilters>({
    fromDate: '',
    toDate: ''
  });
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // API Functions
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('category_id', selectedCategory.toString());
      }
      if (dateFilters.fromDate) {
        params.append('from_date', dateFilters.fromDate);
      }
      if (dateFilters.toDate) {
        params.append('to_date', dateFilters.toDate);
      }

      const response = await fetch(`${API_BASE_URL}/transactions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showMessage('error', 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('category_id', selectedCategory.toString());
      }
      if (dateFilters.fromDate) {
        params.append('from_date', dateFilters.fromDate);
      }
      if (dateFilters.toDate) {
        params.append('to_date', dateFilters.toDate);
      }

      const response = await fetch(`${API_BASE_URL}/summary?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const addTransaction = async (transactionData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        await fetchTransactions();
        await fetchSummary();
        setShowTransactionForm(false);
        showMessage('success', 'Transaction added successfully!');
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Failed to add transaction');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      showMessage('error', 'Failed to add transaction');
    }
  };

  const updateTransaction = async (id: number, transactionData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        await fetchTransactions();
        await fetchSummary();
        setEditingTransaction(null);
        setShowTransactionForm(false);
        showMessage('success', 'Transaction updated successfully!');
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      showMessage('error', 'Failed to update transaction');
    }
  };

  const deleteTransaction = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTransactions();
        await fetchSummary();
        showMessage('success', 'Transaction deleted successfully!');
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showMessage('error', 'Failed to delete transaction');
    }
  };

  const addCategory = async (categoryData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        await fetchCategories();
        showMessage('success', 'Category added successfully!');
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      showMessage('error', 'Failed to add category');
    }
  };

  const deleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCategories();
        showMessage('success', 'Category deleted successfully!');
      } else {
        const error = await response.json();
        showMessage('error', error.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showMessage('error', 'Failed to delete category');
    }
  };

  const exportTransactions = async () => {
    try {
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('category_id', selectedCategory.toString());
      }
      if (dateFilters.fromDate) {
        params.append('from_date', dateFilters.fromDate);
      }
      if (dateFilters.toDate) {
        params.append('to_date', dateFilters.toDate);
      }

      const response = await fetch(`${API_BASE_URL}/export/csv?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showMessage('success', 'Transactions exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting transactions:', error);
      showMessage('error', 'Failed to export transactions');
    }
  };

  // Utility Functions
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getQuickDateFilter = (days: number) => {
    const today = new Date();
    const fromDate = new Date(today);
    fromDate.setDate(fromDate.getDate() - days);
    
    setDateFilters({
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: today.toISOString().split('T')[0]
    });
  };

  // Effects
  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, [selectedCategory, dateFilters]);

  useEffect(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

  // Event Handlers
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleCloseTransactionForm = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  const handleTransactionSubmit = (transactionData: any) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="app-title">💰 Spend Tracker</h1>
          <div className="header-actions">
            <button
              className="btn btn-primary"
              onClick={() => setShowTransactionForm(true)}
            >
              ➕ Add Transaction
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCategoryManager(true)}
            >
              🏷️ Manage Categories
            </button>
            <button
              className="btn btn-secondary"
              onClick={exportTransactions}
            >
              📤 Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="app-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="filter-section">
            <h3 className="filter-title">📅 Date Filters</h3>
            
            <div className="date-inputs">
              <div className="form-group">
                <label htmlFor="fromDate">From Date</label>
                <input
                  type="date"
                  id="fromDate"
                  value={dateFilters.fromDate}
                  onChange={(e) => setDateFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="toDate">To Date</label>
                <input
                  type="date"
                  id="toDate"
                  value={dateFilters.toDate}
                  onChange={(e) => setDateFilters(prev => ({ ...prev, toDate: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>

            <div className="quick-filters">
              <button
                className="btn btn-small"
                onClick={() => getQuickDateFilter(0)}
              >
                Today
              </button>
              <button
                className="btn btn-small"
                onClick={() => getQuickDateFilter(7)}
              >
                Last 7 Days
              </button>
              <button
                className="btn btn-small"
                onClick={() => getQuickDateFilter(30)}
              >
                Last 30 Days
              </button>
              <button
                className="btn btn-small"
                onClick={() => setDateFilters({ fromDate: '', toDate: '' })}
              >
                Clear Dates
              </button>
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">🏷️ Categories</h3>
            <div className="category-list">
              <button
                className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                <span className="category-icon">🗂️</span>
                <span className="category-name">All Categories</span>
              </button>
              
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{ '--category-color': category.color } as React.CSSProperties}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-left">
            {/* Transaction Summary */}
            <div className="card">
              <h2 className="card-title">📊 Transaction Summary</h2>
              <div className="summary-grid">
                <div className="summary-item income">
                  <div className="summary-label">Total Income</div>
                  <div className="summary-value">{formatCurrency(summary.total_credited)}</div>
                </div>
                <div className="summary-item expense">
                  <div className="summary-label">Total Expenses</div>
                  <div className="summary-value">{formatCurrency(summary.total_debited)}</div>
                </div>
                <div className="summary-item balance">
                  <div className="summary-label">Net Balance</div>
                  <div className="summary-value">{formatCurrency(summary.net_balance)}</div>
                </div>
                <div className="summary-item count">
                  <div className="summary-label">Transactions</div>
                  <div className="summary-value">{summary.transaction_count}</div>
                </div>
              </div>
            </div>

            {/* Transaction List */}
            <div className="card">
              <h2 className="card-title">💳 Recent Transactions</h2>
              
              {loading ? (
                <div className="loading">Loading transactions...</div>
              ) : filteredTransactions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No transactions found</h3>
                  <p>Add your first transaction to get started!</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowTransactionForm(true)}
                  >
                    Add Transaction
                  </button>
                </div>
              ) : (
                <div className="transaction-table-container">
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
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>{formatDate(transaction.transaction_date)}</td>
                          <td>
                            <div className="category-cell">
                              <span 
                                className="category-badge"
                                style={{ backgroundColor: transaction.category_color }}
                              >
                                {transaction.category_icon} {transaction.category_name}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="description-cell">
                              <div className="description-text">{transaction.description}</div>
                              {transaction.tags && (
                                <div className="tags">{transaction.tags}</div>
                              )}
                            </div>
                          </td>
                          <td className="amount-cell income">
                            {transaction.credited > 0 ? formatCurrency(transaction.credited) : '-'}
                          </td>
                          <td className="amount-cell expense">
                            {transaction.debited > 0 ? formatCurrency(transaction.debited) : '-'}
                          </td>
                          <td className="amount-cell balance">
                            {formatCurrency(transaction.running_balance)}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-small btn-edit"
                                onClick={() => handleEditTransaction(transaction)}
                                title="Edit transaction"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn btn-small btn-delete"
                                onClick={() => deleteTransaction(transaction.id)}
                                title="Delete transaction"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                  <p style={{ color: '#718096' }}>Charts will show spending trends over time</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Message Toast */}
      {message && (
        <div className={`message message-${message.type}`}>
          <span>{message.text}</span>
          <button
            className="message-close"
            onClick={() => setMessage(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionFormModal
          categories={categories}
          editingTransaction={editingTransaction}
          onSubmit={handleTransactionSubmit}
          onClose={handleCloseTransactionForm}
        />
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <CategoryManagerModal
          categories={categories}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
          onClose={() => setShowCategoryManager(false)}
        />
      )}
    </div>
  );
}

// Transaction Form Modal Component
interface TransactionFormModalProps {
  categories: Category[];
  editingTransaction: Transaction | null;
  onSubmit: (data: any) => void;
  onClose: () => void;
}

function TransactionFormModal({
  categories,
  editingTransaction,
  onSubmit,
  onClose,
}: TransactionFormModalProps) {
  const [formData, setFormData] = useState({
    transaction_date: editingTransaction?.transaction_date || new Date().toISOString().split('T')[0],
    category_id: editingTransaction?.category_id || '',
    description: editingTransaction?.description || '',
    credited: editingTransaction?.credited || '',
    debited: editingTransaction?.debited || '',
    tags: editingTransaction?.tags || '',
    notes: editingTransaction?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.transaction_date || !formData.category_id || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    const credited = parseFloat(formData.credited.toString()) || 0;
    const debited = parseFloat(formData.debited.toString()) || 0;

    if (credited <= 0 && debited <= 0) {
      alert('Please enter either an income or expense amount');
      return;
    }

    onSubmit({
      ...formData,
      credited,
      debited,
      category_id: parseInt(formData.category_id.toString()),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="transaction_date">Date *</label>
              <input
                type="date"
                id="transaction_date"
                value={formData.transaction_date}
                onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category_id">Category *</label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="form-input"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <input
              type="text"
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="form-input"
              placeholder="Enter transaction description"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="credited">Income Amount</label>
              <input
                type="number"
                id="credited"
                value={formData.credited}
                onChange={(e) => setFormData(prev => ({ ...prev, credited: e.target.value }))}
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="debited">Expense Amount</label>
              <input
                type="number"
                id="debited"
                value={formData.debited}
                onChange={(e) => setFormData(prev => ({ ...prev, debited: e.target.value }))}
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className="form-input"
              placeholder="e.g., work, personal, urgent"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="form-input"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Category Manager Modal Component
interface CategoryManagerModalProps {
  categories: Category[];
  onAddCategory: (data: any) => void;
  onDeleteCategory: (id: number) => void;
  onClose: () => void;
}

function CategoryManagerModal({
  categories,
  onAddCategory,
  onDeleteCategory,
  onClose,
}: CategoryManagerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    icon: '📝',
    is_income: false,
  });

  const predefinedIcons = ['📝', '🍽️', '🚗', '🛒', '🎮', '📋', '🏥', '📚', '✈️', '🏠', '💅', '🎁', '💰', '🏦'];
  const predefinedColors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a category name');
      return;
    }

    onAddCategory(formData);
    setFormData({
      name: '',
      color: '#3b82f6',
      icon: '📝',
      is_income: false,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Manage Categories</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="category-manager">
          <div className="category-form-section">
            <h3>Add New Category</h3>
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label htmlFor="category-name">Category Name *</label>
                <input
                  type="text"
                  id="category-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Icon</label>
                  <div className="icon-selector">
                    {predefinedIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`icon-option ${formData.icon === icon ? 'active' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-selector">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.color === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_income}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_income: e.target.checked }))}
                  />
                  <span>Income Category</span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary">
                Add Category
              </button>
            </form>
          </div>

          <div className="category-list-section">
            <h3>Existing Categories</h3>
            <div className="existing-categories">
              {categories.map((category) => (
                <div key={category.id} className="category-list-item">
                  <div className="category-info">
                    <span 
                      className="category-icon"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon}
                    </span>
                    <span className="category-name">{category.name}</span>
                    {category.is_income && (
                      <span className="income-badge">Income</span>
                    )}
                  </div>
                  <button
                    className="btn btn-small btn-delete"
                    onClick={() => onDeleteCategory(category.id)}
                    title="Delete category"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;