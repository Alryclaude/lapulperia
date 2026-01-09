import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Send, MessageSquare } from 'lucide-react';
import { reviewApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const ReviewForm = ({ pulperiaId, existingReview = null, onSuccess }) => {
    const { isAuthenticated, user } = useAuthStore();
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState(existingReview?.comment || '');

    const createMutation = useMutation({
        mutationFn: (data) => reviewApi.create(data),
        onSuccess: () => {
            toast.success('Reseña publicada');
            queryClient.invalidateQueries(['pulperia', pulperiaId]);
            setRating(0);
            setComment('');
            onSuccess?.();
        },
        onError: (error) => {
            const message = error.response?.data?.error?.message || 'Error al publicar reseña';
            toast.error(message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => reviewApi.update(id, data),
        onSuccess: () => {
            toast.success('Reseña actualizada');
            queryClient.invalidateQueries(['pulperia', pulperiaId]);
            onSuccess?.();
        },
        onError: () => toast.error('Error al actualizar reseña'),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Selecciona una calificación');
            return;
        }

        if (existingReview) {
            updateMutation.mutate({ id: existingReview.id, data: { rating, comment } });
        } else {
            createMutation.mutate({ pulperiaId, rating, comment });
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5 text-center">
                <p className="text-gray-400">Inicia sesión para dejar una reseña</p>
            </div>
        );
    }

    // Check if user is the pulpería owner
    if (user?.role === 'PULPERIA') {
        return null;
    }

    const ratingLabels = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-100/60 backdrop-blur-sm rounded-2xl border border-white/5 p-5"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white">
                    {existingReview ? 'Editar tu reseña' : 'Deja tu reseña'}
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Star Rating */}
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                            key={star}
                            type="button"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1"
                        >
                            <Star
                                className={`w-8 h-8 transition-colors ${
                                    star <= (hoverRating || rating)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-600'
                                }`}
                            />
                        </motion.button>
                    ))}
                    {rating > 0 && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="ml-3 text-sm font-medium text-yellow-400"
                        >
                            {ratingLabels[rating]}
                        </motion.span>
                    )}
                </div>

                {/* Comment */}
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Escribe tu experiencia... (opcional)"
                    className="w-full px-4 py-3 bg-dark-200/50 border border-white/5 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all min-h-[80px] resize-none"
                />

                {/* Submit */}
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending || rating === 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            {existingReview ? 'Actualizar Reseña' : 'Publicar Reseña'}
                        </>
                    )}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default ReviewForm;
