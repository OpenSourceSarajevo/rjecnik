from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

ADMIN_PERMISSION = "Dictionary.ReadWrite"

bearer = HTTPBearer(auto_error=False, description="Supabase access token")


def require_admin(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> None:
    """Guard for admin-only endpoints.

    TODO: verify the Supabase JWT and check its `user_permission` claim equals
    ADMIN_PERMISSION (raise 403 otherwise). Until then every request is rejected,
    so nothing behind this guard is reachable with an unverified token.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Potrebna je prijava",
            headers={"WWW-Authenticate": "Bearer"},
        )
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Autentifikacija nije implementirana",
    )


AdminOnly = [Depends(require_admin)]
