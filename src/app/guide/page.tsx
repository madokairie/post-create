'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function GuidePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E8E0D5]" style={{ fontFamily: "'Georgia', 'Noto Serif JP', serif" }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-[#6A6058] hover:text-[#A09080] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          戻る
        </button>

        <div className="text-[10px] text-[#C8A96E] tracking-[4px] mb-2 uppercase">User Guide</div>
        <h1 className="text-xl font-normal mb-8">使い方ガイド</h1>

        {/* 全体の流れ */}
        <Section title="全体の流れ">
          <StepList steps={[
            { num: '1', title: 'コンセプトシートを読み込む', desc: 'コンセプト設計ツールで📋ボタンを押してHTMLをコピーし、「新規プロジェクト」で貼り付けます。使用する媒体を選択してプロジェクトを作成。' },
            { num: '2', title: '投稿カレンダーを作る', desc: 'プロジェクト画面で「AIでカレンダー生成」をクリック。1週間分の投稿スケジュールが自動生成されます。手動で追加・調整も可能。' },
            { num: '3', title: 'AIと壁打ちして投稿を作る', desc: 'カレンダーのスロットをクリック、またはヘッダーの「投稿作成」ボタンから。AIがコンセプトシートを踏まえた初稿を提案するので、フィードバックして仕上げます。' },
            { num: '4', title: 'コピーして投稿する', desc: '確定した投稿はコピーボタンでクリップボードにコピー。各SNSに貼り付けて投稿します。投稿後はステータスを「投稿済み」に変更。' },
          ]} />
        </Section>

        {/* 媒体別ガイド */}
        <Section title="対応媒体">
          <div className="grid grid-cols-2 gap-2">
            <MediaCard icon="📸" name="Instagram フィード" desc="300-500字。共感→展開→CTAの流れ。ハッシュタグ付き。" />
            <MediaCard icon="🎬" name="Instagram リール" desc="シーン構成+テロップ+キャプション。冒頭3秒が命。" />
            <MediaCard icon="𝕏" name="X 短文" desc="140字以内。ワンパンチで刺す。余韻を残す。" />
            <MediaCard icon="𝕏" name="X 長文" desc="500-1000字。ストーリー型・教育型。最後にCTA。" />
            <MediaCard icon="▶️" name="YouTube" desc="構成+トーク台本。冒頭30秒で引き込む。" />
            <MediaCard icon="🧵" name="Threads" desc="本音トーン。カジュアルで独自の切り口。" />
            <MediaCard icon="✉️" name="メール" desc="1000字程度。教育+価値提供+行動喚起。件名が重要。" />
            <MediaCard icon="💬" name="LINE" desc="短文クリティカル。1メッセージ=1アクション。" />
          </div>
        </Section>

        {/* フェーズ */}
        <Section title="3つのフェーズ">
          <PhaseCard label="pre-preローンチ" color="#C47A5A"
            items={['認知・問題提起フェーズ', '悩み共感・危機感・あるある', 'まだ商品のことは出さない', 'ターゲットの問題意識を高める']} />
          <PhaseCard label="preローンチ" color="#C8A96E"
            items={['解決策提示・期待値上げフェーズ', '成功事例・理想像・証明', '解決策の存在を匂わせる', '期待値を上げる（煽りすぎない）']} />
          <PhaseCard label="ローンチ期間" color="#7B9E87"
            items={['セミナー誘導・クロージングフェーズ', '限定性・後悔回避・CTA', '「今動かないと」という緊急性', '明確なCTAを入れる']} />
        </Section>

        {/* 機能説明 */}
        <Section title="各機能の使い方">
          <SubSection title="バリエーション生成">
            <p className="text-sm text-[#A09080]">
              投稿を作成した後、ヘッダーの「バリエーション」ボタンをクリック。
              同じテーマから共感切り口・危機感切り口・ストーリー切り口の3パターンを自動生成します。
              同じメッセージを角度を変えて繰り返し刷り込むのに使います。
            </p>
          </SubSection>

          <SubSection title="スワイプファイル">
            <p className="text-sm text-[#A09080]">
              過去に反応が良かった投稿を保存する機能です。ダッシュボードの「スワイプファイル」から追加。
              カテゴリ（共感系・教育系・CTA系等）で分類できます。
              投稿作成時にAIが参考にして、構造やトーンを学習します。
            </p>
          </SubSection>

          <SubSection title="CTAテンプレート">
            <p className="text-sm text-[#A09080]">
              プロジェクト設定画面でフェーズごとにCTAテンプレートを登録できます。
              「残り○枠」「プロフィールのリンクから」等、よく使うCTAを事前登録しておくと
              AIが投稿末尾に自然に組み込みます。
            </p>
          </SubSection>

          <SubSection title="投稿チェーン">
            <p className="text-sm text-[#A09080]">
              カレンダーで複数の投稿を連鎖として設計します。
              例: Day1 X問題提起 → Day2 IG共感 → Day3 メール解決策 → Day4 LINE CTA。
              1つのメッセージを媒体をまたいで段階的に届ける設計です。
            </p>
          </SubSection>

          <SubSection title="タスク管理">
            <p className="text-sm text-[#A09080]">
              ヘッダーに進捗バーが表示されます。カレンダーのスロット数に対して、
              確定・投稿済みの投稿数の割合を表示。
              一覧ビューではステータスの変更がワンクリックでできます。
            </p>
          </SubSection>
        </Section>

        {/* AIの特徴 */}
        <Section title="AIの特徴">
          <TipCard emoji="🎯" title="マーケティング知識内蔵">
            PAS、AIDA、QUEST等のフレームワーク、プリンセスマーケティング、認知バイアス活用など、
            マーケティング・コピーライティングの専門知識が内蔵されています。
          </TipCard>
          <TipCard emoji="📝" title="コンセプト完全準拠">
            コンセプトシートのターゲット像・OK/NG表現・トーンを完全に守ります。
            「その人らしさ」を崩さず、ターゲットに刺さる文章を生成します。
          </TipCard>
          <TipCard emoji="📱" title="媒体自動調整">
            同じテーマでも、LINEなら短文クリティカル、メールなら1000字の教育型、
            Xなら余韻を残すワンパンチと、媒体に最適化された文章を生成します。
          </TipCard>
        </Section>

        <div className="border-t border-[#2A2520] mt-12 pt-8 text-center">
          <p className="text-[11px] text-[#4A4840]">
            投稿作成ツール — by m-create
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-sm text-[#C8A96E] font-medium mb-4 pb-2 border-b border-[#2A2520]">{title}</h2>
      {children}
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 pl-3 border-l-2 border-[#2A2520]">
      <h3 className="text-sm text-[#E0D8C8] mb-2">{title}</h3>
      {children}
    </div>
  );
}

