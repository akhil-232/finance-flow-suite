import React from 'react';

const TransactionSummary = ({ transactions, loading }) => {
  const calculateSummary = () => {
    if (!transactions || transactions.length === 0) {
      return {
        totalCredited: 0,
        totalDebited: 0,
        netBalance: 0,
        transactionCount: 0
      };
    }

    const summary = transactions.reduce((acc, transaction) => {
      acc.totalCredited += parseFloat(transaction.credited) || 0;
      acc.totalDebited += parseFloat(transaction.debited) || 0;
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getBalanceClass = (amount) => {
    if (amount > 0) return 'positive';
    if (amount < 0) return 'negative';
    return 'neutral';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Transaction Summary</h2>
        </div>
        <div className="card-content">
          <div className="loading">
            <div className="spinner"></div>
            Loading summary...
          </div>
        </div>
      </div>
    );
  }

  const summary = calculateSummary();

  return (
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
            <div className={`summary-value ${getBalanceClass(summary.netBalance)}`}>
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
        
        {summary.transactionCount === 0 && (
          <div className="empty-state">
            <h3>No transactions found</h3>
            <p>Add your first transaction to see the summary here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionSummary;