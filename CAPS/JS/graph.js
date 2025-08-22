document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const catId = params.get('cat_id');

    if (!catId) {
        window.location.href = 'index.html';
        return;
    }
    
    const catNameTitle = document.getElementById('catNameTitle');
    const catProfileImage = document.getElementById('catProfileImage');
    const catProfileName = document.getElementById('catProfileName');
    const catOwnerName = document.getElementById('catOwnerName');
    const catBreed = document.getElementById('catBreed');
    const catBirthDate = document.getElementById('catBirthDate');
    const catRegisteredDate = document.getElementById('catRegisteredDate');

    const fetchCatDetails = async () => {
        try {
            const response = await fetch(`../API/CAT/display.php?id=${catId}`);
            const cat = await response.json();
            if (response.ok) {
                catNameTitle.textContent = `${cat.name}'s Profile`;
                // Corrected line: Prepend '../' to the image URL for the correct path
                catProfileImage.src = cat.image ? `../${cat.image}` : 'https://via.placeholder.com/180';
                catProfileName.textContent = cat.name;
                catOwnerName.textContent = cat.owner_name;
                catBreed.textContent = cat.breed;
                catBirthDate.textContent = cat.birth_date;
                catRegisteredDate.textContent = new Date(cat.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
            } else {
                console.error('Error fetching cat details:', cat.error);
                catNameTitle.textContent = 'Cat Not Found';
            }
        } catch (error) {
            console.error('Error fetching cat details:', error);
            catNameTitle.textContent = 'Error Loading Cat Profile';
        }
    };

    fetchCatDetails();
});
