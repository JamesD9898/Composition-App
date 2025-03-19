// Dummy project data
const projects = [
    {
        id: 1,
        title: "Symphony in C Major",
        description: "A classical symphony featuring four movements with traditional harmonic progressions.",
        date: "May 15, 2023",
        fileSize: "2.4 MB",
        gradient: null // Will be set on initialization
    },
    {
        id: 2,
        title: "Jazz Quintet Arrangement",
        description: "Modern jazz arrangement with complex voicings and extended harmonies for piano, bass, drums, saxophone and trumpet.",
        date: "June 23, 2023",
        fileSize: "1.8 MB",
        gradient: null
    },
    {
        id: 3,
        title: "Film Score: 'Midnight Echo'",
        description: "Atmospheric score combining orchestral and electronic elements for an indie thriller.",
        date: "April 2, 2023",
        fileSize: "4.2 MB",
        gradient: null
    },
    {
        id: 4,
        title: "Piano Sonata No. 2",
        description: "Contemporary piano sonata exploring atonal harmonies and unconventional structures.",
        date: "July 8, 2023",
        fileSize: "856 KB",
        gradient: null
    },
    {
        id: 5,
        title: "String Quartet in E Minor",
        description: "Romantic-style string quartet with rich harmonic language and lyrical melodies.",
        date: "March 17, 2023",
        fileSize: "1.1 MB",
        gradient: null
    },
    {
        id: 6,
        title: "Choral Arrangement: 'Celestial Voices'",
        description: "SATB choral arrangement with complex counterpoint and voice leading techniques.",
        date: "August 12, 2023",
        fileSize: "3.7 MB",
        gradient: null
    }
];

// Username for deletion confirmation
const USER_NAME = "User Name"; // This would be the actual logged-in username

// Function to generate a pretty random gradient that matches our color scheme
function generateGradient() {
    // Use our brand colors instead of random hues
    const brandColors = [
        '#F5A623', // amber
        '#FFD68A', // amber light
        '#5A8C7B', // teal
        '#8CBCAC', // teal light
        '#C1D8C3', // sage
        '#E2EDE4', // sage light
    ];
    
    // Get two random colors from our brand colors
    const color1 = brandColors[Math.floor(Math.random() * brandColors.length)];
    let color2;
    
    // Make sure color2 is different from color1
    do {
        color2 = brandColors[Math.floor(Math.random() * brandColors.length)];
    } while (color2 === color1);
    
    // Create different gradient patterns using our brand colors
    const gradientTypes = [
        `linear-gradient(135deg, ${color1}, ${color2})`,
        `linear-gradient(to right, ${color1}, ${color2})`,
        `radial-gradient(circle at top left, ${color1}, ${color2})`,
        `radial-gradient(circle, ${color1}, ${color2})`
    ];
    
    return gradientTypes[Math.floor(Math.random() * gradientTypes.length)];
}

// Function to initialize project gradients
function initializeProjectGradients() {
    projects.forEach(project => {
        if (!project.gradient) {
            project.gradient = generateGradient();
        }
    });
}

