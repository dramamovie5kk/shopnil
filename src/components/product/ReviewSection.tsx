import { useState } from "react";
import { Star, ChevronDown, ChevronUp, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useProductReviews, useSubmitReview } from "@/hooks/useProductReviews";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReviewSectionProps {
  productId: string;
  productName: string;
  totalReviews: number;
  averageRating: number;
  embedded?: boolean;
}

const ReviewSection = ({ productId, productName, totalReviews, averageRating, embedded = false }: ReviewSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [reviewText, setReviewText] = useState("");
  
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { data: reviews = [], isLoading } = useProductReviews(productId);
  const submitReview = useSubmitReview();

  const approvedCount = reviews.filter(r => r.is_approved).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error(t('review.name_required'));
      return;
    }

    try {
      await submitReview.mutateAsync({
        product_id: productId,
        customer_name: name.trim(),
        rating,
        review_text: reviewText.trim() || undefined,
      });
      
      toast.success(t('review.success'));
      setShowForm(false);
      setName("");
      setReviewText("");
      setRating(5);
    } catch (error: any) {
      toast.error(error.message || t('review.error'));
    }
  };

  const body = (
    <div className="space-y-4">
          {/* Rating Summary */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-muted-foreground">
              {averageRating.toFixed(1)} ({approvedCount}{language === 'en' ? ' reviews' : 'টি রিভিউ'})
            </span>
          </div>

          {/* Reviews List */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{review.customer_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), "dd MMM yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  {review.review_text && (
                    <p className="text-sm text-muted-foreground">{review.review_text}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">{t('review.no_reviews')}</p>
          )}

          {/* Add Review Button/Form */}
          {!showForm ? (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowForm(true)}
            >
              {t('review.write')}
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4 bg-secondary/30">
              <h4 className="font-medium">{t('review.write_title')}</h4>
              
              {/* Star Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('review.rating')}</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-muted text-muted"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">{t('review.your_name')}</label>
                <Input
                  placeholder={t('review.name_placeholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">{t('review.your_opinion')}</label>
                <Textarea
                  placeholder={t('review.opinion_placeholder')}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary"
                  disabled={submitReview.isPending}
                >
                  {submitReview.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {t('review.submit')}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                {t('review.approval_note')}
              </p>
            </form>
          )}
    </div>
  );

  if (embedded) return body;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-t">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-4 text-left">
        <span className="flex items-center gap-2 text-primary font-medium">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {t('review.reviews')} ({approvedCount})
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4">
        {body}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ReviewSection;