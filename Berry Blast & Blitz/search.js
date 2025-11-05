// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.searchInput');
    const searchIcon = document.querySelector('.searchIcon');

    // Define search terms and their variations
    const searchTerms = {
        'boba': ['boba'],
        'icecream': ['ice cream', 'icecream'],
        'passion': ['passion'],
        'fruit': ['fruit'],
        'juice': ['juice'],
        'chocolate': ['chocolate', 'choclate'],
        'lemonade': ['lemonade'],
        'kiwi': ['kiwi'],
        'mango': ['mango']
    };

    function containsSearchTerms(text, searchTerm) {
        text = text.toLowerCase();
        searchTerm = searchTerm.toLowerCase();
        
        // Check direct match first
        if (text.includes(searchTerm)) return true;
        
        // Check variations of search terms
        for (let [key, variations] of Object.entries(searchTerms)) {
            if (searchTerm.includes(key) || key.includes(searchTerm)) {
                return variations.some(term => text.includes(term));
            }
        }
        return false;
    }

    function performSearch() {
        const searchTerm = searchInput.value.trim();
        const productDetails = document.querySelectorAll('.productDetails');
        let foundItems = false;

        productDetails.forEach(product => {
            // Remove previous active class
            product.classList.remove('active');
            
            const titleEl = product.querySelector('.productDetailTitle');
            const descEl = product.querySelector('.productDetailDesc');
            const priceEl = product.querySelector('.productDetailPrice');
            
            if (!titleEl || !descEl) return;

            const itemName = titleEl.textContent;
            const itemDesc = descEl.textContent;
            const itemPrice = priceEl ? priceEl.textContent : '';

            if (searchTerm === '' || 
                containsSearchTerms(itemName, searchTerm) || 
                containsSearchTerms(itemDesc, searchTerm) || 
                containsSearchTerms(itemPrice, searchTerm)) {
                product.style.display = 'flex';
                foundItems = true;
                if (searchTerm !== '') {
                    product.classList.add('active');
                }
            } else {
                product.style.display = 'none';
            }
        });

        if (searchTerm && !foundItems) {
            alert('No products found matching your search.');
        }

        // If search is cleared, show all products and activate the first one
        if (searchTerm === '') {
            const firstProduct = document.querySelector('.productDetails');
            if (firstProduct) {
                firstProduct.classList.add('active');
            }
        }

        // Scroll to the product section when searching
        if (foundItems && searchTerm) {
            document.getElementById('product').scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Search on input change
    searchInput.addEventListener('input', performSearch);

    // Search when clicking the search icon
    searchIcon.addEventListener('click', performSearch);

    // Search when pressing Enter
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});