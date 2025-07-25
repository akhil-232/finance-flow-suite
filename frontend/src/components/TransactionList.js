import React from 'react';

const TransactionList = ({ transactions, categories, loading, onEdit, onDelete }) => {
  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryInfo = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category || { name: 'Unknown', color: '#6b7280', icon: '' };
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📋 Recent Transactions</h2>
        </div>
        <div className="card-content">
          <div className="loading">
            <div className="spinner"></div>
            Loading transactions...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">📋 Recent Transactions</h2>
        <span style={{ fontSize: '14px', color: '#718096' }}>
          {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="card-content" style={{ padding: 0 }}>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <h3>No transactions found</h3>
            <p>Add your first transaction using the "Add Transaction" button above.</p>
          </div>
        ) : (
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
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
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
                          <span>
                            {category.icon ? category.icon + ' ' : ''}{category.name}
                          </span>
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
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {transaction.debited ? (
                          <span className="transaction-amount debit">
                            -{formatCurrency(transaction.debited)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <span className={`transaction-amount ${
                          transaction.running_balance >= 0 ? 'credit' : 'debit'
                        }`}>
                          {formatCurrency(transaction.running_balance)}
                        </span>
                      </td>
                      <td>
                        {transaction.tags ? (
                          <div style={{ 
                            fontSize: '11px',
                            maxWidth: '100px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {transaction.tags.split(',').map((tag, index) => (
                              <span 
                                key={index}
                                style={{
                                  display: 'inline-block',
                                  background: '#e2e8f0',
                                  color: '#4a5568',
                                  padding: '2px 6px',
                                  borderRadius: '12px',
                                  marginRight: '4px',
                                  marginBottom: '2px'
                                }}
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <div className="transaction-actions">
                          <button 
                            className="btn-small btn-edit"
                            onClick={() => onEdit(transaction)}
                            title="Edit transaction"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-small btn-delete"
                            onClick={() => onDelete(transaction.id)}
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
        )}
      </div>
    </div>
  );
};

export default TransactionList;