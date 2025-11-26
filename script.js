
// Mock database storage
let books = [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 12.99, category: "Fiction" },
    { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", price: 14.50, category: "Fiction" },
    { id: 3, title: "1984", author: "George Orwell", price: 13.25, category: "Science Fiction" }
];
let nextId = 4;

// Load books from localStorage if available
try {
    const savedBooks = localStorage.getItem('books');
    if (savedBooks) {
        const parsedBooks = JSON.parse(savedBooks);
        if (Array.isArray(parsedBooks)) {
            books = parsedBooks;
            nextId = books.length > 0 ? Math.max(...books.map(b => b.id || 0)) + 1 : 4;
        }
    }
} catch (error) {
    console.warn('Error loading saved books:', error);
    // Use default books if localStorage is corrupted
}

// Form validation and submission
document.getElementById('addBookForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (validateForm()) {
        addBook();
    }
});

function validateForm() {
    let isValid = true;
    
    // Clear previous errors
    clearErrors();
    
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    
    // Title validation
    if (!title || title.length < 2) {
        showError('titleGroup', 'titleError', 'Title must be at least 2 characters long');
        isValid = false;
    }
    
    // Author validation
    if (!author || author.length < 2) {
        showError('authorGroup', 'authorError', 'Author name must be at least 2 characters long');
        isValid = false;
    }
    
    // Price validation
    if (isNaN(price) || price <= 0) {
        showError('priceGroup', 'priceError', 'Price must be a positive number');
        isValid = false;
    }
    
    return isValid;
}

function showError(groupId, errorId, message) {
    const group = document.getElementById(groupId);
    const error = document.getElementById(errorId);
    
    group.classList.add('error');
    error.textContent = message;
    error.style.display = 'block';
}

function clearErrors() {
    const errorGroups = document.querySelectorAll('.form-group.error');
    const errorMessages = document.querySelectorAll('.error-message');
    
    errorGroups.forEach(group => group.classList.remove('error'));
    errorMessages.forEach(msg => msg.style.display = 'none');
}

function addBook() {
    const submitBtn = document.getElementById('submitBtn');
    const spinner = document.getElementById('spinner');
    const btnText = document.getElementById('btnText');
    
    // Show loading state
    submitBtn.classList.add('loading');
    spinner.style.display = 'inline-block';
    btnText.textContent = 'Adding Book...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        try {
            const title = document.getElementById('title').value.trim();
            const author = document.getElementById('author').value.trim();
            const priceInput = document.getElementById('price').value;
            const price = parseFloat(priceInput);
            const category = document.getElementById('category').value || 'Uncategorized';
            
            // Additional validation
            if (!title || !author || isNaN(price) || price <= 0) {
                throw new Error('Invalid input data');
            }
            
            const newBook = {
                id: nextId++,
                title: title,
                author: author,
                price: price,
                category: category,
                dateAdded: new Date().toISOString()
            };
            
            books.push(newBook);
            saveBooks();
            displayBooks();
            updateStats();
            
            // Show success message
            const successMessage = document.getElementById('successMessage');
            successMessage.style.display = 'block';
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
            
            // Reset form
            document.getElementById('addBookForm').reset();
            clearErrors();
            
        } catch (error) {
            console.error('Error adding book:', error);
            alert('Error adding book. Please check your input and try again.');
        } finally {
            // Reset loading state
            submitBtn.classList.remove('loading');
            spinner.style.display = 'none';
            btnText.textContent = 'Add Book to Store';
            submitBtn.disabled = false;
        }
    }, 1000);
}

function displayBooks() {
    const booksGrid = document.getElementById('booksGrid');
    
    if (!booksGrid) {
        console.error('Books grid element not found');
        return;
    }
    
    if (!books || books.length === 0) {
        booksGrid.innerHTML = `
            <div class="empty-state">
                <div class="icon">📚</div>
                <h3>No Books Yet</h3>
                <p>Start building your collection by adding your first book!</p>
            </div>
        `;
        return;
    }
    
    try {
        booksGrid.innerHTML = books.map(book => {
            // Ensure book has all required properties
            const safeBook = {
                id: book.id || 0,
                title: book.title || 'Untitled',
                author: book.author || 'Unknown Author',
                price: typeof book.price === 'number' ? book.price : 0,
                category: book.category || 'Uncategorized'
            };
            
            return `
                <div class="book-item" data-id="${safeBook.id}">
                    <div class="book-title">${escapeHtml(safeBook.title)}</div>
                    <div class="book-author">by ${escapeHtml(safeBook.author)}</div>
                    <div class="book-category" style="color: #667eea; font-size: 0.9rem; margin-bottom: 8px;">
                        ${escapeHtml(safeBook.category)}
                    </div>
                    <div class="book-price">${safeBook.price.toFixed(2)}</div>
                    <div class="book-actions">
                        <button class="action-btn edit-btn" onclick="editBook(${safeBook.id})">Edit</button>
                        <button class="action-btn delete-btn" onclick="deleteBook(${safeBook.id})">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error displaying books:', error);
        booksGrid.innerHTML = `
            <div class="empty-state">
                <div class="icon">⚠️</div>
                <h3>Error Loading Books</h3>
                <p>There was an error displaying the books. Please refresh the page.</p>
            </div>
        `;
    }
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateStats() {
    const totalBooks = books.length;
    const totalValue = books.reduce((sum, book) => sum + book.price, 0);
    
    document.getElementById('totalBooks').textContent = totalBooks;
    document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
}

function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        books = books.filter(book => book.id !== id);
        saveBooks();
        displayBooks();
        updateStats();
    }
}

function editBook(id) {
    const book = books.find(b => b.id === id);
    if (book) {
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('price').value = book.price;
        document.getElementById('category').value = book.category;
        
        // Remove the book from array (will be re-added when form is submitted)
        books = books.filter(b => b.id !== id);
        saveBooks();
        displayBooks();
        updateStats();
        
        // Scroll to form
        document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
    }
}

function saveBooks() {
    try {
        localStorage.setItem('books', JSON.stringify(books));
    } catch (error) {
        console.error('Error saving books to localStorage:', error);
        alert('Unable to save books. Storage might be full.');
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Real-time validation
document.getElementById('title').addEventListener('input', function() {
    if (this.value.trim().length >= 2) {
        document.getElementById('titleGroup').classList.remove('error');
        document.getElementById('titleError').style.display = 'none';
    }
});

document.getElementById('author').addEventListener('input', function() {
    if (this.value.trim().length >= 2) {
        document.getElementById('authorGroup').classList.remove('error');
        document.getElementById('authorError').style.display = 'none';
    }
});

document.getElementById('price').addEventListener('input', function() {
    const price = parseFloat(this.value);
    if (!isNaN(price) && price > 0) {
        document.getElementById('priceGroup').classList.remove('error');
        document.getElementById('priceError').style.display = 'none';
    }
});

// Initialize display
displayBooks();
updateStats();