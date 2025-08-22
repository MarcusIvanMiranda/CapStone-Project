document.addEventListener('DOMContentLoaded', () => {
    const catsContainer = document.getElementById('catsContainer');
    const noCatsMessage = document.getElementById('noCatsMessage');

    const fetchAllCats = async () => {
        try {
            const response = await fetch('../API/CAT/display.php');
            const cats = await response.json();
            catsContainer.innerHTML = '';
            if (cats.length > 0) {
                noCatsMessage.style.display = 'none';
                cats.forEach(cat => {
                    const catCard = document.createElement('div');
                    catCard.className = 'cat-card';
                    catCard.innerHTML = `
                        <div class="cat-image">
                            <img src="${cat.image ? `../${cat.image}` : 'https://via.placeholder.com/60'}" alt="Cat Image">
                        </div>
                        <div class="cat-info">
                            <h3>${cat.name}</h3>
                            <p>Owner: ${cat.owner_name}</p>
                        </div>
                    `;
                    catsContainer.appendChild(catCard);
                });
            } else {
                noCatsMessage.style.display = 'block';
                catsContainer.appendChild(noCatsMessage);
            }
        } catch (error) {
            console.error('Error fetching cats:', error);
        }
    };

    fetchAllCats();
});