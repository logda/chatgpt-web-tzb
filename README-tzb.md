

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
#### Docker build


```bash
docker build -t chatgpt-web-tzb:1.0 .
docker run -it --rm chatgpt-web-tmp /bin/sh


```

#### Docker Run
```bash
# 内网
docker run --name chatgpt-web-tzb --rm -it -p 8505:3002 --env OPENAI_API_KEY=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 --env LOG_PATH=/logs -v /home/llm/20240116/logs:/logs chatgpt-web-tzb:1.0
# 外网
docker run --name chatgpt-web-tzb --rm -it -p 8505:3002 --env OPENAI_API_KEY=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 --env LOG_PATH=/logs -v /Users/caiyida/代码/01_代码_工作/20240122_台州银行大模型前端/logs:/logs chatgpt-web-tzb:1.0



```
