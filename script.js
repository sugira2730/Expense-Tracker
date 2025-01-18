document.addEventListener('DOMContentLoaded', () => {
  const transactions = [];
  const budgets = {};
  const chartData = {
    expense: {},
    income: {},
  };

  const accounts = {
    bank: { name: "Bank Account", type: "bank", balance: 0 },
    mobile: { name: "Mobile Money", type: "mobile", balance: 0 },
    cash: { name: "Cash", type: "cash", balance: 0 },
  };

  const categories = {
    expense: [
      { name: "Food", subcategories: ["Groceries", "Restaurants", "Snacks"] },
      { name: "Transportation", subcategories: ["Fuel", "Public Transport", "Maintenance"] },
      { name: "Utilities", subcategories: ["Electricity", "Water", "Internet"] },
    ],
    income: [
      { name: "Salary", subcategories: ["Base", "Wages", "Overtime"] },
      { name: "Investments", subcategories: ["Dividends", "Interest", "Capital Gains"] },
      { name: "Other", subcategories: ["Gifts", "Freelance", "Rental"] },
    ],
  };

  // DOM Elements
  const accountSelect = document.getElementById('account-select');
  const categorySelect = document.getElementById('category-select');
  const subcategorySelect = document.getElementById('subcategory-select');
  const typeSelect = document.getElementById('type-select');
  const budgetCategorySelect = document.getElementById('budget-category-select');
  const transactionsTable = document.querySelector('#transactions-table tbody');
  const totalIncomeElem = document.getElementById('total-income');
  const totalExpensesElem = document.getElementById('total-expenses');
  const netBalanceElem = document.getElementById('net-balance');
  const bankBalanceElem = document.getElementById('bank-balance');
  const mobileBalanceElem = document.getElementById('mobile-balance');
  const cashBalanceElem = document.getElementById('cash-balance');
  const expenseChartCtx = document.getElementById('expense-chart').getContext('2d');
  const balanceChartCtx = document.getElementById('balance-chart').getContext('2d');
  const budgetProgressDiv = document.getElementById('budget-progress');

   // Initialize charts
   const expenseChart = new Chart(expenseChartCtx, {
    type: 'pie',
    data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
  });

  const balanceChart = new Chart(balanceChartCtx, {
    type: 'bar',
    data: { labels: ['Income', 'Expenses'], datasets: [{ data: [0, 0], backgroundColor: ['#2ecc71', '#e74c3c'] }] },
  });

  // Initialize the account and category dropdowns
  function populateAccountsAndCategories() {
    Object.values(accounts).forEach(account => {
      const option = new Option(account.name, account.type);
      accountSelect.add(option);
    });

    Object.entries(categories).forEach(([type, categoryList]) => {
      categoryList.forEach(category => {
        const option = new Option(category.name, category.name);
        categorySelect.add(option);
        if (type === 'expense') budgetCategorySelect.add(option.cloneNode(true));
      });
    });
  }

  function updateSubcategories() {
    subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
    const selectedCategory = categorySelect.value;
    const type = typeSelect.value;

    if (type && selectedCategory) {
      const category = categories[type]?.find(cat => cat.name === selectedCategory);
      if (category) {
        category.subcategories.forEach(subcat => {
          subcategorySelect.add(new Option(subcat, subcat));
        });
      }
    }
  }

  // Update balances in the summary section
  function updateBalances() {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    bankBalanceElem.textContent = `$${accounts.bank.balance.toFixed(2)}`;
    mobileBalanceElem.textContent = `$${accounts.mobile.balance.toFixed(2)}`;
    cashBalanceElem.textContent = `$${accounts.cash.balance.toFixed(2)}`;
    totalIncomeElem.textContent = `$${income.toFixed(2)}`;
    totalExpensesElem.textContent = `$${expenses.toFixed(2)}`;
    netBalanceElem.textContent = `$${(income - expenses).toFixed(2)}`;
  }

  // Update balances in the Account Summary section
  function updateAccountBalances() {
    // Reset account balances
    Object.keys(accounts).forEach(account => {
      accounts[account].balance = 0;
    });

    // Recalculate balances based on transactions
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        accounts[transaction.account].balance += transaction.amount;
      } else if (transaction.type === 'expense') {
        accounts[transaction.account].balance -= transaction.amount;
      }
    });

    // Update DOM elements
    bankBalanceElem.textContent = `$${accounts.bank.balance.toFixed(2)}`;
    mobileBalanceElem.textContent = `$${accounts.mobile.balance.toFixed(2)}`;
    cashBalanceElem.textContent = `$${accounts.cash.balance.toFixed(2)}`;
  }

  // Update charts for data visualization
  function updateCharts() {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    // Update balance chart
    balanceChart.data.datasets[0].data = [income, expenses];
    balanceChart.update();

    // Update expense chart
    const expenseCategories = Object.entries(chartData.expense);
    expenseChart.data.labels = expenseCategories.map(([key]) => key);
    expenseChart.data.datasets[0].data = expenseCategories.map(([, value]) => value);
    expenseChart.update();
  }

  // Update overall summary
  function updateSummary() {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    totalIncomeElem.textContent = `$${income.toFixed(2)}`;
    totalExpensesElem.textContent = `$${expenses.toFixed(2)}`;
    netBalanceElem.textContent = `$${(income - expenses).toFixed(2)}`;

    updateAccountBalances();
    updateCharts();
  }

  // Update budget status
  function updateBudgetStatus() {
    budgetProgressDiv.innerHTML = '';

    Object.keys(budgets).forEach(category => {
      const spent = chartData.expense[category] || 0;
      const budget = budgets[category];
      const progress = Math.min((spent / budget) * 100, 100).toFixed(2);

      const statusDiv = document.createElement('div');
      statusDiv.innerHTML = `
        <div><strong>${category}</strong>: $${spent.toFixed(2)} / $${budget.toFixed(2)}</div>
        <div class="progress-bar">
          <div class="progress-fill ${spent > budget ? 'danger' : spent > 0.75 * budget ? 'warning' : 'success'}" style="width: ${progress}%"></div>
        </div>
      `;
      budgetProgressDiv.appendChild(statusDiv);
    });
  }

  // Add a transaction
  function addTransaction(transaction) {
    transactions.push(transaction);

    if (transaction.type === 'expense') {
      chartData.expense[transaction.category] = (chartData.expense[transaction.category] || 0) + Math.abs(transaction.amount);
      if (budgets[transaction.category] && chartData.expense[transaction.category] > budgets[transaction.category]) {
        alert(`Budget exceeded for ${transaction.category}. Current spending: $${chartData.expense[transaction.category].toFixed(2)}.`);
      }
    }

    updateBalances();
    updateBudgetStatus();
    addTransactionToTable(transaction);
    updateSummary();
  }

  // Add a transaction to the table
  function addTransactionToTable(transaction) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${transaction.date}</td>
      <td>${accounts[transaction.account]?.name || '-'}</td>
      <td>${transaction.type}</td>
      <td>${transaction.category}</td>
      <td>${transaction.subcategory || '-'}</td>
      <td>${transaction.description || '-'}</td>
      <td>$${transaction.amount.toFixed(2)}</td>
      <td><button class="btn btn-danger delete-btn">Delete</button></td>
    `;
    row.querySelector('.delete-btn').addEventListener('click', () => {
      transactions.splice(transactions.indexOf(transaction), 1);
      row.remove();
      updateSummary();
      updateBalances();
      updateBudgetStatus();
    });
    transactionsTable.appendChild(row);
  }

  // Handle form submissions
  document.getElementById('transaction-form').addEventListener('submit', e => {
    e.preventDefault();
    const transaction = {
      account: accountSelect.value,
      type: typeSelect.value,
      category: categorySelect.value,
      subcategory: subcategorySelect.value,
      amount: parseFloat(document.getElementById('amount-input').value),
      date: document.getElementById('date-input').value,
      description: document.getElementById('description-input').value,
    };
    addTransaction(transaction);
    e.target.reset();
  });

  document.getElementById('budget-form').addEventListener('submit', e => {
    e.preventDefault();
    const category = budgetCategorySelect.value;
    const amount = parseFloat(document.getElementById('budget-amount-input').value);
    budgets[category] = amount;
    alert(`Budget set for ${category}: $${amount.toFixed(2)}`);
    updateBudgetStatus();
  });

  // Event listeners for category and type changes
  categorySelect.addEventListener('change', updateSubcategories);
  typeSelect.addEventListener('change', updateSubcategories);

  // Initialize
  populateAccountsAndCategories();
  updateSummary();
  updateBalances();
  updateBudgetStatus();
});
