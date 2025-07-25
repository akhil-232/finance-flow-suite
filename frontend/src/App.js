import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import TransactionSummary from './components/TransactionSummary';
import ChartsPanel from './components/ChartsPanel';
import CategoryManager from './components/CategoryManager';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilters, setDateFilters] = useState({
    fromDate: '',
    toDate: ''
  });
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  // Filter transactions when filters change
  useEffect(() => {
    filterTransactions();
  }, [transactions, selectedCategory, dateFilters]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showMessage('Error fetching categories', 'error');
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (selectedCategory !== 'all') {
        queryParams.append('category_id', selectedCategory);
      }
      if (dateFilters.fromDate) {
        queryParams.append('from_date', dateFilters.fromDate);
      }
      if (dateFilters.toDate) {
        queryParams.append('to_date', dateFilters.toDate);
      }

      const response = await fetch(`${API_BASE_URL}/transactions?${queryParams}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      showMessage('Error fetching transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
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
  };

  const addTransaction = async (transactionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('Transaction added successfully!', 'success');
        fetchTransactions();
        setShowTransactionForm(false);
      } else {
        showMessage(result.message || 'Error adding transaction', 'error');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      showMessage('Error adding transaction', 'error');
    }
  };

  const updateTransaction = async (transactionId, transactionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('Transaction updated successfully!', 'success');
        fetchTransactions();
        setEditingTransaction(null);
      } else {
        showMessage(result.message || 'Error updating transaction', 'error');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      showMessage('Error updating transaction', 'error');
    }
  };

  const deleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('Transaction deleted successfully!', 'success');
        fetchTransactions();
      } else {
        showMessage(result.message || 'Error deleting transaction', 'error');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showMessage('Error deleting transaction', 'error');
    }
  };

  const addCategory = async (categoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('Category added successfully!', 'success');
        fetchCategories();
      } else {
        showMessage(result.message || 'Error adding category', 'error');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      showMessage('Error adding category', 'error');
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('Category deleted successfully!', 'success');
        fetchCategories();
      } else {
        showMessage(result.message || 'Error deleting category', 'error');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showMessage('Error deleting category', 'error');
    }
  };

  const exportData = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (selectedCategory !== 'all') {
        queryParams.append('category_id', selectedCategory);
      }
      if (dateFilters.fromDate) {
        queryParams.append('from_date', dateFilters.fromDate);
      }
      if (dateFilters.toDate) {
        queryParams.append('to_date', dateFilters.toDate);
      }

      const response = await fetch(`${API_BASE_URL}/export/csv?${queryParams}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showMessage('Data exported successfully!', 'success');
      } else {
        showMessage('Error exporting data', 'error');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      showMessage('Error exporting data', 'error');
    }
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(''), 5000);
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleDateFilter = (filters) => {
    setDateFilters(filters);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  return (
    <div className="app">
      <Header 
        onAddTransaction={() => setShowTransactionForm(true)}
        onManageCategories={() => setShowCategoryManager(true)}
        onExportData={exportData}
      />
      
      <div className="app-content">
        <Sidebar 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategoryFilter}
          onDateFilter={handleDateFilter}
          dateFilters={dateFilters}
        />
        
        <main className="main-content">
          <div className="content-left">
            <TransactionSummary 
              transactions={filteredTransactions}
              loading={loading}
            />
            
            <TransactionList 
              transactions={filteredTransactions}
              categories={categories}
              loading={loading}
              onEdit={handleEditTransaction}
              onDelete={deleteTransaction}
            />
          </div>
          
          <div className="content-right">
            <ChartsPanel 
              transactions={filteredTransactions}
              categories={categories}
              dateFilters={dateFilters}
            />
          </div>
        </main>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {showTransactionForm && (
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
      )}

      {showCategoryManager && (
        <CategoryManager 
          categories={categories}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
          onClose={() => setShowCategoryManager(false)}
        />
      )}
    </div>
  );
}

export default App;