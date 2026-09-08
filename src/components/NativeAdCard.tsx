import React from "react";
import { Sparkles, ExternalLink, ShoppingBag, Info } from "lucide-react";

interface NativeAdCardProps {
  variant?: "in-feed" | "detail-bottom";
  className?: string;
}

export const NativeAdCard: React.FC<NativeAdCardProps> = ({
  variant = "in-feed",
  className = "",
}) => {
  // Sample native sponsors for rich culinary context
  const sampleAd = {
    sponsorName: "Oishii Select 公式",
    badge: "PR / スポンサー",
    title: "【産地直送】旬の有機野菜＆厳選ミールキットお試しセット",
    description: "プロの料理人が認めた新鮮野菜と時短調理キットが初回限定70%OFF！忙しい平日の献立づくりをスマートにサポートします。",
    ctaText: "詳しく見る",
    tags: ["食材宅配", "初回お試し", "時短ミールキット"],
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
    url: "#ad-sponsor-link",
  };

  if (variant === "detail-bottom") {
    return (
      <div
        id="native-ad-detail-bottom"
        className={`bg-gradient-to-br from-amber-50/60 via-stone-50 to-emerald-50/50 rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs relative overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 uppercase">
              {sampleAd.badge}
            </span>
            <span className="text-xs font-bold text-stone-500">{sampleAd.sponsorName}</span>
          </div>
          <span className="text-[11px] text-stone-600 flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>広告</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <img
            src={sampleAd.imageUrl}
            alt="スポンサー広告"
            className="w-full sm:w-28 h-28 object-cover rounded-2xl border border-stone-200/80 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 space-y-1.5 text-center sm:text-left">
            <h4 className="font-extrabold text-stone-900 text-sm sm:text-base leading-snug">
              {sampleAd.title}
            </h4>
            <p className="text-xs text-stone-600 font-medium line-clamp-2">
              {sampleAd.description}
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-1">
              {sampleAd.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-semibold bg-white text-stone-600 px-2 py-0.5 rounded-md border border-stone-200/60">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <a
            href={sampleAd.url}
            onClick={(e) => e.preventDefault()}
            className="w-full sm:w-auto px-5 py-2.5 bg-stone-900 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95"
          >
            <span>{sampleAd.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // In-Feed Native Ad (fits seamlessly inside recipe list grid)
  return (
    <div
      id="native-ad-in-feed"
      className={`group bg-gradient-to-br from-amber-50/70 via-white to-stone-50 rounded-3xl border-2 border-dashed border-amber-300/80 hover:border-amber-400 p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${className}`}
    >
      <div className="space-y-4">
        {/* Header PR Badge & Sponsor */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300 shadow-2xs uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>{sampleAd.badge}</span>
            </span>
            <span className="text-xs font-extrabold text-stone-600">
              {sampleAd.sponsorName}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full">
            <span>プロのおすすめ</span>
          </div>
        </div>

        {/* Ad Title & Body */}
        <div className="space-y-1.5">
          <h3 className="font-black text-stone-900 text-base sm:text-lg group-hover:text-amber-800 transition-colors leading-snug">
            {sampleAd.title}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 font-medium line-clamp-3 leading-relaxed">
            {sampleAd.description}
          </p>
        </div>

        {/* Visual Banner Preview */}
        <div className="relative rounded-2xl overflow-hidden border border-stone-200/80 h-28 sm:h-32 bg-stone-100">
          <img
            src={sampleAd.imageUrl}
            alt="スポンサー広告"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent flex items-end p-3">
            <div className="flex flex-wrap gap-1.5">
              {sampleAd.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-bold bg-white/95 text-stone-800 px-2 py-0.5 rounded-md shadow-2xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Action Bar */}
      <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-bold">
          <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
          <span>提携スポンサー情報</span>
        </div>

        <a
          href={sampleAd.url}
          onClick={(e) => e.preventDefault()}
          id="native-ad-cta-btn"
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
        >
          <span>{sampleAd.ctaText}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
