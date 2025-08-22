// Custom alert function
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert ${type}`;
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Function to handle confirmation
function showConfirmation(message, onConfirm) {
    if (confirm(message)) {
        onConfirm();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const ownerId = params.get('owner_id');

    if (!ownerId) {
        window.location.href = 'index.html';
        return;
    }

    const ownerNameTitle = document.getElementById('ownerNameTitle');
    const ownerProfileName = document.getElementById('ownerProfileName');
    const ownerContact = document.getElementById('ownerContact');
    const ownerEmail = document.getElementById('ownerEmail');
    const ownerAddress = document.getElementById('ownerAddress');
    const ownerRegisteredDate = document.getElementById('ownerRegisteredDate');
    const ownerProfileImage = document.getElementById('ownerProfileImage');

    const catsContainer = document.getElementById('catsContainer');
    const noCatsMessage = document.getElementById('noCatsMessage');
    const addCatBtn = document.getElementById('addCatBtn');
    const catModal = document.getElementById('catModal');
    const closeBtn = catModal.querySelector('.close-btn');

    const catForm = document.getElementById('catForm');
    const catModalTitle = catModal.querySelector('.modal-title');
    const catSubmitBtn = catForm.querySelector('.submit-button');
    const catIdInput = document.getElementById('catId');
    const catOwnerIdInput = document.getElementById('catOwnerId');

    // Function to fetch and display owner details
    const fetchOwnerDetails = async () => {
        try {
            const response = await fetch(`../API/OWNER/display.php?id=${ownerId}`);
            const owner = await response.json();
            if (response.ok) {
                ownerNameTitle.textContent = owner.name;
                ownerProfileName.textContent = owner.name;
                ownerContact.textContent = `Contact: ${owner.contact}`;
                ownerEmail.textContent = `Email: ${owner.gmail}`;
                ownerAddress.textContent = `Address: ${owner.address}`;
                ownerRegisteredDate.textContent = `Registered: ${new Date(owner.created_at).toLocaleDateString()}`;
                ownerProfileImage.src = owner.image ? `../${owner.image}` : 'https://via.placeholder.com/150';
            } else {
                showAlert(owner.error, 'error');
            }
        } catch (error) {
            console.error('Error fetching owner details:', error);
            showAlert('Failed to load owner details.', 'error');
        }
    };

    // Function to fetch and display cats for the owner
    const fetchCats = async () => {
        try {
            const response = await fetch(`../API/CAT/display.php?owner_id=${ownerId}`);
            const cats = await response.json();
            catsContainer.innerHTML = '';
            if (cats.length > 0) {
                noCatsMessage.style.display = 'none';
                cats.forEach(cat => {
                    const catCard = document.createElement('div');
                    // Add data-id to the card itself for easy navigation
                    catCard.className = 'cat-card';
                    catCard.setAttribute('data-id', cat.id);
                    catCard.innerHTML = `
                        <div class="cat-image">
                            <img src="${cat.image ? `../${cat.image}` : 'https://via.placeholder.com/60'}" alt="Cat Image">
                        </div>
                        <div class="cat-info">
                            <h3>${cat.name}</h3>
                            <p>Breed: ${cat.breed}</p>
                            <p>Birth Date: ${cat.birth_date}</p>
                        </div>
                        <div class="ellipsis-menu">
                            <i class="fas fa-ellipsis-h ellipsis-menu-icon"></i>
                            <div class="dropdown-menu">
                                <a href="#" class="dropdown-item edit-cat-btn" data-id="${cat.id}"><i class="fas fa-edit"></i> Edit</a>
                                <a href="#" class="dropdown-item delete-cat-btn" data-id="${cat.id}"><i class="fas fa-trash-alt"></i> Delete</a>
                            </div>
                        </div>
                    `;
                    catsContainer.appendChild(catCard);
                });
            } else {
                noCatsMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching cats:', error);
            showAlert('Failed to load cats.', 'error');
        }
    };

    // Handle clicks on the entire cat card to navigate
    catsContainer.addEventListener('click', (e) => {
        const catCard = e.target.closest('.cat-card');
        if (catCard) {
            const catId = catCard.getAttribute('data-id');
            window.location.href = `graph.html?cat_id=${catId}`;
        }
    });

    // Handle ellipsis menu toggles for cats
    catsContainer.addEventListener('click', (e) => {
        const ellipsisBtn = e.target.closest('.ellipsis-menu-icon');
        if (ellipsisBtn) {
            e.stopPropagation();
            const dropdown = ellipsisBtn.nextElementSibling;
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu !== dropdown) {
                    menu.classList.remove('show');
                }
            });
            dropdown.classList.toggle('show');
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.ellipsis-menu')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    // Handle Edit and Delete cat buttons
    catsContainer.addEventListener('click', async (e) => {
        if (e.target.closest('.edit-cat-btn')) {
            e.preventDefault();
            const catId = e.target.closest('.edit-cat-btn').getAttribute('data-id');
            await openCatModal(catId);
        }

        if (e.target.closest('.delete-cat-btn')) {
            e.preventDefault();
            const catId = e.target.closest('.delete-cat-btn').getAttribute('data-id');
            showConfirmation('Are you sure you want to delete this cat?', async () => {
                try {
                    const response = await fetch(`../API/CAT/delete.php?id=${catId}`, { method: 'DELETE' });
                    const result = await response.json();
                    if (response.ok) {
                        showAlert(result.success, 'success');
                        fetchCats();
                    } else {
                        showAlert(result.error, 'error');
                    }
                } catch (error) {
                    console.error('Error deleting cat:', error);
                    showAlert('An error occurred during deletion.', 'error');
                }
            });
        }
    });

    // Open Add Cat Modal
    addCatBtn.addEventListener('click', () => {
        catModal.style.display = 'block';
        catModalTitle.textContent = 'Add New Cat';
        catSubmitBtn.textContent = 'Add Cat';
        catForm.reset();
        catIdInput.value = '';
    });

    // Open Edit Cat Modal
    const openCatModal = async (id) => {
        try {
            const response = await fetch(`../API/CAT/display.php?id=${id}`);
            const cat = await response.json();
            if (response.ok) {
                catModal.style.display = 'block';
                catModalTitle.textContent = 'Edit Cat';
                catSubmitBtn.textContent = 'Save Changes';
                catIdInput.value = cat.id;
                document.getElementById('catName').value = cat.name;
                document.getElementById('catBreed').value = cat.breed;
                document.getElementById('catBirthDate').value = cat.birth_date;
            } else {
                showAlert(cat.error, 'error');
            }
        } catch (error) {
            console.error('Error fetching cat data:', error);
            showAlert('Failed to load cat data.', 'error');
        }
    };

    // Close Modal
    closeBtn.addEventListener('click', () => {
        catModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === catModal) {
            catModal.style.display = 'none';
        }
    });

    // Submit Cat Form
    catForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const catId = catIdInput.value;
        const formData = new FormData(catForm);
        
        if (catId) {
            formData.append('id', catId);
        }
        
        formData.append('owner_id', ownerId);

        let url;
        if (catId) {
            url = '../API/CAT/update.php';
        } else {
            url = '../API/CAT/create.php';
        }
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                showAlert(result.success || result.message, 'success');
                catModal.style.display = 'none';
                fetchCats();
            } else {
                showAlert(result.error, 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showAlert('An error occurred. Please try again.', 'error');
        }
    });

    // Initial loads
    fetchOwnerDetails();
    fetchCats();
});