function StepList({ steps }: { steps: { num: string; title: string; desc: string }[] }) {
  return (
    <div className="space-y-3">
      {steps.map(step => (
        <div key={step.num} className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-[#C8A96E] text-[#0D0D0D] flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
            {step.num}
          </div>
          <div>
            <div className="text-sm text-[#E0D8C8] font-medium">{step.title}</div>
            <div className="text-[12px] text-[#8A8070] mt-0.5">{step.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PhaseCard({ label, color, items }: { label: string; color: string; items: string[] }) {
  return (
    <div className="mb-3 bg-[#161412] border border-[#2A2520] rounded-md overflow-hidden">
      <div className="px-4 py-2.5" style={{ borderLeft: `3px solid ${color}` }}>
        <span className="text-xs" style={{ color }}>{label}</span>
      </div>
      <div className="px-4 pb-3">
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-[12px] text-[#8A8070] flex items-start gap-1.5">
              <span className="text-[#4A4840] mt-1">·</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MediaCard({ icon, name, desc }: { icon: string; name: string; desc: string }) {
  return (
    <div className="bg-[#161412] border border-[#2A2520] rounded-md px-3 py-2.5">
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-xs text-[#E0D8C8]">{name}</span>
      </div>
      <div className="text-[11px] text-[#6A6058]">{desc}</div>
    </div>
  );
}

function TipCard({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex gap-3 bg-[#161412] border border-[#2A2520] rounded-md px-4 py-3">
      <span className="text-lg flex-shrink-0">{emoji}</span>
      <div>
        <div className="text-sm text-[#E0D8C8] font-medium mb-1">{title}</div>
        <div className="text-[12px] text-[#8A8070]">{children}</div>
      </div>
    </div>
  );
}
