/**
 * useApiMutation - Custom hook for API mutations with automatic toast and cache invalidation
 *
 * Eliminates repetitive useMutation boilerplate across the codebase.
 *
 * @example
 * // Before (repeated in every component):
 * const updateMutation = useMutation({
 *   mutationFn: (data) => pulperiaApi.update(data),
 *   onSuccess: () => {
 *     toast.success('Cambios guardados');
 *     queryClient.invalidateQueries(['my-pulperia']);
 *   },
 *   onError: (err) => toast.error(err.response?.data?.error?.message || 'Error'),
 * });
 *
 * // After (using this hook):
 * const updateMutation = useApiMutation(
 *   (data) => pulperiaApi.update(data),
 *   {
 *     successMessage: 'Cambios guardados',
 *     invalidateKeys: [['my-pulperia']],
 *   }
 * );
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

/**
 * @typedef {Object} UseApiMutationOptions
 * @property {string} [successMessage] - Toast message on success
 * @property {string} [errorMessage] - Default error message if API doesn't provide one
 * @property {Array<string|string[]>} [invalidateKeys] - Query keys to invalidate on success
 * @property {Function} [onSuccess] - Additional callback on success
 * @property {Function} [onError] - Additional callback on error
 * @property {boolean} [showSuccessToast=true] - Whether to show success toast
 * @property {boolean} [showErrorToast=true] - Whether to show error toast
 */

/**
 * Custom hook for API mutations with automatic toast notifications and cache invalidation
 *
 * @param {Function} mutationFn - The async function to execute
 * @param {UseApiMutationOptions} options - Configuration options
 * @returns {import('@tanstack/react-query').UseMutationResult}
 */
export function useApiMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient();

  const {
    successMessage,
    errorMessage = 'Ha ocurrido un error',
    invalidateKeys = [],
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Show success toast
      if (successMessage && showSuccessToast) {
        toast.success(successMessage);
      }

      // Invalidate specified query keys
      if (invalidateKeys.length > 0) {
        invalidateKeys.forEach((key) => {
          const queryKey = Array.isArray(key) ? key : [key];
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // Call custom onSuccess handler
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Extract error message from API response
      const message =
        error?.response?.data?.error?.message ||
        error?.message ||
        errorMessage;

      // Show error toast
      if (showErrorToast) {
        toast.error(message);
      }

      // Call custom onError handler
      onError?.(error, variables, context);
    },
  });
}

/**
 * Preset for create mutations
 */
export function useCreateMutation(mutationFn, options = {}) {
  return useApiMutation(mutationFn, {
    successMessage: options.successMessage || 'Creado exitosamente',
    ...options,
  });
}

/**
 * Preset for update mutations
 */
export function useUpdateMutation(mutationFn, options = {}) {
  return useApiMutation(mutationFn, {
    successMessage: options.successMessage || 'Actualizado exitosamente',
    ...options,
  });
}

/**
 * Preset for delete mutations with confirmation
 */
export function useDeleteMutation(mutationFn, options = {}) {
  return useApiMutation(mutationFn, {
    successMessage: options.successMessage || 'Eliminado exitosamente',
    ...options,
  });
}

/**
 * Preset for toggle mutations (favorite, active, etc.)
 */
export function useToggleMutation(mutationFn, options = {}) {
  return useApiMutation(mutationFn, {
    showSuccessToast: false, // Toggles usually don't need toast
    ...options,
  });
}

export default useApiMutation;
