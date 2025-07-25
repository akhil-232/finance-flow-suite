# Sample Data for Supabase Finance Tracker

This folder contains CSV files with sample data for all tables in your finance tracker database.

## Files Included:

1. **categories.csv** - Sample expense categories (Food, Transportation, etc.)
2. **profiles.csv** - User profile data  
3. **transactions.csv** - Sample financial transactions
4. **budget_goals.csv** - Budget goals and spending limits
5. **recurring_transactions.csv** - Recurring income/expenses
6. **tags.csv** - Transaction tags for categorization
7. **transaction_tags.csv** - Links between transactions and tags
8. **exchange_rates.csv** - Currency exchange rates

## How to Import:

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/lzxzbytlvdoabrdvomoq
2. Navigate to Table Editor
3. Select each table and click "Insert" → "Import data from CSV"
4. Upload the corresponding CSV file

## Important Notes:

- **User IDs**: The sample data uses consistent user IDs (550e8400-e29b-41d4-a716-446655440000) for the main user
- **UUIDs**: All IDs are properly formatted UUIDs
- **Relationships**: Foreign keys are properly linked between tables
- **Dates**: All dates are in ISO format
- **Currency**: Sample data uses USD, but you can modify as needed

## Order of Import:

For best results, import in this order to respect foreign key relationships:

1. profiles.csv
2. categories.csv  
3. tags.csv
4. transactions.csv
5. budget_goals.csv
6. recurring_transactions.csv
7. transaction_tags.csv
8. exchange_rates.csv

## Customization:

- Replace the user_id values with actual user IDs from your auth.users table
- Modify amounts, descriptions, and dates to match your needs
- Add more categories, tags, or transactions as needed