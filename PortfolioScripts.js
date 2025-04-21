const form = document.getElementById("portfolioForm");
const output = document.getElementById("portfolioOutput");

// This gets references to the color customization input fields.
const primaryColorInput = document.getElementById("primaryColor");
const textColorInput = document.getElementById("textColor");
const bgColorInput = document.getElementById("bgColor");

// This function to apply selected colors to the document using CSS variables.
function applyColors() {
  const root = document.documentElement;
  root.style.setProperty("--primary-color", primaryColorInput.value);
  root.style.setProperty("--text-color", textColorInput.value);
  root.style.setProperty("--bg-color", bgColorInput.value);
  
  // Calculating the secondary and accent colors based on primary color.
  const primaryColor = primaryColorInput.value;
  const secondaryColor = adjustColor(primaryColor, -20);
  const accentColor = adjustColor(primaryColor, 20);
  
  root.style.setProperty("--secondary-color", secondaryColor);
  root.style.setProperty("--accent-color", accentColor);
}

// This function will adjust color brightness.
function adjustColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Event listeners for color inputs that will apply changes when each color input is selected.
[primaryColorInput, textColorInput, bgColorInput].forEach(input => {
  input.addEventListener("input", applyColors);
});

// This function validates all form section data for the users personal information.
function validateForm(data) {
  const errors = [];
  
  if (!data.fullName.trim()) {
    errors.push("Full name is required");
  }
  
  if (!data.email.trim()) {
    errors.push("Email is required");
  } else if (!isValidEmail(data.email)) {
    errors.push("Please enter a valid email address");
  }
  
  if (data.phone && !isValidPhone(data.phone)) {
    errors.push("Please enter a valid phone number");
  }
  
  if (data.linkedin && !isValidUrl(data.linkedin)) {
    errors.push("Please enter a valid LinkedIn URL");
  }
  
  if (data.github && !isValidUrl(data.github)) {
    errors.push("Please enter a valid GitHub URL");
  }
  
  return errors;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^\+?[\d\s-()]{10,}$/.test(phone);
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// This function will format the user input data into HTML.
function generatePortfolio(data) {
  const html = `
    <div class="section header-section">
      <h1>${data.fullName}</h1>
      <p class="subtitle">${data.bio || 'Professional Portfolio'}</p>
      <div class="contact-info">
        ${data.email ? `<a href="mailto:${data.email}"><i class="fas fa-envelope"></i> ${data.email}</a>` : ''}
        ${data.phone ? `<a href="tel:${data.phone}"><i class="fas fa-phone"></i> ${data.phone}</a>` : ''}
        ${data.linkedin ? `<a href="${data.linkedin}" target="_blank"><i class="fab fa-linkedin"></i> LinkedIn</a>` : ''}
        ${data.github ? `<a href="${data.github}" target="_blank"><i class="fab fa-github"></i> GitHub</a>` : ''}
      </div>
    </div>

    ${data.skills.length > 0 ? `
      <div class="section">
        <h2><i class="fas fa-code"></i> Skills</h2>
        <div class="skills-list">
          ${data.skills.map(skill => `<span>${skill.trim()}</span>`).join("")}
        </div>
      </div>
    ` : ''}

    ${data.projects.some(p => p.trim()) ? `
      <div class="section">
        <h2><i class="fas fa-project-diagram"></i> Projects</h2>
        ${data.projects.map(p => {
          if (!p.trim()) return '';
          const [title, desc, link] = p.split("|").map(s => s.trim());
          return `
            <div class="project">
              <h3>${title || 'Untitled Project'}</h3>
              ${desc ? `<p>${desc}</p>` : ''}
              ${link ? `<a href="${link}" target="_blank" class="project-link">
                <i class="fas fa-external-link-alt"></i> View Project
              </a>` : ''}
            </div>
          `;
        }).join("")}
      </div>
    ` : ''}

    ${data.experience ? `
      <div class="section">
        <h2><i class="fas fa-briefcase"></i> Experience</h2>
        <div class="experience-item">
          ${data.experience.split("|").map(item => `<p>${item.trim()}</p>`).join("")}
        </div>
      </div>
    ` : ''}

    ${data.education ? `
      <div class="section">
        <h2><i class="fas fa-graduation-cap"></i> Education</h2>
        <div class="education-item">
          ${data.education.split("|").map(item => `<p>${item.trim()}</p>`).join("")}
        </div>
      </div>
    ` : ''}

    ${data.contactMessage ? `
      <div class="section">
        <h2><i class="fas fa-envelope"></i> Contact</h2>
        <p>${data.contactMessage}</p>
      </div>
    ` : ''}
  `;

  output.innerHTML = html;
}

// The form submission function here will gather all the input alues into a structured object.
form.addEventListener("submit", function(e) {
  e.preventDefault();

  const data = {
    fullName: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    bio: document.getElementById("bio").value,
    linkedin: document.getElementById("linkedin").value,
    github: document.getElementById("github").value,
    skills: document.getElementById("skills").value.split(",").filter(s => s.trim()),
    projects: [
      document.getElementById("project1").value,
      document.getElementById("project2").value
    ],
    experience: document.getElementById("experience").value,
    education: document.getElementById("education").value,
    contactMessage: document.getElementById("contactMessage").value,
    colors: {
      primary: primaryColorInput.value,
      text: textColorInput.value,
      background: bgColorInput.value
    }
  };
  // This will validate the form and display any issues.
  const errors = validateForm(data);
  
  if (errors.length > 0) {
    alert("Please fix the following errors:\n" + errors.join("\n"));
    return;
  }

  localStorage.setItem("portfolioBuilderData", JSON.stringify(data));
  generatePortfolio(data);
});

// This function will allow the user to create a PDF Download.
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.html(document.getElementById("portfolioOutput"), {
    callback: function (doc) {
      doc.save("portfolio.pdf");
    },
    x: 10,
    y: 10,
    width: 190,
    windowWidth: 800
  });
}

// Initialize app on page load so that user input data is not lost,
window.onload = () => {
  const savedData = localStorage.getItem("portfolioBuilderData");
  
  if (savedData) {
    const data = JSON.parse(savedData);
    
    // Applies saved colors if they exist already.
    if (data.colors) {
      primaryColorInput.value = data.colors.primary;
      textColorInput.value = data.colors.text;
      bgColorInput.value = data.colors.background;
      applyColors();
    }

    Object.keys(data).forEach(key => {
      if (key !== 'colors') {
        const element = document.getElementById(key);
        if (element) {
          if (Array.isArray(data[key])) {
            data[key].forEach((item, index) => {
              const projectElement = document.getElementById(`project${index + 1}`);
              if (projectElement) projectElement.value = item;
            });
          } else {
            element.value = data[key];
          }
        }
      }
    });
    // Regenerates portfolio when page reloads.
    generatePortfolio(data);
  }
};
