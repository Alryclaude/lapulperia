/**
 * Async Handler Middleware
 * Wraps async route handlers to automatically catch errors
 * and pass them to the error handler middleware.
 *
 * Eliminates the need for try/catch blocks in every route.
 *
 * @example
 * // Before:
 * router.get('/', async (req, res) => {
 *   try {
 *     const data = await getData();
 *     res.json(data);
 *   } catch (error) {
 *     console.error('Error:', error);
 *     res.status(500).json({ error: { message: 'Error' } });
 *   }
 * });
 *
 * // After:
 * router.get('/', asyncHandler(async (req, res) => {
 *   const data = await getData();
 *   res.json(data);
 * }));
 */

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
