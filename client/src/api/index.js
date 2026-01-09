// Re-export all APIs for easy imports
// Usage: import { pulperiaApi, productApi } from '@/api'

export { default as api } from './client';
export { userApi } from './auth';
export { pulperiaApi } from './pulperia';
export { productApi } from './products';
export { orderApi } from './orders';
export { jobApi } from './jobs';
export { reviewApi } from './reviews';
export { serviceApi } from './services';
export { statsApi } from './stats';
