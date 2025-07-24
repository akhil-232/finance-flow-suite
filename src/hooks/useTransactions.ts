import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  transaction_date: string;
  category_id: string | null;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR' | 'CAD' | 'AUD';
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('transaction_date', { ascending: false });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch transactions',
          variant: 'destructive',
        });
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchCategories = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch categories',
          variant: 'destructive',
        });
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addTransaction = async (transactionData: {
    description: string;
    amount: number;
    transaction_type: 'credit' | 'debit';
    transaction_date: string;
    category_id?: string;
    notes?: string;
  }) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([
          {
            ...transactionData,
            user_id: user.id,
            currency: 'USD',
          }
        ])
        .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
        .single();

      if (error) {
        return { error: error.message };
      }

      setTransactions(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Transaction added successfully',
      });
      return { data };
    } catch (error) {
      return { error: 'Failed to add transaction' };
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `)
        .single();

      if (error) {
        return { error: error.message };
      }

      setTransactions(prev => 
        prev.map(t => t.id === id ? data : t)
      );
      toast({
        title: 'Success',
        description: 'Transaction updated successfully',
      });
      return { data };
    } catch (error) {
      return { error: 'Failed to update transaction' };
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('transactions')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return { error: error.message };
      }

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });
      return { success: true };
    } catch (error) {
      return { error: 'Failed to delete transaction' };
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchTransactions(), fetchCategories()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  return {
    transactions,
    categories,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: () => {
      fetchTransactions();
      fetchCategories();
    }
  };
};