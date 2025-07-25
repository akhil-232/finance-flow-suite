import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, WalletIcon } from 'lucide-react';
import { Transaction } from '@/hooks/useTransactions';

interface StatCardsProps {
  transactions: Transaction[];
}

export const StatCards: React.FC<StatCardsProps> = ({ transactions }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.transaction_date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.transaction_type === 'credit')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.transaction_type === 'debit')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const netBalance = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="gradient-success text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/90">
            Total Income
          </CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-white/90" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-white/80">
            This month
          </p>
        </CardContent>
      </Card>

      <Card className="gradient-danger text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/90">
            Total Expenses
          </CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-white/90" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-xs text-white/80">
            This month
          </p>
        </CardContent>
      </Card>

      <Card className={`${netBalance >= 0 ? 'gradient-primary' : 'gradient-danger'} text-white`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/90">
            Net Balance
          </CardTitle>
          <WalletIcon className="h-4 w-4 text-white/90" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(netBalance)}
          </div>
          <p className="text-xs text-white/80">
            This month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};