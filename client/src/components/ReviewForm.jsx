import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Send } from 'lucide-react';
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
            <div className="card p-5 text-center">
                <p className="text-gray-500">Inicia sesión para dejar una reseña</p>
            </div>
        );
    }

    // Check if user is the pulpería owner
    if (user?.role === 'PULPERIA') {
        return null;
    }

    return (
        <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">
                {existingReview ? 'Editar tu reseña' : 'Deja tu reseña'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Star Rating */}
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-110"
                        >
                            <Star
                                className={`w-8 h-8 transition-colors ${star <= (hoverRating || rating)
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-gray-300'
                                    }`}
                            />
                        </button>
                    ))}
                    <span className="ml-2 text-gray-600">
                        {rating > 0 && ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'][rating]}
                    </span>
                </div>

                {/* Comment */}
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Escribe tu experiencia... (opcional)"
                    className="input min-h-[80px]"
                />

                {/* Submit */}
                <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending || rating === 0}
                    className="btn-primary w-full"
                >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            {existingReview ? 'Actualizar Reseña' : 'Publicar Reseña'}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
