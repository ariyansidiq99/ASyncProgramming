const LANG_COLORS = {
    JavaScript:'#F7DF1E',
    TypeScript:'#3178C6', 
    Python:'#3776AB',
    HTML:'#E34F26', 
    CSS:'#1572B6', 
    PHP:'#777BB4', 
    Java:'#007396',
    'C++':'#00599C', 
    'C#':'#239120', 
    Rust:'#DEA584',
};

async function fetchGithubProfile(username) {
    const [profileRes, repoRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`),
        fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`)
    ]);

    if (!profileRes.ok) {
        throw new Error(`User "${username}" not found`);
    }

    const [profile, repos] = await Promise.all([
        profileRes.json(),
        repoRes.json()
    ]);

    return { profile, repos };
}

function renderProfile({ profile, repos }) {

    const langCount = repos.reduce((acc, repo) => {
        if (repo.language) {
            acc[repo.language] = (acc[repo.language] || 0) + 1;
        }
        return acc;
    }, {});

    const topLang =
        Object.entries(langCount)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || "Various";

    const repoCards = repos.map(repo => `
        <div class="repo-card" onclick="window.open('${repo.html_url}', '_blank')">
            <div class="repo-name">${repo.name}</div>
            <div class="repo-desc">${repo.description || 'No description'}</div>
            <div class="repo-meta">
                ${repo.language ? `
                    <span>
                        <span class="lang-dot" style="background:${LANG_COLORS[repo.language] || '#94A3B8'}"></span>
                        ${repo.language}
                    </span>` : ''
                }
                <span>⭐ ${repo.stargazers_count}</span>
                <span>🍴 ${repo.forks_count}</span>
            </div>
        </div>
    `).join('');

    document.querySelector('#container').innerHTML = `
        <div class="profile">
            <img class="avatar" src="${profile.avatar_url}" alt="${profile.login}">
            <div class="profile-info">
                <h2>${profile.name || profile.login}</h2>
                <p>${profile.bio || 'No bio'}</p>
                <p>📍 ${profile.location || 'Unknown'} · 🏢 ${profile.company || 'Independent'}</p>
                <p>Top language: ${topLang}</p>

                <div class="stats">
                    <div class="stat">
                        <div class="stat-num">${profile.public_repos}</div>
                        <div class="stat-lbl">Repos</div>
                    </div>
                    <div class="stat">
                        <div class="stat-num">${profile.followers}</div>
                        <div class="stat-lbl">Followers</div>
                    </div>
                    <div class="stat">
                        <div class="stat-num">${profile.following}</div>
                        <div class="stat-lbl">Following</div>
                    </div>
                </div>
            </div>
        </div>

        <h3>Recent Repositories</h3>
        <div class="repos">${repoCards}</div>
    `;
}

async function loadProfile(username) {
    document.querySelector("#container").innerHTML =
        `<p style="color:#64748b; text-align:center">Loading...</p>`;

    try {
        const data = await fetchGithubProfile(username);
        renderProfile(data);
    } catch (error) {
        document.querySelector("#container").innerHTML =
            `<div class="error">${error.message}</div>`;
    }
}

// Button click
document.querySelector("#searchBtn").addEventListener("click", () => {
    const u = document.querySelector("#userInput").value.trim();
    if (u) loadProfile(u);
});

// Enter key support
document.querySelector("#userInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const u = e.target.value.trim();
        if (u) loadProfile(u);
    }
});

// Default load
loadProfile("ariyansidiq99");