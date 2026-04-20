from sqlalchemy import Integer, SmallInteger, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class CareerTrackModule(Base):
    __tablename__ = "career_track_modules"
    __table_args__ = (UniqueConstraint("track_id", "module_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    track_id: Mapped[int] = mapped_column(Integer, ForeignKey("career_tracks.track_id"), nullable=False)
    module_id: Mapped[int] = mapped_column(Integer, ForeignKey("modules.module_id"), nullable=False)
    sequence_order: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=1)

    track: Mapped["CareerTrack"] = relationship("CareerTrack", back_populates="track_modules")
    module: Mapped["Module"] = relationship("Module")
