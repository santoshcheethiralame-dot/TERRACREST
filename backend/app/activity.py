"""The single writer for the audit trail. Routers call `log(...)` after a
consequential action; the operations centre reads the events back in reverse
chronological order."""

import datetime as dt
import uuid

from sqlalchemy.orm import Session

from . import models


def log(
    db: Session,
    *,
    kind: str,
    summary: str,
    actor_name: str,
    actor_id: str | None = None,
    listing_id: str | None = None,
) -> models.ActivityEvent:
    event = models.ActivityEvent(
        id=str(uuid.uuid4()),
        actor_id=actor_id,
        actor_name=actor_name,
        kind=kind,
        listing_id=listing_id,
        summary=summary,
        created_at=dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
    )
    db.add(event)
    db.commit()
    return event
