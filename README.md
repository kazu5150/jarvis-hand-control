# Jervis Hand Control

Jervis Hand Controlは、Webカメラを使用してハンドジェスチャーで3Dオブジェクトを操作できるWebアプリケーションです。MediaPipeによるリアルタイムハンドトラッキングとThree.jsによる3Dレンダリングを組み合わせ、SF映画のようなJ.A.R.V.I.S.風のインターフェースを実現しています。
さらに、ElevenLabsを使用した音声対話機能を搭載しており、AIエージェントと自然な会話を楽しむことができます。

## 特徴

- **リアルタイムハンドトラッキング**: MediaPipe Hand Landmarkerを使用し、Webカメラ映像から高速かつ高精度に手の動きを検出します。
- **ジェスチャー操作**: 親指と人差し指をつまむ（ピンチ）動作で、3D空間上のオブジェクトを掴んで移動させることができます。
- **音声対話 (Voice Chat)**: ElevenLabsのConversational AIを使用し、音声でAIエージェントと対話できます。
- **会話ログ表示**: AIとの会話内容がリアルタイムで画面に表示され、自動スクロールで常に最新の会話を確認できます。
- **3Dビジュアライゼーション**: React Three Fiber (Three.js) を使用した美しい3Dホログラム表示。
- **没入感のあるUI**: サイバーパンク/SFテイストのHUD（ヘッドアップディスプレイ）オーバーレイと、音声に反応するビジュアライザー。

## 技術スタック

- **フレームワーク**: [Next.js](https://nextjs.org/) (App Router)
- **ハンドトラッキング**: [MediaPipe Tasks Vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
- **音声AI**: [ElevenLabs React SDK](https://elevenlabs.io/docs/api-reference/streaming-react-sdk)
- **3Dレンダリング**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber), [Three.js](https://threejs.org/)
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/)
- **アニメーション**: [Framer Motion](https://www.framer.com/motion/)

## セットアップと実行

プロジェクトをローカルで実行するには、以下の手順に従ってください。

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/kazu5150/jarvis-hand-control.git
   cd jarvis-hand-control
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   # または
   yarn install
   # または
   pnpm install
   ```

3. **環境変数の設定**
   `.env.local`ファイルを作成し、ElevenLabsのAgent IDを設定します。
   ```bash
   NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_here
   ```

4. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

5. **ブラウザで確認**
   [http://localhost:3000](http://localhost:3000) にアクセスしてください。カメラとマイクの使用許可を求められるので、許可してください。

## 使い方

1. **ハンドコントロール**:
   - カメラに向かって手をかざします。
   - 画面上の3Dオブジェクト（正二十面体）に手を近づけます。
   - オブジェクトがオレンジ色に光ったら、親指と人差し指をつまむ（ピンチ）動作をします。
   - つまんだまま手を動かすと、オブジェクトを移動させることができます。
   - 指を離すとオブジェクトが解放されます。

2. **ボイスチャット**:
   - 画面右上のマイクアイコンをクリックして会話を開始します。
   - AIエージェントに話しかけると、音声とテキストで応答します。
   - 会話の内容は画面右側にテキストとして表示されます。
   - もう一度マイクアイコンをクリックすると会話を終了します。

## ライセンス

This project is licensed under the MIT License.
