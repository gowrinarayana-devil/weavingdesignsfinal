/**
 * Dynamically updates document title and description meta tag for SEO
 * @param {string} title - Page title
 * @param {string} description - Page meta description
 */
export const updateSEO = (title, description) => {
  document.title = title ? `${title} | Weaving Designs` : 'Weaving Designs - Custom Jacquard & Embroidery Designs Marketplace';
  
  let metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description || 'Explore and download premium Jacquard weaving designs, border styles, motifs, and custom embroidery layouts.');
  } else {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    metaDescription.setAttribute('content', description || 'Explore and download premium Jacquard weaving designs, border styles, motifs, and custom embroidery layouts.');
    document.head.appendChild(metaDescription);
  }
};
