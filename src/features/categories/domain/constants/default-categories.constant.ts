import { CategoryType } from '../enums/category-type.enum';

export interface DefaultCategory {
    name: string;
    icon: string;
    color: string;
    type: CategoryType;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
    // Income categories
    { name: 'Salary', icon: '💼', color: '#00C853', type: CategoryType.INCOME },
    { name: 'Freelance', icon: '💻', color: '#00E676', type: CategoryType.INCOME },
    { name: 'Investments', icon: '📈', color: '#64DD17', type: CategoryType.INCOME },
    { name: 'Gifts', icon: '🎁', color: '#76FF03', type: CategoryType.INCOME },
    { name: 'Other Income', icon: '💰', color: '#AEEA00', type: CategoryType.INCOME },

    // Expense categories
    { name: 'Food', icon: '🍔', color: '#FF5722', type: CategoryType.EXPENSE },
    { name: 'Transport', icon: '🚗', color: '#FF6F00', type: CategoryType.EXPENSE },
    { name: 'Housing', icon: '🏠', color: '#F44336', type: CategoryType.EXPENSE },
    { name: 'Utilities', icon: '💡', color: '#E65100', type: CategoryType.EXPENSE },
    { name: 'Entertainment', icon: '🎬', color: '#D84315', type: CategoryType.EXPENSE },
    { name: 'Shopping', icon: '🛍️', color: '#BF360C', type: CategoryType.EXPENSE },
    { name: 'Healthcare', icon: '⚕️', color: '#EF5350', type: CategoryType.EXPENSE },
    { name: 'Education', icon: '📚', color: '#FF7043', type: CategoryType.EXPENSE },
    { name: 'Other Expenses', icon: '💸', color: '#FF8A65', type: CategoryType.EXPENSE },
];
