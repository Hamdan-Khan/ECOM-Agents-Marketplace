"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

interface Review {
  id: string;
  rating: number;
  comment: string;
  agentId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
  };
  created_at: Date;
  updated_at: Date;
}

interface Props {
  agentId: string;
}

export default function ReviewSection({ agentId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [agentId]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const response = await apiGet<Review[]>("/reviews");
      // Filter reviews for this agent
      const agentReviews = response.filter((review) => review.agentId === agentId);
      setReviews(agentReviews);
    } catch (err: any) {
      setError(err?.message || "Failed to load reviews");
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a review",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (editingReview) {
        // Update existing review
        await apiPatch(`/reviews/${editingReview.id}`, {
          rating,
          comment,
        });
      } else {
        // Create new review
        await apiPost("/reviews", {
          rating,
          comment,
          agentId,
          userId: user.id,
        });
      }

      // Reset form
      setRating(0);
      setComment("");
      setEditingReview(null);
      
      // Refresh reviews
      await fetchReviews();

      toast({
        title: "Success",
        description: editingReview ? "Review updated" : "Review submitted",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setRating(review.rating);
    setComment(review.comment);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await apiDelete(`/reviews/${reviewId}`);
      await fetchReviews();
      toast({
        title: "Success",
        description: "Review deleted",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingReview(null);
    setRating(0);
    setComment("");
  };

  return (
    <div className="mt-8 space-y-8">
      {/* Review Form */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingReview ? "Edit Review" : "Write a Review"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Star Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className={`w-6 h-6 cursor-pointer ${
                      star <= (hoveredStar || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Comment */}
              <Textarea
                placeholder="Write your review..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />

              {/* Submit Button */}
              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting
                    ? "Submitting..."
                    : editingReview
                    ? "Update Review"
                    : "Submit Review"}
                </Button>
                {editingReview && (
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading reviews...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              {user ? "Be the first to review this agent!" : "No reviews yet"}
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="flex gap-4 pb-4 border-b last:border-0">
                  <Avatar>
                    <AvatarFallback>
                      {review.user?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{review.user?.name || "Anonymous"}</div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {/* Edit/Delete buttons for review owner */}
                      {user?.id === review.userId && !editingReview && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(review)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(review.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-gray-600">{review.comment}</p>
                    <div className="mt-1 text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Login prompt for non-authenticated users */}
          {!user && !isLoading && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-2">
                Want to write a review?
              </p>
              <Button asChild variant="outline">
                <a href="/login">Log in</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
