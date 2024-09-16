/**
 * Animate sections with the class `lsa` when they come into view
 */
function handleAnimations() {
  if (!window.IntersectionObserver) {
    return console.log('IntersectionObserver not supported')
  }

  // Grab all sections to be animated
  const sections = document.querySelectorAll('.lsa')

  // Configure observer options
  if (sections.length !== 0) {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.25,
    }

    // Initialize observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const section = entry.target

        // By default, animations repeat on scroll unless the section has the class `no-repeat`
        if (entry.isIntersecting) {
          section.classList.add('active')
        } else if (!entry.isIntersecting && !section.classList.contains('no-repeat')) {
          section.classList.remove('active')
        }
      })
    }, options)

    // Observe each section with the class `lsa`
    sections.forEach((section) => observer.observe(section))
  }
}

// Handle animations on page load
document.addEventListener('DOMContentLoaded', () => {
  handleAnimations()

  // Handle animations on scroll
  document.addEventListener('scroll', handleAnimations)
})
