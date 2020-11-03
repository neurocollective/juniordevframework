vue:
	make library
	npm run serve --prefix ./ui
redis:
	docker run --name junior_dev_framework_dev_redis -p 6379:6379 -d redis  
postgres:
	docker run --name junior_dev_framework_dev_postgres -p 5432:5432 -e POSTGRES_PASSWORD=test -d postgres
seed:
	node -e "const c = require('./server/lib/postgres/connector.js'); c.insertAndSeed();"
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
	make library
test:
	npm t --prefix ./lib
	npm t --prefix ./job_runner
	# npm t --prefix ./server
	# npm run test:unit  --prefix ./ui
serve:
	make library
	# LOCAL_MODE=true npx nodemon -x "node -e \"const bootServer = require('./server'); bootServer();\""
	LOCAL_MODE=true node -e "const bootServer = require('./server'); bootServer();"
library:
	cp -r ./lib/ ./server/
	cp -r ./lib/ ./ui/src/
	cp -r ./lib/ ./job_runner/
ahab: # This will kill all containers, running or not. DO NOT run this unless you are certain that you need no data in a postgres container!!!
	bash scripts/ahab.sh
install:
	npm i --prefix ./server
	npm i --prefix ./ui
	npm i --prefix ./job_runner
	npm i --prefix ./lib # only installs jest TODO - can we remove dependencies and package.json from /lib?
	make library
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
	node ./job_runner create_user_listings
scan:
	node ./job_runner scan
oaserve:
	npx nodemon -x 'node -e "const { bootServer } = require(\"./oauth_server\"); bootServer();"'
build/prod:
	echo "coming soon"
