vue:
	npm run serve --prefix ./ui
redis:
	docker run --name junior_dev_framework_dev_redis -p 6379:6379 -d redis  
postgres:
	docker run --name junior_dev_framework_dev_postgres -p 5432:5432 -e POSTGRES_PASSWORD=test -d postgres
seed:
	SCHEMA_VERSION=v2 node -e "const c = require('./lib/postgres/connector.js'); c.insertAndSeed();"
db:
	make postgres
	sleep 2
	make seed
	make redis
wake/db:
	docker start junior_dev_framework_dev_postgres
	docker start junior_dev_framework_dev_redis
wake:
	make wake/db
	make serve
test:
	npm t --prefix ./lib
	npm t --prefix ./job_runner
	# npm t --prefix ./server
	# npm run test:unit  --prefix ./ui
serve:
	SCHEMA_VERSION=v2 LOCAL_MODE=true npm run start --prefix ./server
serve/dev:
	SCHEMA_VERSION=v2 LOCAL_MODE=true npm run start:dev --prefix ./server
serve/mock:
	SCHEMA_VERSION=v2 LOCAL_MODE=true npm run start:mock --prefix ./server
ahab: # This will kill all containers, running or not. DO NOT run this unless you are certain that you need no data in a postgres container!!!
	bash scripts/ahab.sh
lint:
	npm run lint --prefix ./server
	npm run lint --prefix ./ui
	npm run lint --prefix ./job_runner
	npm run lint --prefix ./lib
install:
	npm i
	npm i --prefix ./server
	npm i --prefix ./ui
	npm i --prefix ./job_runner
	npm i --prefix ./lib
images:
	docker build -t junior_dev_framework_server:latest ./server
backend:
	docker-compose up -d -f ./local-docker-compose.yml
stack:
	docker-compose up -d
list:
	node -e "const { getAllJobListings } = require('./server/lib/postgres/connector.js'); getAllJobListings();"
psql:
	docker exec -it junior_dev_framework_dev_postgres psql -U postgres
user_listings:
	USER_ID=1 npm run --prefix ./job_runner start create_user_listings
scan:
	USER_ID=1 npm run --prefix ./job_runner start scan_emails
oaserve:
	npx nodemon -x 'node -e "const { bootServer } = require(\"./oauth_server\"); bootServer();"'
build/prod:
	echo "coming soon"
