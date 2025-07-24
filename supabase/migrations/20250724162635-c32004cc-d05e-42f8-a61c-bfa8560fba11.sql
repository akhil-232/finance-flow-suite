-- Create enum types
CREATE TYPE public.transaction_type AS ENUM ('credit', 'debit');
CREATE TYPE public.recurrence_type AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE public.currency_code AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD');

-- Categories table
CREATE TABLE public.categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT DEFAULT 'circle',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_category_per_user UNIQUE (user_id, name)
);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    transaction_type public.transaction_type NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    currency public.currency_code DEFAULT 'USD',
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Budget goals table
CREATE TABLE public.budget_goals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL,
    spent_amount DECIMAL(12,2) DEFAULT 0,
    currency public.currency_code DEFAULT 'USD',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recurring transactions table
CREATE TABLE public.recurring_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    transaction_type public.transaction_type NOT NULL,
    recurrence_type public.recurrence_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    next_occurrence DATE NOT NULL,
    currency public.currency_code DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tags table
CREATE TABLE public.tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6B7280',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_tag_per_user UNIQUE (user_id, name)
);

-- Transaction tags junction table
CREATE TABLE public.transaction_tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_transaction_tag UNIQUE (transaction_id, tag_id)
);

-- Exchange rates table
CREATE TABLE public.exchange_rates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    from_currency public.currency_code NOT NULL,
    to_currency public.currency_code NOT NULL,
    rate DECIMAL(10,6) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT unique_rate_per_day UNIQUE (from_currency, to_currency, date)
);

-- Audit log table
CREATE TABLE public.audit_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    default_currency public.currency_code DEFAULT 'USD',
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Users can manage their own categories" ON public.categories
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "Users can manage their own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for budget goals
CREATE POLICY "Users can manage their own budget goals" ON public.budget_goals
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for recurring transactions
CREATE POLICY "Users can manage their own recurring transactions" ON public.recurring_transactions
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for tags
CREATE POLICY "Users can manage their own tags" ON public.tags
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for transaction tags (through transaction ownership)
CREATE POLICY "Users can manage transaction tags for their own transactions" ON public.transaction_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.transactions 
            WHERE transactions.id = transaction_tags.transaction_id 
            AND transactions.user_id = auth.uid()
        )
    );

-- RLS Policies for exchange rates (public read, admin write)
CREATE POLICY "Anyone can read exchange rates" ON public.exchange_rates
    FOR SELECT USING (true);

-- RLS Policies for audit log
CREATE POLICY "Users can read their own audit log" ON public.audit_log
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view and update their own profile" ON public.profiles
    FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_category ON public.transactions(user_id, category_id);
CREATE INDEX idx_categories_user ON public.categories(user_id);
CREATE INDEX idx_budget_goals_user ON public.budget_goals(user_id);
CREATE INDEX idx_recurring_transactions_user ON public.recurring_transactions(user_id);
CREATE INDEX idx_tags_user ON public.tags(user_id);
CREATE INDEX idx_audit_log_user ON public.audit_log(user_id, created_at DESC);

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_goals_updated_at BEFORE UPDATE ON public.budget_goals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON public.recurring_transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create default categories for new users
CREATE OR REPLACE FUNCTION public.create_default_categories_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.categories (user_id, name, color, icon) VALUES
        (NEW.id, 'Food & Dining', '#EF4444', 'utensils'),
        (NEW.id, 'Transportation', '#3B82F6', 'car'),
        (NEW.id, 'Shopping', '#8B5CF6', 'shopping-bag'),
        (NEW.id, 'Entertainment', '#F59E0B', 'film'),
        (NEW.id, 'Bills & Utilities', '#10B981', 'receipt'),
        (NEW.id, 'Healthcare', '#EC4899', 'heart'),
        (NEW.id, 'Income', '#059669', 'trending-up'),
        (NEW.id, 'Other', '#6B7280', 'more-horizontal');
    
    INSERT INTO public.profiles (user_id, display_name) VALUES
        (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default categories when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_default_categories_for_user();

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_log (user_id, table_name, record_id, action, old_values)
        VALUES (OLD.user_id, TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_log (user_id, table_name, record_id, action, old_values, new_values)
        VALUES (NEW.user_id, TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_log (user_id, table_name, record_id, action, new_values)
        VALUES (NEW.user_id, TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW));
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for key tables
CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER audit_categories AFTER INSERT OR UPDATE OR DELETE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER audit_budget_goals AFTER INSERT OR UPDATE OR DELETE ON public.budget_goals
    FOR EACH ROW EXECUTE FUNCTION public.create_audit_log();