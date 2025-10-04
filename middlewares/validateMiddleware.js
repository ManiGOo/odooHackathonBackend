import Joi from "joi";

/**
 * validate(schema, property = 'body')
 * - schema: Joi schema object
 * - property: 'body' | 'params' | 'query'
 *
 * On success: replaces req[property] with the validated & cleaned value.
 * On fail: returns 400 with details.
 */
export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const data = req[property] || {};
    const { error, value } = schema.validate(data, {
      abortEarly: false,   // return all errors
      stripUnknown: true,  // remove unknown props
      convert: true,       // coerce types (e.g., "123" -> 123)
    });

    if (error) {
      const details = error.details.map((d) => ({
        message: d.message,
        path: d.path,
      }));
      return res.status(400).json({
        error: "Validation error",
        details,
      });
    }

    // replace with validated value (useful for sanitized input)
    req[property] = value;
    next();
  };
};
