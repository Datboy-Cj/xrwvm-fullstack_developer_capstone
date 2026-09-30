# fullstack_developer_capstone

Best Cars is a dealership directory and review application built with React, Django, Express, MongoDB, SQLite and a Flask/VADER sentiment service.

## Run

`docker compose up --build` starts the app at http://localhost:8000. The database service seeds the licensed sample dealerships only when empty. Run `docker compose exec web python manage.py createsuperuser` for an admin account. Register an ordinary account in the app to post reviews.

## Architecture

Django handles authentication, car makes/models, and API proxying. Express stores dealerships and reviews in MongoDB. Flask analyzes review sentiment using the bundled VADER lexicon. React provides registration, login, filtering, dealer details and review forms. SQLite and MongoDB use persistent volumes locally.

## Validation

Run `python manage.py test` from server, `npm test` from server/database, and `npm run build` from server/frontend. GitHub Actions executes these checks on pushes and pull requests.

Based on IBM Skills Network's Apache-2.0 starter. Implementation and validation use coding assistance; no claim of independent authorship is made. Team/contact details are fictional demonstration content. Never use real customer data in this course deployment.

### Course Kubernetes sandbox

`server/deployment.yaml` uses temporary storage because the lab quota disallows persistent volume claims. Back up `/data/db.sqlite3` before recreating the Pod. The lab workspace and port-forward URL are temporary; a production deployment needs durable database storage and a permanent ingress.
