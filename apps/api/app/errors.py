from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from postgrest.exceptions import APIError

# Postgres error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
PG_STATUS = {
    "23505": 409,  # unique_violation (e.g. headword already exists)
    "42501": 403,  # insufficient_privilege (RLS)
}


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(APIError)
    async def postgrest_error(_: Request, exc: APIError) -> JSONResponse:
        status = PG_STATUS.get(exc.code or "", 500)
        detail = "Zapis već postoji" if status == 409 else exc.message or "Greška baze"
        return JSONResponse(status_code=status, content={"detail": detail})
