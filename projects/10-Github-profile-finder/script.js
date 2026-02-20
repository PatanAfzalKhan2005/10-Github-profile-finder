// Get DOM elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const profileContainer = document.getElementById('profileContainer');

// Event listeners
searchBtn.addEventListener('click', searchUser);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchUser();
});

// Search user
async function searchUser() {
    const username = searchInput.value.trim();

    if (!username) {
        showError('Please enter a GitHub username');
        return;
    }

    hideAll();
    loading.classList.add('show');

    try {
        const [userData, reposData] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`),
            fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`)
        ]);

        if (!userData.ok) {
            throw new Error('User not found');
        }

        const user = await userData.json();
        const repos = await reposData.json();

        displayProfile(user);
        displayRepos(repos);

        loading.classList.remove('show');
        profileContainer.classList.add('show');

    } catch (err) {
        loading.classList.remove('show');
        showError(err.message === 'User not found' ? 'User not found. Please try another username.' : 'Something went wrong. Please try again.');
    }
}

// Display profile
function displayProfile(user) {
    document.getElementById('avatar').src = user.avatar_url;
    document.getElementById('name').textContent = user.name || user.login;
    document.getElementById('username').textContent = `@${user.login}`;
    document.getElementById('bio').textContent = user.bio || 'No bio available';
    document.getElementById('followers').textContent = user.followers;
    document.getElementById('following').textContent = user.following;
    document.getElementById('repos').textContent = user.public_repos;
    document.getElementById('profileLink').href = user.html_url;

    const locationEl = document.getElementById('location');
    locationEl.textContent = user.location ? `📍 ${user.location}` : '';

    const createdEl = document.getElementById('created');
    createdEl.textContent = `📅 Joined ${formatDate(user.created_at)}`;
}

// Display repositories
function displayRepos(repos) {
    const reposList = document.getElementById('reposList');

    if (repos.length === 0) {
        reposList.innerHTML = '<p class="no-repos">No public repositories available</p>';
        return;
    }

    reposList.innerHTML = repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .map(repo => `
            <div class="repo-card">
                <a href="${repo.html_url}" target="_blank" class="repo-name">${repo.name}</a>
                <p class="repo-description">${repo.description || 'No description available'}</p>
                <div class="repo-stats">
                    <span>⭐ ${repo.stargazers_count}</span>
                    <span>🍴 ${repo.forks_count}</span>
                    ${repo.language ? `<span>💻 ${repo.language}</span>` : ''}
                </div>
            </div>
        `).join('');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Show error
function showError(message) {
    error.textContent = message;
    error.classList.add('show');
    setTimeout(() => error.classList.remove('show'), 3000);
}

// Hide all sections
function hideAll() {
    error.classList.remove('show');
    profileContainer.classList.remove('show');
}
