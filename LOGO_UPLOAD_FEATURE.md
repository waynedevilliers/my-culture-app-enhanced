# Logo Upload Feature Implementation

## Overview
Added image/logo upload functionality to the "mitmachen" (join us) form, allowing organizations to upload their logos when applying to join the platform.

## Backend Changes

### 1. Organization Model (`my-culture-backend/models/Organization.js`)
- Added `logo` field as optional URL string with validation
- Validates logo URLs when provided

### 2. Organization Controller (`my-culture-backend/controllers/organization.js`)
- Updated `applyForOrganization` function to handle logo uploads
- Extracts logo URL from Cloudinary upload middleware
- Stores logo URL in organization record

### 3. Organization Router (`my-culture-backend/routes/organizationRouter.js`)
- Added file upload middleware (`fileUploader.single('logo')`)
- Added Cloudinary upload middleware (`cloudUploader`)
- Updated `/apply` route to handle multipart form data

### 4. Cloud Uploader Middleware (`my-culture-backend/middlewares/cloudUploader.js`)
- Modified to handle optional file uploads (no error if no file uploaded)
- Added fallback naming for uploads when no name is provided

## Frontend Changes

### 1. JoinUs Component (`my-culture-frontend/src/pages/JoinUs.jsx`)

#### State Management
- Added `logo` state for file storage
- Added `logoPreview` state for image preview

#### File Handling
- Added `handleLogoChange` function with validation:
  - File type validation (JPEG, JPG, PNG, WebP)
  - File size validation (max 10MB)
  - Image preview generation
- Added `removeLogo` function to clear selected logo

#### Form Submission
- Updated to use FormData for multipart form data
- Includes logo file when present
- Proper Content-Type header for file uploads

#### UI Components
- Added logo upload section with drag-and-drop style interface
- Image preview with remove option
- File validation feedback
- Responsive design matching existing form styling

## Features

### Core Functionality
- **Optional Upload**: Logo upload is completely optional
- **File Validation**: Validates file type and size before upload
- **Preview**: Shows image preview before submission
- **Error Handling**: User-friendly error messages for invalid files
- **Cloudinary Integration**: Uploaded images are stored in Cloudinary

### User Experience
- **Drag-and-Drop Style**: Modern file upload interface
- **Visual Feedback**: Preview and validation messages
- **Form Reset**: Logo is cleared when form is reset after successful submission
- **Responsive Design**: Works on all device sizes

### Technical Details
- **File Types**: JPEG, JPG, PNG, WebP
- **File Size Limit**: 10MB maximum
- **Storage**: Cloudinary cloud storage
- **Validation**: Client-side and server-side validation
- **Error Handling**: Graceful error handling for upload failures

## Integration
The implementation follows existing patterns in the codebase:
- Uses existing file upload infrastructure
- Integrates with Cloudinary service
- Follows form validation patterns
- Matches UI/UX design system
- Maintains internationalization support structure

## Testing
- File upload validation works correctly
- Preview functionality displays images properly
- Form submission includes logo data
- Error handling provides user feedback
- Form reset clears logo state

## Future Enhancements
- Add drag-and-drop functionality
- Add image cropping/resizing
- Add multiple image upload support
- Add image optimization
- Add progress indicators for large uploads