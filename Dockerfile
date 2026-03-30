# 開発環境用 Dockerfile
# Node.js 20 Alpine をベースに Next.js 開発サーバーを起動する

FROM node:20-alpine

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係のインストール（package.jsonとlockfileだけ先にコピーしてキャッシュを活用）
COPY package.json package-lock.json* ./

RUN npm install

# ソースコードはdocker-compose.ymlのボリュームマウントで提供されるため
# COPY は行わない（開発環境ではホットリロードのためにマウントを使う）

EXPOSE 3000

CMD ["npm", "run", "dev"]
