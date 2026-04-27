# Deployment

This covers how I'd deploy this app on AWS. The backend is containerised and runs on ECS Fargate. The frontend is a static build that can go on S3 + CloudFront.

---

## Backend

### 1. Build and push the Docker image

The `backend/Dockerfile` does a two-stage build — compiles TypeScript in the first stage, then copies only the built output and production dependencies into a clean runtime image.

```bash
cd backend
docker build -t query-llm-backend .

# Push to ECR
aws ecr create-repository --repository-name query-llm-backend --region ap-south-1
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com
docker tag query-llm-backend:latest <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/query-llm-backend:latest
docker push <ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/query-llm-backend:latest
```

### 2. Secrets

`OPENAI_API_KEY` and `JWT_SECRET` go into AWS Secrets Manager. Everything else (`PORT`, `LLM_MODEL`, `CORS_ORIGIN`, etc.) can be plain environment variables in the ECS task definition.

```bash
aws secretsmanager create-secret --name query-llm/openai-api-key --secret-string "sk-..."
aws secretsmanager create-secret --name query-llm/jwt-secret --secret-string "your-secret"
```

### 3. Run on ECS Fargate

Create an ECS cluster, register a task definition pointing at the ECR image (reference the Secrets Manager ARNs for sensitive values), then create a Fargate service with the desired count.

Put an **Application Load Balancer** in front for HTTPS. One thing to note: since `/api/query` streams responses via SSE, set the ALB's idle timeout to at least 120 seconds — the default 60 s will cut long responses short.

Logs go to CloudWatch via the `awslogs` driver. Worth setting up alarms on 5xx rate and response time.

### 4. DNS

Point your domain to the ALB using a Route 53 alias record. Use ACM for the TLS certificate.

---

## Frontend

```bash
cd frontend
npm run build   # outputs to dist/
```

Upload `dist/` to an S3 bucket and serve it through CloudFront. Set `VITE_API_URL` to your backend's domain before building.

---

## Notes

- I haven't actually deployed this — the above is the approach I'd take.
- For a real production setup I'd also add autoscaling on the ECS service and a CI/CD pipeline (e.g. GitHub Actions triggering `aws ecs update-service --force-new-deployment` on push to main).