// Function to render project cards
function renderProjects(projectsToRender) {
    const projectsContainer = document.getElementById('projects-container');
    
    // Clear the container
    projectsContainer.innerHTML = '';
    
    if (projectsToRender.length === 0) {
        projectsContainer.innerHTML = `
            <div class="empty-projects">
                <h3>No projects found</h3>
                <p>Try changing your search criteria or create a new project</p>
                <button class="cta-button">Create New Project</button>
            </div>
        `;
        return;
    }
    
    // Create project cards
    projectsToRender.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        
        projectCard.innerHTML = `
            <div class="project-gradient" style="background: ${project.gradient}"></div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-meta">
                    <span class="project-date">${project.date}</span>
                    <span class="project-filesize">${project.fileSize}</span>
                </div>
                <div class="project-actions">
                    <button class="project-btn open-btn" data-id="${project.id}">Open Project</button>
                    <button class="project-btn delete-btn" data-id="${project.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
        
        projectsContainer.appendChild(projectCard);
    });
    
    // Add event listeners to project buttons
    document.querySelectorAll('.open-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const projectId = e.target.getAttribute('data-id');
            console.log(`Opening project ${projectId}`);
            // Here you would navigate to the project or open it in the app
            alert(`Opening project ${projectId}. This would navigate to the specific project.`);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const projectId = parseInt(e.target.closest('.delete-btn').getAttribute('data-id'));
            openDeleteModal(projectId);
        });
    });
}

// Filter and sort projects
function filterProjects(searchTerm, filterValue) {
    searchTerm = searchTerm.toLowerCase();
    
    let filtered = projects;
    
    // Apply category filter
    if (filterValue !== 'all') {
        switch(filterValue) {
            case 'recent':
                // This would normally sort by date, but for simplicity we'll just take the first few
                filtered = projects.slice(0, 4);
                break;
            case 'shared':
                // For demo purposes, we'll pretend some are shared
                filtered = projects.filter(p => p.id % 2 === 0);
                break;
            case 'archived':
                // For demo purposes, we'll pretend some are archived
                filtered = projects.filter(p => p.id === 3 || p.id === 5);
                break;
        }
    }
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(project => 
            project.title.toLowerCase().includes(searchTerm) || 
            project.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort by date (most recent first)
    filtered.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA; // Descending order (newest first)
    });
    
    return filtered;
}

// Function to handle the delete modal
function setupDeleteModal() {
    const modal = document.getElementById('delete-modal');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancel-delete');
    const confirmBtn = document.getElementById('confirm-delete');
    const usernameInput = document.getElementById('confirm-username');
    const errorMessage = document.getElementById('delete-error');
    
    let currentProjectId = null;
    
    function openDeleteModal(projectId) {
        currentProjectId = projectId;
        
        // Reset form
        usernameInput.value = '';
        errorMessage.textContent = '';
        errorMessage.classList.remove('active');
        
        // Show modal
        modal.classList.add('active');
        
        // Focus on input
        setTimeout(() => {
            usernameInput.focus();
        }, 100);
    }
    
    function closeDeleteModal() {
        modal.classList.remove('active');
        currentProjectId = null;
    }
    
    // Close modal events
    closeBtn.addEventListener('click', closeDeleteModal);
    cancelBtn.addEventListener('click', closeDeleteModal);
    
    // Click outside to close
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeDeleteModal();
        }
    });
    
    // Confirm delete
    confirmBtn.addEventListener('click', () => {
        if (!currentProjectId) return;
        
        const enteredUsername = usernameInput.value.trim();
        
        if (enteredUsername !== USER_NAME) {
            errorMessage.textContent = 'Username is incorrect. Please try again.';
            errorMessage.classList.add('active');
            usernameInput.focus();
            return;
        }
        
        // Find and delete the project
        const projectIndex = projects.findIndex(p => p.id === currentProjectId);
        
        if (projectIndex !== -1) {
            // Remove the project from the array
            projects.splice(projectIndex, 1);
            
            // Close modal
            closeDeleteModal();
            
            // Re-render the projects
            const searchTerm = document.getElementById('search-projects').value;
            const filterValue = document.getElementById('project-filter').value;
            const filteredProjects = filterProjects(searchTerm, filterValue);
            renderProjects(filteredProjects);
        }
    });
    
    // Make function available globally
    window.openDeleteModal = openDeleteModal;
    
    return { openDeleteModal, closeDeleteModal };
}

// Initialize the dashboard
function initDashboard() {
    // Initialize gradients for all projects first
    initializeProjectGradients();
    
    // Set up delete modal
    setupDeleteModal();
    
    // Render all projects initially
    renderProjects(projects);
    
    // Update the user profile button text to match the username used for confirmation
    const userProfileButton = document.getElementById('user-profile');
    if (userProfileButton) {
        userProfileButton.textContent = USER_NAME;
    }
    
    // Set up search functionality
    const searchInput = document.getElementById('search-projects');
    const filterSelect = document.getElementById('project-filter');
    
    function updateProjects() {
        const searchTerm = searchInput.value;
        const filterValue = filterSelect.value;
        const filteredProjects = filterProjects(searchTerm, filterValue);
        renderProjects(filteredProjects);
    }
    
    searchInput.addEventListener('input', updateProjects);
    filterSelect.addEventListener('change', updateProjects);
    
    // Set up mobile menu toggling (same as main site)
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initDashboard); 