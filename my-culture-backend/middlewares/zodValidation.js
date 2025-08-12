import { z } from 'zod';

/**
 * Zod validation middleware factory
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {string} source - Where to get data from ('body', 'query', 'params')
 */
export const validateZod = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      let dataToValidate;
      
      switch (source) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        default:
          dataToValidate = req.body;
      }

      // Parse and validate data with Zod
      const validatedData = schema.parse(dataToValidate);
      
      // Replace original data with validated/transformed data
      if (source === 'body') {
        req.body = validatedData;
      } else if (source === 'query') {
        req.query = validatedData;
      } else if (source === 'params') {
        req.params = validatedData;
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors for better readability
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          error: 'Validation failed',
          details: formattedErrors
        });
      }
      
      // Handle other types of errors
      return res.status(500).json({
        error: 'Internal validation error'
      });
    }
  };
};

/**
 * Validate multiple sources at once
 * @param {Object} schemas - Object containing schemas for different sources
 * @param {z.ZodSchema} schemas.body - Schema for request body
 * @param {z.ZodSchema} schemas.query - Schema for query parameters
 * @param {z.ZodSchema} schemas.params - Schema for route parameters
 */
export const validateMultiple = (schemas) => {
  return (req, res, next) => {
    try {
      const errors = [];

      // Validate each source if schema is provided
      if (schemas.body) {
        try {
          req.body = schemas.body.parse(req.body);
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push(...error.errors.map(err => ({
              source: 'body',
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            })));
          }
        }
      }

      if (schemas.query) {
        try {
          req.query = schemas.query.parse(req.query);
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push(...error.errors.map(err => ({
              source: 'query',
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            })));
          }
        }
      }

      if (schemas.params) {
        try {
          req.params = schemas.params.parse(req.params);
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push(...error.errors.map(err => ({
              source: 'params',
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            })));
          }
        }
      }

      // If there are validation errors, return them
      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Internal validation error'
      });
    }
  };
};

/**
 * Validate file uploads with Zod
 * @param {z.ZodSchema} schema - Schema for file validation
 */
export const validateFile = (schema) => {
  return (req, res, next) => {
    try {
      if (!req.file && !req.files) {
        return res.status(400).json({
          error: 'No file uploaded'
        });
      }

      const files = req.files || [req.file];
      const validationErrors = [];

      files.forEach((file, index) => {
        try {
          schema.parse(file);
        } catch (error) {
          if (error instanceof z.ZodError) {
            validationErrors.push(...error.errors.map(err => ({
              file: index,
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            })));
          }
        }
      });

      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: 'File validation failed',
          details: validationErrors
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Internal file validation error'
      });
    }
  };
};

/**
 * Optional validation - only validate if data is present
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {string} source - Where to get data from ('body', 'query', 'params')
 */
export const validateOptional = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      let dataToValidate;
      
      switch (source) {
        case 'body':
          dataToValidate = req.body;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'params':
          dataToValidate = req.params;
          break;
        default:
          dataToValidate = req.body;
      }

      // Only validate if data exists
      if (Object.keys(dataToValidate).length === 0) {
        return next();
      }

      const validatedData = schema.parse(dataToValidate);
      
      if (source === 'body') {
        req.body = validatedData;
      } else if (source === 'query') {
        req.query = validatedData;
      } else if (source === 'params') {
        req.params = validatedData;
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          error: 'Validation failed',
          details: formattedErrors
        });
      }
      
      return res.status(500).json({
        error: 'Internal validation error'
      });
    }
  };
};