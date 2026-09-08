import React, { useState } from "react";
import { ShieldCheck, FileText, HelpCircle, X, CheckCircle2, Lock, Camera, AlertTriangle } from "lucide-react";

interface PrivacyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "privacy" | "terms" | "support";
}

export const PrivacyTermsModal: React.FC<PrivacyTermsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "privacy",
}) => {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms" | "support">(defaultTab);

  if (!isOpen) return null;

  return (
    <div
      id="privacy-terms-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="privacy-terms-modal-container"
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-stone-900">
                安心・安全への取り組み & 規約
              </h2>
              <p className="text-[11px] text-stone-500">
                食材カメラ献立ナビ 公式ガイドライン
              </p>
            </div>
          </div>
          <button
            type="button"
            id="privacy-terms-modal-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-2 bg-stone-100/70 border-b border-stone-200/80 flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("privacy")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "privacy"
                ? "bg-white text-emerald-800 shadow-xs border border-stone-200/80"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/50"
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>プライバシー方針</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("terms")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "terms"
                ? "bg-white text-emerald-800 shadow-xs border border-stone-200/80"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/50"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>利用規約・免責事項</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("support")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "support"
                ? "bg-white text-emerald-800 shadow-xs border border-stone-200/80"
                : "text-stone-600 hover:text-stone-900 hover:bg-white/50"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>サポート・運営</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed max-h-[60vh]">
          {/* TAB 1: Privacy Policy */}
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-emerald-900 text-xs sm:text-sm">
                    個人情報の収集は一切行いません
                  </h4>
                  <p className="text-[11px] sm:text-xs text-emerald-800">
                    本アプリはユーザー登録・ログイン不要で、すべての機能を匿名かつ安全にご利用いただけます。
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  1. カメラ・写真データの取り扱い
                </h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  本アプリのカメラ機能または写真アルバムからアップロードされた画像は、スーパーの食材、値札シール、パッケージ、レシートから食材名をAI解析・レシピ提案する目的のみに一時的に使用されます。
                  画像がサーバー上に永続保存されたり、第三者への開示・広告追跡に利用されることは一切ありません。
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  2. 端末内（ローカル）でのデータ保持
                </h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  「お気に入り保存レシピ」や「最近の閲覧履歴」などのデータは、すべてお客様がお使いの端末内（ローカルストレージ）にのみ安全に保存されます。外部サーバーに個人履歴が送信・蓄積されることはありません。
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  3. 広告配信について
                </h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  本アプリでは、無料での継続的なサービス提供のため、食材・キッチン関連のスポンサー広告を表示する場合があります。これらの広告表示において、お客様の個人を特定できる情報は収集・トラッキングされません。
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Terms of Service & Disclaimer */}
          {activeTab === "terms" && (
            <div className="space-y-4">
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-amber-900 text-xs sm:text-sm">
                    調理・健康に関する重要なお知らせ
                  </h4>
                  <p className="text-[11px] sm:text-xs text-amber-800">
                    AIの提案する献立は目安です。アレルギーや消費期限はお客様ご自身で十分にご確認ください。
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-stone-900 text-sm">
                  1. レシピ情報・カロリー表示の免責
                </h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  本アプリが提案するレシピの材料、調味料の分量、調理手順、調理目安時間、および1人前あたりの推定カロリー・栄養バランス表示は、一般的な調理データとAI生成技術に基づく推定参考値です。実際の食材の品種や加熱機器の仕様によって差が生じることがあります。
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-stone-900 text-sm">
                  2. アレルギー及び食の安全について
                </h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  食物アレルギーをお持ちの方、小さなお子様、ご高齢者、妊娠中の方は、食材の原材料表示やアレルゲン情報を必ずご確認の上でご調理・ご飲食ください。また、生肉・生魚・卵などの生鮮食品は十分な衛生管理と中心部までの加熱調理を行ってください。
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-stone-900 text-sm">
                  3. サービスの変更・中断
                </h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  アプリの品質向上や定期メンテナンスのため、事前の予告なく仕様の変更や一時的な提供中断を行う場合があります。
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Support & Information */}
          {activeTab === "support" && (
            <div className="space-y-4">
              <div className="space-y-2 bg-stone-50 rounded-2xl p-4 border border-stone-200/80">
                <h3 className="font-extrabold text-stone-900 text-sm">
                  アプリ仕様・サポート窓口
                </h3>
                <div className="space-y-1.5 text-xs text-stone-600 pt-1">
                  <p className="flex justify-between py-1 border-b border-stone-200/60">
                    <span className="text-stone-500 font-medium">アプリケーション名</span>
                    <span className="font-bold text-stone-800">食材カメラ献立ナビ</span>
                  </p>
                  <p className="flex justify-between py-1 border-b border-stone-200/60">
                    <span className="text-stone-500 font-medium">対応端末</span>
                    <span className="font-bold text-stone-800">iOS (iPhone) / Web</span>
                  </p>
                  <p className="flex justify-between py-1 border-b border-stone-200/60">
                    <span className="text-stone-500 font-medium">推奨環境</span>
                    <span className="font-bold text-stone-800">iPhone SE (第2世代以降) / iOS 15.0+</span>
                  </p>
                  <p className="flex justify-between py-1 border-b border-stone-200/60">
                    <span className="text-stone-500 font-medium">バージョン</span>
                    <span className="font-bold text-stone-800">1.0.0 (Build 2026.09)</span>
                  </p>
                  <p className="flex justify-between py-1">
                    <span className="text-stone-500 font-medium">利用料金</span>
                    <span className="font-bold text-emerald-700">完全無料</span>
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-2xl p-4 space-y-1.5">
                <h4 className="font-extrabold text-stone-900 text-xs">
                  ご意見・不具合のご報告について
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  皆様の日々の献立作りをより快適にするため、継続的な機能改善に努めております。機能に関するご要望やご不明な点がございましたら、App StoreのサポートURLまたはアプリ内よりお気軽にお寄せください。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-end">
          <button
            type="button"
            id="privacy-terms-modal-confirm-btn"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors text-center"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
