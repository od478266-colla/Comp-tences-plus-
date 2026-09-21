// Progress system + Confetti + Alive interactions
const Progress = {
  getKey(courseId) {
    return `sf_progress_${courseId}`;
  },

  get(courseId) {
    try {
      return JSON.parse(localStorage.getItem(this.getKey(courseId))) || {};
    } catch {
      return {};
    }
  },

  set(courseId, stepId, completed) {
    const data = this.get(courseId);
    data[stepId] = completed;
    localStorage.setItem(this.getKey(courseId), JSON.stringify(data));
    this.updateUI(courseId);
  },

  getPercentage(courseId, totalSteps) {
    const data = this.get(courseId);
    const done = Object.values(data).filter(Boolean).length;
    return Math.round((done / totalSteps) * 100);
  },

  updateUI(courseId) {
    const steps = document.querySelectorAll(`[data-course="${courseId}"] .step-card`);
    const total = steps.length;
    const pct = this.getPercentage(courseId, total || 1);
    
    const bar = document.querySelector(`[data-progress-bar="${courseId}"]`);
    const text = document.querySelector(`[data-progress-text="${courseId}"]`);
    
    if (bar) {
      bar.style.width = pct + '%';
      if (pct === 100) {
        bar.classList.add('complete');
      } else {
        bar.classList.remove('complete');
      }
    }
    if (text) text.textContent = pct + '%';

    const data = this.get(courseId);
    steps.forEach(card => {
      const stepId = card.dataset.step;
      const check = card.querySelector('.custom-check');
      
      if (data[stepId]) {
        card.classList.add('completed');
        if (check) check.classList.add('checked');
      } else {
        card.classList.remove('completed');
        if (check) check.classList.remove('checked');
      }
    });

    if (pct === 100 && !this._celebrated?.[courseId]) {
      this._celebrated = this._celebrated || {};
      this._celebrated[courseId] = true;
      launchConfetti();
      showCompletionMessage();
    }
  }
};

function toggleStep(courseId, stepId) {
  const data = Progress.get(courseId);
  const newState = !data[stepId];
  Progress.set(courseId, stepId, newState);
}

// Richer confetti
function launchConfetti() {
  const colors = ['#6366f1', '#a78bfa', '#34d399', '#f472b6', '#fbbf24', '#22d3ee', '#fb7185', '#c084fc'];
  const count = 140;
  
  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 0.6 + 's';
    confetti.style.animationDuration = (Math.random() * 2.2 + 2.2) + 's';
    confetti.style.width = (Math.random() * 9 + 5) + 'px';
    confetti.style.height = (Math.random() * 9 + 5) + 'px';
    confetti.style.borderRadius = Math.random() > 0.45 ? '50%' : '2px';
    confetti.style.opacity = Math.random() * 0.4 + 0.6;
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 4500);
  }
}

function showCompletionMessage() {
  const toast = document.createElement('div');
  toast.className = 'completion-toast';
  toast.innerHTML = `
    <div class="text-3xl mb-1">🎉</div>
    <div class="font-semibold text-white text-lg">Bravo !</div>
    <div class="text-sm text-slate-300 mt-0.5">Cours terminé avec succès</div>
  `;
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 450);
  }, 3800);
}

// Newsletter
function openNewsletter() {
  const modal = document.getElementById('newsletter-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closeNewsletter() {
  const modal = document.getElementById('newsletter-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }
}

function handleNewsletterSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('newsletter-email')?.value;
  if (!email) return;
  
  const list = JSON.parse(localStorage.getItem('sf_newsletter') || '[]');
  if (!list.includes(email)) {
    list.push(email);
    localStorage.setItem('sf_newsletter', JSON.stringify(list));
  }
  
  const form = document.getElementById('newsletter-form');
  const success = document.getElementById('newsletter-success');
  if (form) form.classList.add('hidden');
  if (success) success.classList.remove('hidden');
  
  setTimeout(() => {
    closeNewsletter();
    setTimeout(() => {
      if (form) form.classList.remove('hidden');
      if (success) success.classList.add('hidden');
      if (document.getElementById('newsletter-email')) document.getElementById('newsletter-email').value = '';
    }, 500);
  }, 2000);
}

// Staggered entrance for department cards
function animateDepartments() {
  const cards = document.querySelectorAll('.dept-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 80 + i * 90);
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  // Progress
  document.querySelectorAll('[data-course]').forEach(container => {
    const courseId = container.dataset.course;
    Progress.updateUI(courseId);
  });

  // Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.observe-fade').forEach(el => observer.observe(el));

  // Department cards entrance
  if (document.querySelector('.dept-card')) {
    // Small delay so the page feels alive on load
    setTimeout(animateDepartments, 150);
  }

  // Modal events
  const modal = document.getElementById('newsletter-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeNewsletter();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNewsletter();
  });
});
