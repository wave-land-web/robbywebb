/**
 * Fade in sections with the class `aos-fade` when they come into view
 */
function handleSectionFadeOnScroll() {
  if (!window.IntersectionObserver) return console.log('IntersectionObserver not supported')

  const sections = document.querySelectorAll('.aos-fade') as NodeListOf<HTMLElement>

  if (sections.length !== 0) {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const section = entry.target as HTMLElement
          section.classList.add('active')
        }
      })
    }, options)

    sections.forEach((section) => observer.observe(section))
  }
}

/**
 * When page loads, fade in sections with the class `aol-fade`
 */
function handleSectionFadeOnLoad() {
  const sections = document.querySelectorAll('.aol-fade') as NodeListOf<HTMLElement>
  sections.forEach((section) => section.classList.add('active'))
}

// On page load
document.addEventListener('astro:page-load', () => {
  // Fade in sections on load
  handleSectionFadeOnLoad()

  // Fade in sections on scroll
  document.addEventListener('scroll', handleSectionFadeOnScroll)
})
