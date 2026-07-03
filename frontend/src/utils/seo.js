/**
 * Dynamically updates document title and description meta tag for SEO
 * Supports positional parameters (title, description) or a config object.
 * 
 * @param {string|object} titleOrConfig - Page title or config object
 * @param {string} [description] - Page meta description (if using positional)
 * @param {string} [image] - OG / Twitter image URL
 * @param {string} [url] - Canonical URL
 * @param {string} [type] - Page OG type (default: 'website')
 * @param {object} [schema] - Schema.org JSON-LD object to inject
 */
export const updateSEO = (titleOrConfig, description, image, url, type = 'website', schema) => {
  let title = '';
  let finalDesc = description;
  let finalImage = image;
  let finalUrl = url;
  let finalType = type;
  let finalSchema = schema;

  if (titleOrConfig && typeof titleOrConfig === 'object') {
    title = titleOrConfig.title;
    finalDesc = titleOrConfig.description;
    finalImage = titleOrConfig.image;
    finalUrl = titleOrConfig.url;
    finalType = titleOrConfig.type || 'website';
    finalSchema = titleOrConfig.schema;
  } else {
    title = titleOrConfig;
  }

  // Update document title
  document.title = title ? `${title} | Weaving Designs` : 'Weaving Designs - Custom Jacquard & Embroidery Designs Marketplace';

  // Helper to set meta tag attributes dynamically
  const setMetaTag = (attrName, attrVal, content) => {
    let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
    if (content) {
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    } else if (element) {
      element.remove();
    }
  };

  const defaultDesc = 'Explore and download premium Jacquard weaving designs, border styles, motifs, and custom embroidery layouts.';
  const actualDesc = finalDesc || defaultDesc;

  // Standard Meta Tags
  setMetaTag('name', 'description', actualDesc);

  // Open Graph / Facebook
  setMetaTag('property', 'og:title', title ? `${title} | Weaving Designs` : 'Weaving Designs');
  setMetaTag('property', 'og:description', actualDesc);
  setMetaTag('property', 'og:type', finalType);
  setMetaTag('property', 'og:url', finalUrl || window.location.href);
  if (finalImage) {
    setMetaTag('property', 'og:image', finalImage);
  } else {
    // default site preview/logo if available
    setMetaTag('property', 'og:image', `${window.location.origin}/logo.jpg`);
  }

  // Twitter Cards
  setMetaTag('name', 'twitter:card', finalImage ? 'summary_large_image' : 'summary');
  setMetaTag('name', 'twitter:title', title ? `${title} | Weaving Designs` : 'Weaving Designs');
  setMetaTag('name', 'twitter:description', actualDesc);
  if (finalImage) {
    setMetaTag('name', 'twitter:image', finalImage);
  } else {
    setMetaTag('name', 'twitter:image', `${window.location.origin}/logo.jpg`);
  }

  // Dynamic Schema.org JSON-LD structured data injection
  let schemaScript = document.getElementById('seo-jsonld');
  if (finalSchema) {
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.setAttribute('id', 'seo-jsonld');
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(finalSchema, null, 2);
  } else if (schemaScript) {
    schemaScript.remove();
  }
};
