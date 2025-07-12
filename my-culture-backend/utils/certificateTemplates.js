// Certificate Template System
export const certificateTemplates = {
  'elegant-gold': {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    description: 'Classic design with gold borders and ornate styling',
    preview: '/templates/elegant-gold-preview.jpg',
    category: 'formal',
    style: {
      container: {
        background: 'linear-gradient(135deg, #fefefe 0%, #f8f8f8 100%)',
        border: '15px solid #d4af37',
        borderRadius: '8px',
        boxShadow: '0 0 40px rgba(212, 175, 55, 0.3)',
        padding: '60px',
        position: 'relative',
        maxWidth: '1000px',
        minHeight: '700px'
      },
      innerBorder: {
        border: '3px solid #d4af37',
        borderStyle: 'double',
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        bottom: '20px'
      },
      typography: {
        title: {
          fontFamily: '"Playfair Display", serif',
          fontSize: '3.5rem',
          fontWeight: '700',
          color: '#2c3e50',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: '30px'
        },
        subtitle: {
          fontFamily: '"Open Sans", sans-serif',
          fontSize: '1.5rem',
          color: '#34495e',
          fontStyle: 'italic',
          marginBottom: '40px'
        },
        recipient: {
          fontFamily: '"Playfair Display", serif',
          fontSize: '2.5rem',
          fontWeight: '600',
          color: '#d4af37',
          marginBottom: '30px'
        },
        details: {
          fontFamily: '"Open Sans", sans-serif',
          fontSize: '1.2rem',
          color: '#2c3e50',
          lineHeight: '1.6'
        }
      },
      decorations: {
        seal: {
          position: 'absolute',
          bottom: '40px',
          right: '40px',
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, #d4af37, #b8941f)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold'
        }
      }
    }
  },

  'modern-minimal': {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean, contemporary design with subtle colors',
    preview: '/templates/modern-minimal-preview.jpg',
    category: 'modern',
    style: {
      container: {
        background: '#ffffff',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        padding: '50px',
        maxWidth: '1000px',
        minHeight: '700px',
        position: 'relative'
      },
      accent: {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        height: '8px',
        background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px'
      },
      typography: {
        title: {
          fontFamily: '"Inter", sans-serif',
          fontSize: '3rem',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '20px',
          letterSpacing: '-0.025em'
        },
        subtitle: {
          fontFamily: '"Inter", sans-serif',
          fontSize: '1.25rem',
          color: '#6b7280',
          marginBottom: '40px',
          fontWeight: '400'
        },
        recipient: {
          fontFamily: '"Inter", sans-serif',
          fontSize: '2.25rem',
          fontWeight: '600',
          color: '#3b82f6',
          marginBottom: '30px'
        },
        details: {
          fontFamily: '"Inter", sans-serif',
          fontSize: '1.1rem',
          color: '#374151',
          lineHeight: '1.7'
        }
      }
    }
  },

  'academic-traditional': {
    id: 'academic-traditional',
    name: 'Academic Traditional',
    description: 'University-style design with formal elements',
    preview: '/templates/academic-traditional-preview.jpg',
    category: 'academic',
    style: {
      container: {
        background: '#fdfcfa',
        border: '12px solid #1e40af',
        borderRadius: '4px',
        padding: '55px',
        maxWidth: '1000px',
        minHeight: '700px',
        position: 'relative'
      },
      crest: {
        position: 'absolute',
        top: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80px',
        height: '80px',
        background: '#1e40af',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold'
      },
      typography: {
        title: {
          fontFamily: '"Crimson Text", serif',
          fontSize: '3.2rem',
          fontWeight: '600',
          color: '#1e40af',
          textAlign: 'center',
          marginTop: '60px',
          marginBottom: '25px'
        },
        subtitle: {
          fontFamily: '"Crimson Text", serif',
          fontSize: '1.4rem',
          color: '#374151',
          textAlign: 'center',
          fontStyle: 'italic',
          marginBottom: '40px'
        },
        recipient: {
          fontFamily: '"Crimson Text", serif',
          fontSize: '2.8rem',
          fontWeight: '600',
          color: '#dc2626',
          textAlign: 'center',
          marginBottom: '30px'
        },
        details: {
          fontFamily: '"Crimson Text", serif',
          fontSize: '1.2rem',
          color: '#1f2937',
          textAlign: 'center',
          lineHeight: '1.6'
        }
      }
    }
  },

  'creative-artistic': {
    id: 'creative-artistic',
    name: 'Creative Artistic',
    description: 'Vibrant design for creative achievements',
    preview: '/templates/creative-artistic-preview.jpg',
    category: 'creative',
    style: {
      container: {
        background: 'linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 50%, #ddd6fe 100%)',
        border: '8px solid transparent',
        borderImage: 'linear-gradient(45deg, #ec4899, #8b5cf6, #3b82f6) 1',
        borderRadius: '16px',
        padding: '50px',
        maxWidth: '1000px',
        minHeight: '700px',
        position: 'relative'
      },
      decorativeElements: {
        topLeft: {
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(45deg, #ec4899, #8b5cf6)',
          borderRadius: '50%',
          opacity: '0.7'
        },
        bottomRight: {
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
          borderRadius: '30%',
          opacity: '0.6'
        }
      },
      typography: {
        title: {
          fontFamily: '"Poppins", sans-serif',
          fontSize: '3.2rem',
          fontWeight: '700',
          background: 'linear-gradient(45deg, #ec4899, #8b5cf6)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          textAlign: 'center',
          marginBottom: '25px'
        },
        subtitle: {
          fontFamily: '"Poppins", sans-serif',
          fontSize: '1.3rem',
          color: '#6b21a8',
          textAlign: 'center',
          marginBottom: '35px'
        },
        recipient: {
          fontFamily: '"Poppins", sans-serif',
          fontSize: '2.5rem',
          fontWeight: '600',
          color: '#1f2937',
          textAlign: 'center',
          marginBottom: '30px'
        },
        details: {
          fontFamily: '"Poppins", sans-serif',
          fontSize: '1.15rem',
          color: '#374151',
          textAlign: 'center',
          lineHeight: '1.7'
        }
      }
    }
  },

  'corporate-professional': {
    id: 'corporate-professional',
    name: 'Corporate Professional',
    description: 'Business-oriented design for corporate training',
    preview: '/templates/corporate-professional-preview.jpg',
    category: 'corporate',
    style: {
      container: {
        background: '#ffffff',
        border: '3px solid #374151',
        borderRadius: '8px',
        padding: '50px',
        maxWidth: '1000px',
        minHeight: '700px',
        position: 'relative'
      },
      header: {
        borderBottom: '4px solid #374151',
        paddingBottom: '20px',
        marginBottom: '40px'
      },
      sidebar: {
        position: 'absolute',
        left: '0',
        top: '0',
        bottom: '0',
        width: '8px',
        background: 'linear-gradient(180deg, #1f2937, #4b5563)',
        borderTopLeftRadius: '8px',
        borderBottomLeftRadius: '8px'
      },
      typography: {
        title: {
          fontFamily: '"Roboto", sans-serif',
          fontSize: '2.8rem',
          fontWeight: '700',
          color: '#1f2937',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '15px'
        },
        subtitle: {
          fontFamily: '"Roboto", sans-serif',
          fontSize: '1.2rem',
          color: '#4b5563',
          marginBottom: '40px'
        },
        recipient: {
          fontFamily: '"Roboto", sans-serif',
          fontSize: '2.2rem',
          fontWeight: '500',
          color: '#1f2937',
          marginBottom: '25px'
        },
        details: {
          fontFamily: '"Roboto", sans-serif',
          fontSize: '1.1rem',
          color: '#374151',
          lineHeight: '1.6'
        }
      }
    }
  }
};

export const getTemplateById = (templateId) => {
  return certificateTemplates[templateId] || certificateTemplates['elegant-gold'];
};

export const getAllTemplates = () => {
  return Object.values(certificateTemplates);
};

export const getTemplatesByCategory = (category) => {
  return Object.values(certificateTemplates).filter(template => 
    template.category === category
  );
};

// Generate HTML for certificate template
export const generateCertificateHTML = (template, certificateData) => {
  const { participant, event, issueDate, signature, organizationName } = certificateData;
  
  const createStyleSheet = (style) => {
    let css = '';
    
    // Container styles
    css += `
    .certificate-container {
      ${style.container.background ? `background: ${style.container.background};` : ''}
      ${style.container.border ? `border: ${style.container.border};` : ''}
      ${style.container.borderRadius ? `border-radius: ${style.container.borderRadius};` : ''}
      ${style.container.boxShadow ? `box-shadow: ${style.container.boxShadow};` : ''}
      ${style.container.padding ? `padding: ${style.container.padding};` : ''}
      ${style.container.maxWidth ? `max-width: ${style.container.maxWidth};` : ''}
      ${style.container.minHeight ? `min-height: ${style.container.minHeight};` : ''}
      ${style.container.position ? `position: ${style.container.position};` : ''}
      margin: 0 auto;
      font-family: Arial, sans-serif;
    }`;
    
    // Inner border (for elegant-gold)
    if (style.innerBorder) {
      css += `
      .certificate-container::before {
        content: '';
        ${style.innerBorder.border ? `border: ${style.innerBorder.border};` : ''}
        ${style.innerBorder.borderStyle ? `border-style: ${style.innerBorder.borderStyle};` : ''}
        ${style.innerBorder.position ? `position: ${style.innerBorder.position};` : ''}
        ${style.innerBorder.top ? `top: ${style.innerBorder.top};` : ''}
        ${style.innerBorder.left ? `left: ${style.innerBorder.left};` : ''}
        ${style.innerBorder.right ? `right: ${style.innerBorder.right};` : ''}
        ${style.innerBorder.bottom ? `bottom: ${style.innerBorder.bottom};` : ''}
      }`;
    }
    
    // Accent line (for modern-minimal)
    if (style.accent) {
      css += `
      .certificate-accent {
        ${style.accent.position ? `position: ${style.accent.position};` : ''}
        ${style.accent.top ? `top: ${style.accent.top};` : ''}
        ${style.accent.left ? `left: ${style.accent.left};` : ''}
        ${style.accent.right ? `right: ${style.accent.right};` : ''}
        ${style.accent.height ? `height: ${style.accent.height};` : ''}
        ${style.accent.background ? `background: ${style.accent.background};` : ''}
        ${style.accent.borderTopLeftRadius ? `border-top-left-radius: ${style.accent.borderTopLeftRadius};` : ''}
        ${style.accent.borderTopRightRadius ? `border-top-right-radius: ${style.accent.borderTopRightRadius};` : ''}
      }`;
    }
    
    // Typography styles
    const typo = style.typography;
    css += `
    .cert-title {
      ${typo.title.fontFamily ? `font-family: ${typo.title.fontFamily};` : ''}
      ${typo.title.fontSize ? `font-size: ${typo.title.fontSize};` : ''}
      ${typo.title.fontWeight ? `font-weight: ${typo.title.fontWeight};` : ''}
      ${typo.title.color ? `color: ${typo.title.color};` : ''}
      ${typo.title.textTransform ? `text-transform: ${typo.title.textTransform};` : ''}
      ${typo.title.letterSpacing ? `letter-spacing: ${typo.title.letterSpacing};` : ''}
      ${typo.title.marginBottom ? `margin-bottom: ${typo.title.marginBottom};` : ''}
      ${typo.title.textAlign ? `text-align: ${typo.title.textAlign};` : ''}
      ${typo.title.marginTop ? `margin-top: ${typo.title.marginTop};` : ''}
      ${typo.title.background ? `background: ${typo.title.background};` : ''}
      ${typo.title.backgroundClip ? `background-clip: ${typo.title.backgroundClip};` : ''}
      ${typo.title.WebkitBackgroundClip ? `-webkit-background-clip: ${typo.title.WebkitBackgroundClip};` : ''}
    }
    
    .cert-subtitle {
      ${typo.subtitle.fontFamily ? `font-family: ${typo.subtitle.fontFamily};` : ''}
      ${typo.subtitle.fontSize ? `font-size: ${typo.subtitle.fontSize};` : ''}
      ${typo.subtitle.color ? `color: ${typo.subtitle.color};` : ''}
      ${typo.subtitle.fontStyle ? `font-style: ${typo.subtitle.fontStyle};` : ''}
      ${typo.subtitle.marginBottom ? `margin-bottom: ${typo.subtitle.marginBottom};` : ''}
      ${typo.subtitle.fontWeight ? `font-weight: ${typo.subtitle.fontWeight};` : ''}
      ${typo.subtitle.textAlign ? `text-align: ${typo.subtitle.textAlign};` : ''}
    }
    
    .cert-recipient {
      ${typo.recipient.fontFamily ? `font-family: ${typo.recipient.fontFamily};` : ''}
      ${typo.recipient.fontSize ? `font-size: ${typo.recipient.fontSize};` : ''}
      ${typo.recipient.fontWeight ? `font-weight: ${typo.recipient.fontWeight};` : ''}
      ${typo.recipient.color ? `color: ${typo.recipient.color};` : ''}
      ${typo.recipient.marginBottom ? `margin-bottom: ${typo.recipient.marginBottom};` : ''}
      ${typo.recipient.textAlign ? `text-align: ${typo.recipient.textAlign};` : ''}
    }
    
    .cert-details {
      ${typo.details.fontFamily ? `font-family: ${typo.details.fontFamily};` : ''}
      ${typo.details.fontSize ? `font-size: ${typo.details.fontSize};` : ''}
      ${typo.details.color ? `color: ${typo.details.color};` : ''}
      ${typo.details.lineHeight ? `line-height: ${typo.details.lineHeight};` : ''}
      ${typo.details.textAlign ? `text-align: ${typo.details.textAlign};` : ''}
    }`;
    
    // Decorations and special elements
    if (style.decorations?.seal) {
      const seal = style.decorations.seal;
      css += `
      .cert-seal {
        ${seal.position ? `position: ${seal.position};` : ''}
        ${seal.bottom ? `bottom: ${seal.bottom};` : ''}
        ${seal.right ? `right: ${seal.right};` : ''}
        ${seal.width ? `width: ${seal.width};` : ''}
        ${seal.height ? `height: ${seal.height};` : ''}
        ${seal.background ? `background: ${seal.background};` : ''}
        ${seal.borderRadius ? `border-radius: ${seal.borderRadius};` : ''}
        ${seal.display ? `display: ${seal.display};` : ''}
        ${seal.alignItems ? `align-items: ${seal.alignItems};` : ''}
        ${seal.justifyContent ? `justify-content: ${seal.justifyContent};` : ''}
        ${seal.color ? `color: ${seal.color};` : ''}
        ${seal.fontSize ? `font-size: ${seal.fontSize};` : ''}
        ${seal.fontWeight ? `font-weight: ${seal.fontWeight};` : ''}
      }`;
    }
    
    if (style.crest) {
      const crest = style.crest;
      css += `
      .cert-crest {
        ${crest.position ? `position: ${crest.position};` : ''}
        ${crest.top ? `top: ${crest.top};` : ''}
        ${crest.left ? `left: ${crest.left};` : ''}
        ${crest.transform ? `transform: ${crest.transform};` : ''}
        ${crest.width ? `width: ${crest.width};` : ''}
        ${crest.height ? `height: ${crest.height};` : ''}
        ${crest.background ? `background: ${crest.background};` : ''}
        ${crest.borderRadius ? `border-radius: ${crest.borderRadius};` : ''}
        ${crest.display ? `display: ${crest.display};` : ''}
        ${crest.alignItems ? `align-items: ${crest.alignItems};` : ''}
        ${crest.justifyContent ? `justify-content: ${crest.justifyContent};` : ''}
        ${crest.color ? `color: ${crest.color};` : ''}
        ${crest.fontSize ? `font-size: ${crest.fontSize};` : ''}
        ${crest.fontWeight ? `font-weight: ${crest.fontWeight};` : ''}
      }`;
    }
    
    if (style.header) {
      const header = style.header;
      css += `
      .cert-header {
        ${header.borderBottom ? `border-bottom: ${header.borderBottom};` : ''}
        ${header.paddingBottom ? `padding-bottom: ${header.paddingBottom};` : ''}
        ${header.marginBottom ? `margin-bottom: ${header.marginBottom};` : ''}
      }`;
    }
    
    if (style.sidebar) {
      const sidebar = style.sidebar;
      css += `
      .cert-sidebar {
        ${sidebar.position ? `position: ${sidebar.position};` : ''}
        ${sidebar.left ? `left: ${sidebar.left};` : ''}
        ${sidebar.top ? `top: ${sidebar.top};` : ''}
        ${sidebar.bottom ? `bottom: ${sidebar.bottom};` : ''}
        ${sidebar.width ? `width: ${sidebar.width};` : ''}
        ${sidebar.background ? `background: ${sidebar.background};` : ''}
        ${sidebar.borderTopLeftRadius ? `border-top-left-radius: ${sidebar.borderTopLeftRadius};` : ''}
        ${sidebar.borderBottomLeftRadius ? `border-bottom-left-radius: ${sidebar.borderBottomLeftRadius};` : ''}
      }`;
    }
    
    if (style.decorativeElements) {
      const deco = style.decorativeElements;
      if (deco.topLeft) {
        css += `
        .cert-deco-tl {
          ${deco.topLeft.position ? `position: ${deco.topLeft.position};` : ''}
          ${deco.topLeft.top ? `top: ${deco.topLeft.top};` : ''}
          ${deco.topLeft.left ? `left: ${deco.topLeft.left};` : ''}
          ${deco.topLeft.width ? `width: ${deco.topLeft.width};` : ''}
          ${deco.topLeft.height ? `height: ${deco.topLeft.height};` : ''}
          ${deco.topLeft.background ? `background: ${deco.topLeft.background};` : ''}
          ${deco.topLeft.borderRadius ? `border-radius: ${deco.topLeft.borderRadius};` : ''}
          ${deco.topLeft.opacity ? `opacity: ${deco.topLeft.opacity};` : ''}
        }`;
      }
      if (deco.bottomRight) {
        css += `
        .cert-deco-br {
          ${deco.bottomRight.position ? `position: ${deco.bottomRight.position};` : ''}
          ${deco.bottomRight.bottom ? `bottom: ${deco.bottomRight.bottom};` : ''}
          ${deco.bottomRight.right ? `right: ${deco.bottomRight.right};` : ''}
          ${deco.bottomRight.width ? `width: ${deco.bottomRight.width};` : ''}
          ${deco.bottomRight.height ? `height: ${deco.bottomRight.height};` : ''}
          ${deco.bottomRight.background ? `background: ${deco.bottomRight.background};` : ''}
          ${deco.bottomRight.borderRadius ? `border-radius: ${deco.bottomRight.borderRadius};` : ''}
          ${deco.bottomRight.opacity ? `opacity: ${deco.bottomRight.opacity};` : ''}
        }`;
      }
    }
    
    return css;
  };
  
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate</title>
    <style>
      ${createStyleSheet(template.style)}
    </style>
  </head>
  <body>
    <div class="certificate-container">
      ${template.style.accent ? '<div class="certificate-accent"></div>' : ''}
      ${template.style.crest ? '<div class="cert-crest">★</div>' : ''}
      ${template.style.sidebar ? '<div class="cert-sidebar"></div>' : ''}
      ${template.style.decorativeElements?.topLeft ? '<div class="cert-deco-tl"></div>' : ''}
      ${template.style.decorativeElements?.bottomRight ? '<div class="cert-deco-br"></div>' : ''}
      
      <div class="${template.style.header ? 'cert-header' : ''}">
        <h1 class="cert-title">Certificate of Achievement</h1>
        <p class="cert-subtitle">This is to certify that</p>
      </div>
      
      <h2 class="cert-recipient">${participant}</h2>
      
      <div class="cert-details">
        <p>has successfully completed</p>
        <p style="font-weight: bold; margin: 20px 0;">${event}</p>
        <p>Issued by ${organizationName}</p>
        <p>Date: ${issueDate}</p>
        ${signature ? `<p style="margin-top: 40px;">Signature: ${signature}</p>` : ''}
      </div>
      
      ${template.style.decorations?.seal ? '<div class="cert-seal">CERTIFIED</div>' : ''}
    </div>
  </body>
  </html>`;
  
  return html;
};

// Function to generate certificate content and styles separately for embedding
export const generateCertificateContent = (template, certificateData) => {
  const { participant, event, issueDate, signature, organizationName } = certificateData;
  
  const createStyleSheet = (style) => {
    let css = '';
    
    // Container styles
    css += `
    .certificate-container {
      ${style.container.background ? `background: ${style.container.background};` : ''}
      ${style.container.border ? `border: ${style.container.border};` : ''}
      ${style.container.borderRadius ? `border-radius: ${style.container.borderRadius};` : ''}
      ${style.container.boxShadow ? `box-shadow: ${style.container.boxShadow};` : ''}
      ${style.container.padding ? `padding: ${style.container.padding};` : ''}
      ${style.container.maxWidth ? `max-width: ${style.container.maxWidth};` : ''}
      ${style.container.minHeight ? `min-height: ${style.container.minHeight};` : ''}
      ${style.container.position ? `position: ${style.container.position};` : ''}
      margin: 0 auto;
      font-family: Arial, sans-serif;
    }`;
    
    // Inner border (for elegant-gold template)
    if (style.innerBorder) {
      css += `
      .certificate-inner-border {
        ${style.innerBorder.border ? `border: ${style.innerBorder.border};` : ''}
        ${style.innerBorder.borderStyle ? `border-style: ${style.innerBorder.borderStyle};` : ''}
        ${style.innerBorder.position ? `position: ${style.innerBorder.position};` : ''}
        ${style.innerBorder.top ? `top: ${style.innerBorder.top};` : ''}
        ${style.innerBorder.left ? `left: ${style.innerBorder.left};` : ''}
        ${style.innerBorder.right ? `right: ${style.innerBorder.right};` : ''}
        ${style.innerBorder.bottom ? `bottom: ${style.innerBorder.bottom};` : ''}
      }`;
    }
    
    // Decorations (seals, crests, etc.)
    if (style.decorations && style.decorations.seal) {
      const seal = style.decorations.seal;
      css += `
      .cert-seal {
        ${seal.position ? `position: ${seal.position};` : ''}
        ${seal.bottom ? `bottom: ${seal.bottom};` : ''}
        ${seal.right ? `right: ${seal.right};` : ''}
        ${seal.width ? `width: ${seal.width};` : ''}
        ${seal.height ? `height: ${seal.height};` : ''}
        ${seal.background ? `background: ${seal.background};` : ''}
        ${seal.borderRadius ? `border-radius: ${seal.borderRadius};` : ''}
        ${seal.display ? `display: ${seal.display};` : ''}
        ${seal.alignItems ? `align-items: ${seal.alignItems};` : ''}
        ${seal.justifyContent ? `justify-content: ${seal.justifyContent};` : ''}
        ${seal.color ? `color: ${seal.color};` : ''}
        ${seal.fontSize ? `font-size: ${seal.fontSize};` : ''}
        ${seal.fontWeight ? `font-weight: ${seal.fontWeight};` : ''}
      }`;
    }
    
    if (style.crest) {
      const crest = style.crest;
      css += `
      .cert-crest {
        ${crest.position ? `position: ${crest.position};` : ''}
        ${crest.top ? `top: ${crest.top};` : ''}
        ${crest.left ? `left: ${crest.left};` : ''}
        ${crest.right ? `right: ${crest.right};` : ''}
        ${crest.fontSize ? `font-size: ${crest.fontSize};` : ''}
        ${crest.color ? `color: ${crest.color};` : ''}
        ${crest.fontWeight ? `font-weight: ${crest.fontWeight};` : ''}
      }`;
    }
    
    if (style.header) {
      const header = style.header;
      css += `
      .cert-header {
        ${header.borderBottom ? `border-bottom: ${header.borderBottom};` : ''}
        ${header.paddingBottom ? `padding-bottom: ${header.paddingBottom};` : ''}
        ${header.marginBottom ? `margin-bottom: ${header.marginBottom};` : ''}
      }`;
    }
    
    if (style.sidebar) {
      const sidebar = style.sidebar;
      css += `
      .cert-sidebar {
        ${sidebar.position ? `position: ${sidebar.position};` : ''}
        ${sidebar.left ? `left: ${sidebar.left};` : ''}
        ${sidebar.top ? `top: ${sidebar.top};` : ''}
        ${sidebar.bottom ? `bottom: ${sidebar.bottom};` : ''}
        ${sidebar.width ? `width: ${sidebar.width};` : ''}
        ${sidebar.background ? `background: ${sidebar.background};` : ''}
        ${sidebar.borderTopLeftRadius ? `border-top-left-radius: ${sidebar.borderTopLeftRadius};` : ''}
        ${sidebar.borderBottomLeftRadius ? `border-bottom-left-radius: ${sidebar.borderBottomLeftRadius};` : ''}
      }`;
    }
    
    if (style.decorativeElements) {
      const deco = style.decorativeElements;
      if (deco.topLeft) {
        css += `
        .cert-deco-tl {
          ${deco.topLeft.position ? `position: ${deco.topLeft.position};` : ''}
          ${deco.topLeft.top ? `top: ${deco.topLeft.top};` : ''}
          ${deco.topLeft.left ? `left: ${deco.topLeft.left};` : ''}
          ${deco.topLeft.width ? `width: ${deco.topLeft.width};` : ''}
          ${deco.topLeft.height ? `height: ${deco.topLeft.height};` : ''}
          ${deco.topLeft.background ? `background: ${deco.topLeft.background};` : ''}
          ${deco.topLeft.borderRadius ? `border-radius: ${deco.topLeft.borderRadius};` : ''}
          ${deco.topLeft.opacity ? `opacity: ${deco.topLeft.opacity};` : ''}
        }`;
      }
      if (deco.bottomRight) {
        css += `
        .cert-deco-br {
          ${deco.bottomRight.position ? `position: ${deco.bottomRight.position};` : ''}
          ${deco.bottomRight.bottom ? `bottom: ${deco.bottomRight.bottom};` : ''}
          ${deco.bottomRight.right ? `right: ${deco.bottomRight.right};` : ''}
          ${deco.bottomRight.width ? `width: ${deco.bottomRight.width};` : ''}
          ${deco.bottomRight.height ? `height: ${deco.bottomRight.height};` : ''}
          ${deco.bottomRight.background ? `background: ${deco.bottomRight.background};` : ''}
          ${deco.bottomRight.borderRadius ? `border-radius: ${deco.bottomRight.borderRadius};` : ''}
          ${deco.bottomRight.opacity ? `opacity: ${deco.bottomRight.opacity};` : ''}
        }`;
      }
    }
    
    // Accent line (for modern-minimal)
    if (style.accent) {
      css += `
      .certificate-accent {
        ${style.accent.position ? `position: ${style.accent.position};` : ''}
        ${style.accent.top ? `top: ${style.accent.top};` : ''}
        ${style.accent.left ? `left: ${style.accent.left};` : ''}
        ${style.accent.right ? `right: ${style.accent.right};` : ''}
        ${style.accent.height ? `height: ${style.accent.height};` : ''}
        ${style.accent.background ? `background: ${style.accent.background};` : ''}
        ${style.accent.borderTopLeftRadius ? `border-top-left-radius: ${style.accent.borderTopLeftRadius};` : ''}
        ${style.accent.borderTopRightRadius ? `border-top-right-radius: ${style.accent.borderTopRightRadius};` : ''}
      }`;
    }
    
    // Typography styles
    const typo = style.typography;
    css += `
    .cert-title {
      ${typo.title.fontFamily ? `font-family: ${typo.title.fontFamily};` : ''}
      ${typo.title.fontSize ? `font-size: ${typo.title.fontSize};` : ''}
      ${typo.title.fontWeight ? `font-weight: ${typo.title.fontWeight};` : ''}
      ${typo.title.color ? `color: ${typo.title.color};` : ''}
      ${typo.title.textTransform ? `text-transform: ${typo.title.textTransform};` : ''}
      ${typo.title.letterSpacing ? `letter-spacing: ${typo.title.letterSpacing};` : ''}
      ${typo.title.marginBottom ? `margin-bottom: ${typo.title.marginBottom};` : ''}
      ${typo.title.textAlign ? `text-align: ${typo.title.textAlign};` : ''}
      ${typo.title.marginTop ? `margin-top: ${typo.title.marginTop};` : ''}
      ${typo.title.background ? `background: ${typo.title.background};` : ''}
      ${typo.title.backgroundClip ? `background-clip: ${typo.title.backgroundClip};` : ''}
      ${typo.title.WebkitBackgroundClip ? `-webkit-background-clip: ${typo.title.WebkitBackgroundClip};` : ''}
    }
    
    .cert-subtitle {
      ${typo.subtitle.fontFamily ? `font-family: ${typo.subtitle.fontFamily};` : ''}
      ${typo.subtitle.fontSize ? `font-size: ${typo.subtitle.fontSize};` : ''}
      ${typo.subtitle.color ? `color: ${typo.subtitle.color};` : ''}
      ${typo.subtitle.fontStyle ? `font-style: ${typo.subtitle.fontStyle};` : ''}
      ${typo.subtitle.marginBottom ? `margin-bottom: ${typo.subtitle.marginBottom};` : ''}
      ${typo.subtitle.fontWeight ? `font-weight: ${typo.subtitle.fontWeight};` : ''}
      ${typo.subtitle.textAlign ? `text-align: ${typo.subtitle.textAlign};` : ''}
    }
    
    .cert-recipient {
      ${typo.recipient.fontFamily ? `font-family: ${typo.recipient.fontFamily};` : ''}
      ${typo.recipient.fontSize ? `font-size: ${typo.recipient.fontSize};` : ''}
      ${typo.recipient.fontWeight ? `font-weight: ${typo.recipient.fontWeight};` : ''}
      ${typo.recipient.color ? `color: ${typo.recipient.color};` : ''}
      ${typo.recipient.marginBottom ? `margin-bottom: ${typo.recipient.marginBottom};` : ''}
      ${typo.recipient.textAlign ? `text-align: ${typo.recipient.textAlign};` : ''}
      ${typo.recipient.marginTop ? `margin-top: ${typo.recipient.marginTop};` : ''}
    }
    
    .cert-details {
      ${typo.details.fontFamily ? `font-family: ${typo.details.fontFamily};` : ''}
      ${typo.details.fontSize ? `font-size: ${typo.details.fontSize};` : ''}
      ${typo.details.color ? `color: ${typo.details.color};` : ''}
      ${typo.details.lineHeight ? `line-height: ${typo.details.lineHeight};` : ''}
      ${typo.details.textAlign ? `text-align: ${typo.details.textAlign};` : ''}
      ${typo.details.marginTop ? `margin-top: ${typo.details.marginTop};` : ''}
    }`;
    
    return css;
  };
  
  const styles = createStyleSheet(template.style);
  
  const content = `
    <div class="certificate-container">
      ${template.style.innerBorder ? '<div class="certificate-inner-border"></div>' : ''}
      ${template.style.accent ? '<div class="certificate-accent"></div>' : ''}
      ${template.style.crest ? '<div class="cert-crest">★</div>' : ''}
      ${template.style.sidebar ? '<div class="cert-sidebar"></div>' : ''}
      ${template.style.decorativeElements?.topLeft ? '<div class="cert-deco-tl"></div>' : ''}
      ${template.style.decorativeElements?.bottomRight ? '<div class="cert-deco-br"></div>' : ''}
      
      <div class="${template.style.header ? 'cert-header' : ''}">
        <h1 class="cert-title">Certificate of Achievement</h1>
        <p class="cert-subtitle">This is to certify that</p>
      </div>
      
      <h2 class="cert-recipient">${participant}</h2>
      
      <div class="cert-details">
        <p>has successfully completed</p>
        <p style="font-weight: bold; margin: 20px 0;">${event}</p>
        <p>Issued by ${organizationName}</p>
        <p>Date: ${issueDate}</p>
        ${signature ? `<p style="margin-top: 40px;">Signature: ${signature}</p>` : ''}
      </div>
      
      ${template.style.decorations?.seal ? '<div class="cert-seal">CERTIFIED</div>' : ''}
    </div>
  `;
  
  return { styles, content };
};