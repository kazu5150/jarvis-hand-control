# Jervis Hand Control

Jervis Hand Controlは、Webカメラを使用してハンドジェスチャーで3Dオブジェクトを操作できるWebアプリケーションです。MediaPipeによるリアルタイムハンドトラッキングとThree.jsによる3Dレンダリングを組み合わせ、SF映画のようなJ.A.R.V.I.S.風のインターフェースを実現しています。

## 特徴

- **リアルタイムハンドトラッキング**: MediaPipe Hand Landmarkerを使用し、Webカメラ映像から高速かつ高精度に手の動きを検出します。
- **ジェスチャー操作**: 親指と人差し指をつまむ（ピンチ）動作で、3D空間上のオブジェクトを掴んで移動させることができます。
- **3Dビジュアライゼーション**: React Three Fiber (Three.js) を使用した美しい3Dホログラム表示。
- **没入感のあるUI**: サイバーパンク/SFテイストのHUD（ヘッドアップディスプレイ）オーバーレイ。

## 技術スタック

- **フレームワーク**: [Next.js](https://nextjs.org/) (App Router)
- **ハンドトラッキング**: [MediaPipe Tasks Vision](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
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

3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

4. **ブラウザで確認**
   [http://localhost:3000](http://localhost:3000) にアクセスしてください。カメラの使用許可を求められるので、許可してください。

## 使い方

1. カメラに向かって手をかざします。
2. 画面上の3Dオブジェクト（正二十面体）に手を近づけます。
3. オブジェクトがオレンジ色に光ったら、親指と人差し指をつまむ（ピンチ）動作をします。
4. つまんだまま手を動かすと、オブジェクトを移動させることができます。
5. 指を離すとオブジェクトが解放されます。

## ライセンス

This project is licensed under the MIT License.
