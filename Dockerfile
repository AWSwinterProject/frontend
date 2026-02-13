FROM nginx:alpine

# 정적 파일 전체를 nginx 기본 웹 루트로 복사
COPY . /usr/share/nginx/html

EXPOSE 80
