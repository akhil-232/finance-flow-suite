import React, { useState, useEffect } from 'react';

const ChartsPanel = ({ transactions, categories, dateFilters }) => {
  const [chartData, setChartData] = useState({
    categorySpending: [],
    monthlyTrend: []
  });

  useEffect(() => {
    if (transactions && categories) {
      generateChartData();
    }
  }, [transactions, categories]);

  const generateChartData = () => {
    // Category spending data for pie chart
    const categorySpending = {};
    
    transactions.forEach(transaction => {
      if (transaction.debited && transaction.debited > 0) {
        const category = categories.find(c => c.id === transaction.category_id);
        const categoryName = category ? category.name : 'Unknown';
        const categoryColor = category ? category.color : '#6b7280';
        
        if (!categorySpending[categoryName]) {
          categorySpending[categoryName] = {
            name: categoryName,
            amount: 0,
            color: categoryColor
          };
        }
        categorySpending[categoryName].amount += parseFloat(transaction.debited);
      }
    });

    const categoryData = Object.values(categorySpending)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8); // Top 8 categories

    // Monthly trend data
    const monthlyData = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          credited: 0,
          debited: 0
        };
      }
      
      monthlyData[monthKey].credited += parseFloat(transaction.credited) || 0;
      monthlyData[monthKey].debited += parseFloat(transaction.debited) || 0;
    });

    const monthlyTrend = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months

    setChartData({
      categorySpending: categoryData,
      monthlyTrend
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const PieChart = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div className="empty-state">
          <p>No spending data available</p>
        </div>
      );
    }

    const total = data.reduce((sum, item) => sum + item.amount, 0);
    let cumulativePercentage = 0;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative', width: '150px', height: '150px' }}>
          <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="75"
              cy="75"
              r="65"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="10"
            />
            {data.map((item, index) => {
              const percentage = (item.amount / total) * 100;
              const strokeDasharray = `${(percentage / 100) * 408.407} 408.407`;
              const strokeDashoffset = -((cumulativePercentage / 100) * 408.407);
              cumulativePercentage += percentage;

              return (
                <circle
                  key={index}
                  cx="75"
                  cy="75"
                  r="65"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="10"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'all 0.3s ease' }}
                />
              );
            })}
          </svg>
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            <div>Total</div>
            <div style={{ fontSize: '14px', color: '#4a5568' }}>
              {formatCurrency(total)}
            </div>
          </div>
        </div>
        
        <div style={{ flex: 1 }}>
          {data.map((item, index) => {
            const percentage = ((item.amount / total) * 100).toFixed(1);
            return (
              <div 
                key={index}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '8px',
                  fontSize: '12px'
                }}
              >
                <div 
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: item.color,
                    borderRadius: '50%',
                    marginRight: '8px',
                    flexShrink: 0
                  }}
                ></div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                    {item.name}
                  </div>
                  <div style={{ color: '#718096' }}>
                    {formatCurrency(item.amount)} ({percentage}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const BarChart = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div className="empty-state">
          <p>No monthly data available</p>
        </div>
      );
    }

    const maxAmount = Math.max(...data.map(item => 
      Math.max(item.credited, item.debited)
    ));

    return (
      <div style={{ padding: '10px 0' }}>
        {data.map((item, index) => {
          const creditedHeight = maxAmount > 0 ? (item.credited / maxAmount) * 100 : 0;
          const debitedHeight = maxAmount > 0 ? (item.debited / maxAmount) * 100 : 0;
          
          return (
            <div 
              key={index}
              style={{ 
                display: 'flex', 
                alignItems: 'end', 
                marginBottom: '15px',
                gap: '8px'
              }}
            >
              <div style={{ 
                width: '60px', 
                fontSize: '11px', 
                color: '#718096',
                textAlign: 'center'
              }}>
                {new Date(item.month + '-01').toLocaleDateString('en-US', { 
                  month: 'short',
                  year: '2-digit'
                })}
              </div>
              
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                gap: '4px',
                height: '60px',
                alignItems: 'end'
              }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div 
                    style={{
                      width: '100%',
                      backgroundColor: '#38a169',
                      height: `${creditedHeight}%`,
                      minHeight: creditedHeight > 0 ? '2px' : '0',
                      borderRadius: '2px 2px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                  ></div>
                  <div style={{ fontSize: '10px', marginTop: '4px', color: '#38a169' }}>
                    {item.credited > 0 ? formatCurrency(item.credited) : ''}
                  </div>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div 
                    style={{
                      width: '100%',
                      backgroundColor: '#e53e3e',
                      height: `${debitedHeight}%`,
                      minHeight: debitedHeight > 0 ? '2px' : '0',
                      borderRadius: '2px 2px 0 0',
                      transition: 'height 0.3s ease'
                    }}
                  ></div>
                  <div style={{ fontSize: '10px', marginTop: '4px', color: '#e53e3e' }}>
                    {item.debited > 0 ? formatCurrency(item.debited) : ''}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px', 
          marginTop: '15px',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: '#38a169',
              borderRadius: '2px'
            }}></div>
            <span>Income</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: '#e53e3e',
              borderRadius: '2px'
            }}></div>
            <span>Expenses</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="charts-panel">
      <div className="chart-container">
        <h3 className="chart-title">📊 Spending by Category</h3>
        <PieChart data={chartData.categorySpending} />
      </div>
      
      <div className="chart-container">
        <h3 className="chart-title">📈 Monthly Trend</h3>
        <BarChart data={chartData.monthlyTrend} />
      </div>
      
      <div className="chart-container">
        <h3 className="chart-title">💡 Quick Stats</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          {chartData.categorySpending.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Top Spending Category:</strong>
              <br />
              {chartData.categorySpending[0].name} - {formatCurrency(chartData.categorySpending[0].amount)}
            </div>
          )}
          
          <div style={{ marginBottom: '10px' }}>
            <strong>Total Transactions:</strong> {transactions.length}
          </div>
          
          {transactions.length > 0 && (
            <div>
              <strong>Average Transaction:</strong>{' '}
              {formatCurrency(
                transactions.reduce((sum, t) => 
                  sum + (parseFloat(t.credited) || 0) + (parseFloat(t.debited) || 0), 0
                ) / transactions.length
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartsPanel;