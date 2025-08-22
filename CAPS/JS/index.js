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
    const ownersContainer = document.getElementById('ownersContainer');
    const noOwnersMessage = document.getElementById('noOwnersMessage');
    const ownerModal = document.getElementById('ownerModal');
    const ownerForm = document.getElementById('ownerForm');
    const notesContainer = document.getElementById('notesContainer');
    const noNotesMessage = document.getElementById('noNotesMessage');
    const noteForm = document.getElementById('noteForm');

    const addOwnerBtn = document.getElementById('addOwnerBtn');
    const closeBtns = document.querySelectorAll('.close-btn');

    const ownerModalTitle = ownerModal.querySelector('.modal-title');
    const submitBtn = ownerForm.querySelector('.submit-button');
    const ownerIdInput = document.getElementById('ownerId');
    const ownerPasswordInput = document.getElementById('ownerPassword');

    // Function to fetch and display owners
    const fetchOwners = async () => {
        console.log("Fetching owners...");
        try {
            const response = await fetch('../API/OWNER/display.php');
            const owners = await response.json();
            ownersContainer.innerHTML = '';
            if (owners.length > 0) {
                noOwnersMessage.style.display = 'none';
                owners.forEach(owner => {
                    const ownerCard = document.createElement('div');
                    ownerCard.className = 'owner-card';
                    ownerCard.setAttribute('data-id', owner.id);
                    ownerCard.innerHTML = `
                        <div class="owner-image">
                            <img src="${owner.image ? `../${owner.image}` : 'https://via.placeholder.com/60'}" alt="Owner Image">
                        </div>
                        <div class="owner-info">
                            <h3>${owner.name}</h3>
                            <p>Registered: ${new Date(owner.created_at).toLocaleDateString()}</p>
                        </div>
                        <div class="ellipsis-menu">
                            <i class="fas fa-ellipsis-h ellipsis-menu-icon"></i>
                            <div class="dropdown-menu">
                                <a href="#" class="dropdown-item edit-owner-btn" data-id="${owner.id}"><i class="fas fa-edit"></i> Edit</a>
                                <a href="#" class="dropdown-item delete-owner-btn" data-id="${owner.id}"><i class="fas fa-trash-alt"></i> Delete</a>
                            </div>
                        </div>
                    `;
                    ownersContainer.appendChild(ownerCard);
                });
            } else {
                noOwnersMessage.style.display = 'block';
                ownersContainer.appendChild(noOwnersMessage);
            }
        } catch (error) {
            console.error('Error fetching owners:', error);
            showAlert('Failed to load owners.', 'error');
        }
    };

    // Function to handle owner clicks and navigation
    ownersContainer.addEventListener('click', (e) => {
        const ownerCard = e.target.closest('.owner-card');
        if (ownerCard && !e.target.closest('.ellipsis-menu')) {
            const ownerId = ownerCard.getAttribute('data-id');
            window.location.href = `owner.html?owner_id=${ownerId}`;
        }
    });

    // Handle ellipsis menu toggles
    ownersContainer.addEventListener('click', (e) => {
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

    // Handle Edit and Delete buttons
    ownersContainer.addEventListener('click', async (e) => {
        if (e.target.closest('.edit-owner-btn')) {
            e.preventDefault();
            const ownerId = e.target.closest('.edit-owner-btn').getAttribute('data-id');
            await openOwnerModal(ownerId);
        }

        if (e.target.closest('.delete-owner-btn')) {
            e.preventDefault();
            const ownerId = e.target.closest('.delete-owner-btn').getAttribute('data-id');
            showConfirmation('Are you sure you want to delete this owner?', async () => {
                try {
                    const response = await fetch(`../API/OWNER/delete.php?id=${ownerId}`, { method: 'DELETE' });
                    const result = await response.json();
                    if (response.ok) {
                        showAlert(result.success, 'success');
                        fetchOwners();
                    } else {
                        showAlert(result.error, 'error');
                    }
                } catch (error) {
                    console.error('Error deleting owner:', error);
                    showAlert('An error occurred during deletion.', 'error');
                }
            });
        }
    });

    // Open Add Owner Modal
    addOwnerBtn.addEventListener('click', () => {
        ownerModal.style.display = 'block';
        ownerModalTitle.textContent = 'Add New Owner';
        submitBtn.textContent = 'Add Owner';
        ownerForm.reset();
        ownerIdInput.value = '';
        ownerPasswordInput.required = true;
    });

    // Open Edit Owner Modal
    const openOwnerModal = async (id) => {
        console.log("Attempting to open modal for owner ID:", id);
        try {
            const response = await fetch(`../API/OWNER/display.php?id=${id}`);
            const owner = await response.json();
            if (response.ok) {
                console.log("Owner data fetched successfully:", owner);
                ownerModal.style.display = 'block';
                ownerModalTitle.textContent = 'Edit Owner';
                submitBtn.textContent = 'Save Changes';
                ownerIdInput.value = owner.id;
                // These input names should match your HTML form
                document.getElementById('ownerName').value = owner.name;
                document.getElementById('ownerContact').value = owner.contact;
                document.getElementById('ownerGmail').value = owner.gmail;
                document.getElementById('ownerAddress').value = owner.address;
                ownerPasswordInput.required = false;
            } else {
                console.error("Error fetching owner data:", owner.error);
                showAlert(owner.error, 'error');
            }
        } catch (error) {
            console.error('Error fetching owner data:', error);
            showAlert('Failed to load owner data.', 'error');
        }
    };

    // Close Modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === ownerModal) {
            ownerModal.style.display = 'none';
        }
    });

    // Submit Owner Form
    ownerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const ownerId = ownerIdInput.value;
        const formData = new FormData(); // Manually create FormData to ensure key names are correct

        // Append fields with the correct names expected by the PHP script
        formData.append('id', ownerId);
        formData.append('name', document.getElementById('ownerName').value);
        formData.append('contact', document.getElementById('ownerContact').value);
        formData.append('gmail', document.getElementById('ownerGmail').value);
        formData.append('address', document.getElementById('ownerAddress').value);

        // Append the password only if it's not empty
        const passwordValue = ownerPasswordInput.value;
        if (passwordValue) {
            formData.append('password', passwordValue);
        }

        // Append the image file if one is selected
        const imageInput = document.getElementById('ownerImage'); // Assuming your file input has this ID
        if (imageInput && imageInput.files[0]) {
            formData.append('image', imageInput.files[0]);
        }

        let url;
        let successMessage;
        
        if (ownerId) {
            console.log("Submitting form for update. Owner ID:", ownerId);
            url = '../API/OWNER/update.php';
            successMessage = 'Owner updated successfully!';
        } else {
            console.log("Submitting form for creation. No owner ID.");
            url = '../API/OWNER/create.php';
            successMessage = 'Owner added successfully!';
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                showAlert(result.success || result.message, 'success');
                ownerModal.style.display = 'none';
                fetchOwners();
            } else {
                showAlert(result.error, 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showAlert('An error occurred. Please try again.', 'error');
        }
    });

    // Notes functionality
    const fetchNotes = async () => {
        console.log("Fetching notes...");
        try {
            const response = await fetch('../API/NOTE/display.php');
            const notes = await response.json();
            notesContainer.innerHTML = '';
            if (notes.length > 0) {
                noNotesMessage.style.display = 'none';
                notes.forEach(note => {
                    const noteCard = document.createElement('div');
                    noteCard.className = 'note-card';
                    noteCard.innerHTML = `
                        <p class="note-content">${note.note}</p>
                        <p class="note-date">${new Date(note.created_at).toLocaleString()}</p>
                        <button class="delete-note-btn" data-id="${note.id}"><i class="fas fa-times"></i></button>
                    `;
                    notesContainer.appendChild(noteCard);
                });
            } else {
                noNotesMessage.style.display = 'block';
                notesContainer.appendChild(noNotesMessage);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            showAlert('Failed to load notes.', 'error');
        }
    };

    noteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const noteText = document.getElementById('noteText').value;
        const formData = new FormData();
        formData.append('note', noteText);

        try {
            console.log("Submitting new note.");
            const response = await fetch('../API/NOTE/create.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                showAlert(result.success, 'success');
                noteForm.reset();
                fetchNotes();
            } else {
                console.error("Error creating note:", result.error);
                showAlert(result.error, 'error');
            }
        } catch (error) {
            console.error('Error adding note:', error);
            showAlert('An error occurred while adding the note.', 'error');
        }
    });

    notesContainer.addEventListener('click', async (e) => {
        if (e.target.closest('.delete-note-btn')) {
            const noteId = e.target.closest('.delete-note-btn').getAttribute('data-id');
            showConfirmation('Are you sure you want to delete this note?', async () => {
                try {
                    console.log("Deleting note with ID:", noteId);
                    const response = await fetch(`../API/NOTE/delete.php?id=${noteId}`, { method: 'DELETE' });
                    const result = await response.json();
                    if (response.ok) {
                        showAlert(result.success, 'success');
                        fetchNotes();
                    } else {
                        console.error("Error deleting note:", result.error);
                        showAlert(result.error, 'error');
                    }
                } catch (error) {
                    console.error('Error deleting note:', error);
                    showAlert('An error occurred during deletion.', 'error');
                }
            });
        }
    });

    // Initial load
    fetchOwners();
    fetchNotes();
});
