# Changelog

## [Unreleased] - 2024-01-XX

### Added
- Comprehensive German translations for certificate functionality
- Complete internationalization support for certificate overview and creation
- Translation keys for all certificate-related UI elements, messages, and forms

### Changed
- Updated CertificateList component to use translation hooks
- Updated NewCertificate component to use translation hooks
- All hardcoded English strings in certificate components now use i18n
- Error messages and success notifications now support multiple languages

### Technical Details
- Added 35+ new translation keys under `admin.certificates` section
- Implemented `useTranslation` hook in certificate components
- Maintained existing translation structure and naming conventions
- All certificate UI elements now support German/English language switching

### Files Modified
- `/src/i18n/locales/de.json` - Added German certificate translations
- `/src/i18n/locales/en.json` - Added English certificate translations  
- `/src/components/admin/CertificateList.jsx` - Implemented translation hooks
- `/src/components/admin/NewCertificate.jsx` - Implemented translation hooks

### Benefits
- German users can now use certificate functionality in their native language
- Professional, contextually appropriate German translations
- Consistent user experience across all certificate features
- Framework ready for additional language support