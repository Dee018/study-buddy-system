export const scrollToTop = (behavior: 'smooth' | 'instant' = 'smooth') => {
  window.scrollTo({ top: 0, behavior });
};

export const scrollToElement = (elementId: string, behavior: 'smooth' | 'instant' = 'smooth') => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior, block: 'start' });
  }
};