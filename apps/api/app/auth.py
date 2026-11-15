from dataclasses import dataclass
from functools import lru_cache
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings

ADMIN_PERMISSION = "Dictionary.ReadWrite"

# Only asymmetric algorithms: tokens signed with the legacy shared HS256 secret are rejected.
ALLOWED_ALGORITHMS = ["ES256", "RS256"]

bearer = HTTPBearer(auto_error=False, description="Supabase access token")


@dataclass(frozen=True)
class User:
    id: str
    email: str | None
    permission: str | None
    token: str


@lru_cache
def get_jwks_client() -> jwt.PyJWKClient:
    settings = get_settings()
    return jwt.PyJWKClient(
        f"{settings.supabase_url}/auth/v1/.well-known/jwks.json",
        headers={"apikey": settings.supabase_anon_key},
        cache_jwk_set=True,
        lifespan=600,
        timeout=5,
    )


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> User:
    """Verify a Supabase access token against the project's published signing keys."""
    if credentials is None:
        raise _unauthorized("Potrebna je prijava")

    token = credentials.credentials
    issuer = f"{get_settings().supabase_url}/auth/v1"

    try:
        signing_key = get_jwks_client().get_signing_key_from_jwt(token)
    except jwt.PyJWKClientConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Provjera prijave trenutno nije dostupna",
        ) from e
    except (jwt.PyJWKClientError, jwt.PyJWKSetError, jwt.DecodeError) as e:
        # Unknown kid, no published signing keys, or malformed token
        raise _unauthorized("Neispravan token") from e

    try:
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=ALLOWED_ALGORITHMS,
            audience="authenticated",
            issuer=issuer,
            options={"require": ["exp", "iat", "sub", "aud", "iss"]},
        )
    except jwt.ExpiredSignatureError as e:
        raise _unauthorized("Token je istekao") from e
    except jwt.InvalidTokenError as e:
        raise _unauthorized("Neispravan token") from e

    return User(
        id=claims["sub"],
        email=claims.get("email"),
        permission=claims.get("user_permission"),
        token=token,
    )


def require_admin(user: Annotated[User, Depends(get_current_user)]) -> User:
    if user.permission != ADMIN_PERMISSION:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Nemate pristup")
    return user


Admin = Annotated[User, Depends(require_admin)]
"""Use as a parameter when the endpoint needs the user, e.g. `def f(user: Admin)`."""

AdminOnly = [Depends(require_admin)]
"""Use as `dependencies=AdminOnly` when the endpoint only needs to be guarded."""
