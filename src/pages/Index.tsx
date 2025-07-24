import React from 'react';
import { useAuth } from '@/lib/auth';
import { Navigate } from 'react-router-dom';
import { Header } from '@/components/dashboard/Header';
import { StatCards } from '@/components/dashboard/StatCards';
import { TransactionList } from '@/components/transactions/TransactionList';
import { useTransactions } from '@/hooks/useTransactions';

const Index = () => {
  const { user, loading } = useAuth();
  const { 
    transactions, 
    categories, 
    loading: transactionsLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction 
  } = useTransactions();

  if (loading || transactionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Track your expenses and manage your finances
            </p>
          </div>
        </div>

        <StatCards transactions={transactions} />

        <TransactionList
          transactions={transactions}
          categories={categories}
          onAddTransaction={addTransaction}
          onUpdateTransaction={updateTransaction}
          onDeleteTransaction={deleteTransaction}
        />
      </main>
    </div>
  );
};

export default Index;
