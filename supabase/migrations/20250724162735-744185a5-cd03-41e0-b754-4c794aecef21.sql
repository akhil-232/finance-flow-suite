-- Fix security warnings: Add search_path to functions

-- Update the existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';