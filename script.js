let totalExpenses = 0; // Track total expenses
    let income = 0; // Track income
document.addEventListener('DOMContentLoaded', function() {
    const incomeAmountInput = document.getElementById('amount-input'); // Income input field
    const categorySelect = document.getElementById('category-select'); // Category select field
    const expenseAmountInput = document.getElementById('amount-input'); // Expense amount input field
    const expenseDateInput = document.getElementById('date-input'); // Date input field
    const addButton = document.getElementById('add-btn'); // Add expense button
    const expenseTableBody = document.getElementById('expnese-table-body'); // Table body for expenses
    const totalAmountDisplay = document.getElementById('total-amount'); // Total amount display
    // Update the income when the user changes the income input value
    incomeAmountInput.addEventListener('input', function() {
        income = Number(incomeAmountInput.value) || 0; // Parse income amount or set to 0 if invalid
        updateBalance();
    });

    // Add expense entry when the "Add" button is clicked
    addButton.addEventListener('click', function() {
        const expenseAmount = Number(expenseAmountInput.value);
        const expenseCategory = categorySelect.value;
        const expenseDate = expenseDateInput.value;

        if (isNaN(expenseAmount) || expenseAmount <= 0 || !expenseDate) {
            alert('Please enter valid expense details.');
            return;
        }
        if(date===''){
            alert('please select a date');
            return ;
        }

        // Add the expense to the table
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>expenseCategory</td>
            <td>expenseAmount.toFixed(2)</td>
            <td>expenseDate</td>
            <td><button class="delete-btn">Delete</button></td>
        `;
        expenseTableBody.appendChild(newRow);

        // Add expense to the total expenses
        totalExpenses += expenseAmount;

        // Add event listener for the delete button to remove the expense
        const deleteButton = newRow.querySelector('.delete-btn');
        deleteButton.addEventListener('click', function() {
            expenseTableBody.removeChild(newRow);
            totalExpenses -= expenseAmount;
            updateBalance();
        });

        // Reset expense inputs
        expenseAmountInput.value = '';
        expenseDateInput.value = '';

        // Update the balance
        updateBalance();
    });

    // Function to update the displayed total and remaining balance
    function updateBalance() {
        const remainingBalance = income - totalExpenses;
        totalAmountDisplay.textContent = remainingBalance.toFixed(2);
    }
});
